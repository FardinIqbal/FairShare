"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CustomSplit {
  userId: string;
  amount: number;
}

export async function addExpense(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const groupId = formData.get("groupId") as string;
  const description = formData.get("description") as string;
  const amountStr = formData.get("amount") as string;
  const category = formData.get("category") as string | null;
  const splitType = (formData.get("splitType") as string) || "EQUAL";
  const customSplitsJson = formData.get("customSplits") as string | null;
  const includedMembersJson = formData.get("includedMembers") as string | null;

  if (!groupId || !description || !amountStr) {
    throw new Error("Missing required fields");
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount");
  }

  // Verify user is a member of this group
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: user.id,
        groupId,
      },
    },
  });

  if (!membership) {
    throw new Error("Not a member of this group");
  }

  // Get all group members
  const allMembers = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });

  let shares: { userId: string; amount: number }[] = [];

  if (splitType === "CUSTOM" && customSplitsJson) {
    // Custom split - use provided amounts
    const customSplits: CustomSplit[] = JSON.parse(customSplitsJson);

    // Validate that custom splits add up to total amount
    const totalSplit = customSplits.reduce((sum, s) => sum + s.amount, 0);
    if (Math.abs(totalSplit - amount) > 0.01) {
      throw new Error(`Custom splits ($${totalSplit.toFixed(2)}) must equal total amount ($${amount.toFixed(2)})`);
    }

    shares = customSplits.filter(s => s.amount > 0);
  } else {
    // Equal split among included members
    let includedMembers = allMembers;

    if (includedMembersJson) {
      const includedIds: string[] = JSON.parse(includedMembersJson);
      includedMembers = allMembers.filter(m => includedIds.includes(m.userId));
    }

    if (includedMembers.length === 0) {
      throw new Error("At least one member must be included in the expense");
    }

    const shareAmount = amount / includedMembers.length;
    shares = includedMembers.map((member) => ({
      userId: member.userId,
      amount: shareAmount,
    }));
  }

  await prisma.expense.create({
    data: {
      description: description.trim(),
      amount,
      paidById: user.id,
      groupId,
      category: category || null,
      splitType: splitType as "EQUAL" | "CUSTOM",
      shares: {
        create: shares,
      },
    },
  });

  revalidatePath(`/groups/${groupId}`);
}

export async function updateExpense(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const expenseId = formData.get("expenseId") as string;
  const description = formData.get("description") as string;
  const amountStr = formData.get("amount") as string;
  const category = formData.get("category") as string | null;
  const splitType = (formData.get("splitType") as string) || "EQUAL";
  const customSplitsJson = formData.get("customSplits") as string | null;
  const includedMembersJson = formData.get("includedMembers") as string | null;

  if (!expenseId || !description || !amountStr) {
    throw new Error("Missing required fields");
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount");
  }

  // Get expense and verify ownership
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { group: { include: { members: true } } },
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  // Verify user is a member of the group
  const isMember = expense.group.members.some(m => m.userId === user.id);
  if (!isMember) {
    throw new Error("Not a member of this group");
  }

  // Only the payer can edit the expense
  if (expense.paidById !== user.id) {
    throw new Error("Only the person who paid can edit this expense");
  }

  const allMembers = expense.group.members;
  let shares: { userId: string; amount: number }[] = [];

  if (splitType === "CUSTOM" && customSplitsJson) {
    const customSplits: CustomSplit[] = JSON.parse(customSplitsJson);
    const totalSplit = customSplits.reduce((sum, s) => sum + s.amount, 0);
    if (Math.abs(totalSplit - amount) > 0.01) {
      throw new Error(`Custom splits ($${totalSplit.toFixed(2)}) must equal total amount ($${amount.toFixed(2)})`);
    }
    shares = customSplits.filter(s => s.amount > 0);
  } else {
    let includedMembers = allMembers;
    if (includedMembersJson) {
      const includedIds: string[] = JSON.parse(includedMembersJson);
      includedMembers = allMembers.filter(m => includedIds.includes(m.userId));
    }
    if (includedMembers.length === 0) {
      throw new Error("At least one member must be included in the expense");
    }
    const shareAmount = amount / includedMembers.length;
    shares = includedMembers.map((member) => ({
      userId: member.userId,
      amount: shareAmount,
    }));
  }

  // Update expense and recreate shares
  await prisma.$transaction([
    // Delete old shares
    prisma.expenseShare.deleteMany({
      where: { expenseId },
    }),
    // Update expense
    prisma.expense.update({
      where: { id: expenseId },
      data: {
        description: description.trim(),
        amount,
        category: category || null,
        splitType: splitType as "EQUAL" | "CUSTOM",
      },
    }),
    // Create new shares
    prisma.expenseShare.createMany({
      data: shares.map(s => ({
        expenseId,
        userId: s.userId,
        amount: s.amount,
      })),
    }),
  ]);

  revalidatePath(`/groups/${expense.groupId}`);
}

export async function deleteExpense(expenseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { group: { include: { members: true } } },
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  // Verify user is a member of the group
  const isMember = expense.group.members.some(m => m.userId === user.id);
  if (!isMember) {
    throw new Error("Not a member of this group");
  }

  // Only the payer can delete the expense
  if (expense.paidById !== user.id) {
    throw new Error("Only the person who paid can delete this expense");
  }

  await prisma.expense.delete({
    where: { id: expenseId },
  });

  revalidatePath(`/groups/${expense.groupId}`);
}

// Calculate who owes what to whom (simplified balances)
export async function calculateBalances(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get all expenses
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: {
      paidBy: true,
      shares: {
        include: {
          user: true,
        },
      },
    },
  });

  // Get all settlements
  const settlements = await prisma.settlement.findMany({
    where: { groupId },
    include: {
      fromUser: true,
      toUser: true,
    },
  });

  // Track net balance for each user
  // Positive = they are owed money, Negative = they owe money
  const balances: Record<string, { user: { id: string; name: string | null; email: string }; balance: number }> = {};

  // Process expenses
  for (const expense of expenses) {
    const paidById = expense.paidById;
    const payer = expense.paidBy;

    // Initialize payer if not exists
    if (!balances[paidById]) {
      balances[paidById] = {
        user: { id: payer.id, name: payer.name, email: payer.email },
        balance: 0,
      };
    }

    // Payer paid the full amount, so they are owed
    balances[paidById].balance += Number(expense.amount);

    // Each person with a share owes their portion
    for (const share of expense.shares) {
      if (!balances[share.userId]) {
        balances[share.userId] = {
          user: { id: share.user.id, name: share.user.name, email: share.user.email },
          balance: 0,
        };
      }
      balances[share.userId].balance -= Number(share.amount);
    }
  }

  // Process settlements
  for (const settlement of settlements) {
    const fromId = settlement.fromUserId;
    const toId = settlement.toUserId;
    const amount = Number(settlement.amount);

    // Initialize users if not exists
    if (!balances[fromId]) {
      balances[fromId] = {
        user: { id: settlement.fromUser.id, name: settlement.fromUser.name, email: settlement.fromUser.email },
        balance: 0,
      };
    }
    if (!balances[toId]) {
      balances[toId] = {
        user: { id: settlement.toUser.id, name: settlement.toUser.name, email: settlement.toUser.email },
        balance: 0,
      };
    }

    // Settlement: fromUser paid toUser, so fromUser is owed more (or owes less)
    // and toUser owes more (or is owed less)
    balances[fromId].balance += amount;
    balances[toId].balance -= amount;
  }

  return Object.values(balances);
}

// Generate simplified debts (who pays whom)
export async function getSimplifiedDebts(groupId: string) {
  const balancesList = await calculateBalances(groupId);

  const creditors: { user: { id: string; name: string | null; email: string }; amount: number }[] = [];
  const debtors: { user: { id: string; name: string | null; email: string }; amount: number }[] = [];

  for (const b of balancesList) {
    if (b.balance > 0.01) {
      creditors.push({ user: b.user, amount: b.balance });
    } else if (b.balance < -0.01) {
      debtors.push({ user: b.user, amount: Math.abs(b.balance) });
    }
  }

  // Sort by amount (descending)
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  // Generate simplified transactions
  const transactions: {
    from: { id: string; name: string | null; email: string };
    to: { id: string; name: string | null; email: string };
    amount: number;
  }[] = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      transactions.push({
        from: debtor.user,
        to: creditor.user,
        amount: Math.round(amount * 100) / 100,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
}

// Settle a debt between two users
export async function settleDebt(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const groupId = formData.get("groupId") as string;
  const toUserId = formData.get("toUserId") as string;
  const amountStr = formData.get("amount") as string;

  if (!groupId || !toUserId || !amountStr) {
    throw new Error("Missing required fields");
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount");
  }

  // Verify user is a member of this group
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: user.id,
        groupId,
      },
    },
  });

  if (!membership) {
    throw new Error("Not a member of this group");
  }

  // Verify the other user is also a member
  const toUserMembership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: toUserId,
        groupId,
      },
    },
  });

  if (!toUserMembership) {
    throw new Error("The other user is not a member of this group");
  }

  // Create the settlement
  await prisma.settlement.create({
    data: {
      groupId,
      fromUserId: user.id,
      toUserId,
      amount,
    },
  });

  revalidatePath(`/groups/${groupId}`);
}

// Get settlement history for a group
export async function getSettlements(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const settlements = await prisma.settlement.findMany({
    where: { groupId },
    include: {
      fromUser: true,
      toUser: true,
    },
    orderBy: {
      settledAt: "desc",
    },
  });

  return settlements.map(s => ({
    id: s.id,
    from: { id: s.fromUser.id, name: s.fromUser.name, email: s.fromUser.email },
    to: { id: s.toUser.id, name: s.toUser.name, email: s.toUser.email },
    amount: Number(s.amount),
    settledAt: s.settledAt,
  }));
}
