"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createGroup(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;

  if (!name || name.trim().length === 0) {
    throw new Error("Group name is required");
  }

  // Ensure user exists in our DB
  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email || "",
      name: user.user_metadata?.name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
    },
    create: {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
    },
  });

  // Create the group with the user as admin
  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      members: {
        create: {
          userId: user.id,
          role: "ADMIN",
        },
      },
    },
  });

  revalidatePath("/dashboard");
  redirect(`/groups/${group.id}`);
}

export async function getUserGroups() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          expenses: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return groups;
}

export async function getTotalBalances() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { youOwe: 0, youAreOwed: 0, pendingDebts: [] };
  }

  // Get all groups user is in
  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: { userId: user.id },
      },
    },
    include: {
      expenses: {
        include: {
          paidBy: true,
          shares: {
            include: { user: true },
          },
        },
      },
      settlements: {
        include: {
          fromUser: true,
          toUser: true,
        },
      },
      members: {
        include: { user: true },
      },
    },
  });

  let youOwe = 0;
  let youAreOwed = 0;
  const pendingDebts: {
    groupId: string;
    groupName: string;
    person: { id: string; name: string | null; email: string };
    amount: number;
    youOwe: boolean;
  }[] = [];

  for (const group of groups) {
    // Calculate balances for this group
    const balances: Record<string, number> = {};

    // Process expenses
    for (const expense of group.expenses) {
      const paidById = expense.paidById;
      if (!balances[paidById]) balances[paidById] = 0;
      balances[paidById] += Number(expense.amount);

      for (const share of expense.shares) {
        if (!balances[share.userId]) balances[share.userId] = 0;
        balances[share.userId] -= Number(share.amount);
      }
    }

    // Process settlements
    for (const settlement of group.settlements) {
      if (!balances[settlement.fromUserId]) balances[settlement.fromUserId] = 0;
      if (!balances[settlement.toUserId]) balances[settlement.toUserId] = 0;
      balances[settlement.fromUserId] += Number(settlement.amount);
      balances[settlement.toUserId] -= Number(settlement.amount);
    }

    // Generate simplified debts for this group
    const creditors: { user: { id: string; name: string | null; email: string }; amount: number }[] = [];
    const debtors: { user: { id: string; name: string | null; email: string }; amount: number }[] = [];

    for (const member of group.members) {
      const balance = balances[member.userId] || 0;
      if (balance > 0.01) {
        creditors.push({ user: { id: member.user.id, name: member.user.name, email: member.user.email }, amount: balance });
      } else if (balance < -0.01) {
        debtors.push({ user: { id: member.user.id, name: member.user.name, email: member.user.email }, amount: Math.abs(balance) });
      }
    }

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      if (amount > 0.01) {
        // Check if current user is involved
        if (debtor.user.id === user.id) {
          youOwe += amount;
          pendingDebts.push({
            groupId: group.id,
            groupName: group.name,
            person: creditor.user,
            amount: Math.round(amount * 100) / 100,
            youOwe: true,
          });
        } else if (creditor.user.id === user.id) {
          youAreOwed += amount;
          pendingDebts.push({
            groupId: group.id,
            groupName: group.name,
            person: debtor.user,
            amount: Math.round(amount * 100) / 100,
            youOwe: false,
          });
        }
      }

      debtor.amount -= amount;
      creditor.amount -= amount;
      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }
  }

  return {
    youOwe: Math.round(youOwe * 100) / 100,
    youAreOwed: Math.round(youAreOwed * 100) / 100,
    pendingDebts: pendingDebts.sort((a, b) => b.amount - a.amount),
  };
}

export async function getRecentActivity() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const expenses = await prisma.expense.findMany({
    where: {
      group: {
        members: {
          some: { userId: user.id },
        },
      },
    },
    include: {
      paidBy: true,
      group: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return expenses.map(e => ({
    id: e.id,
    description: e.description,
    amount: Number(e.amount),
    paidBy: { id: e.paidBy.id, name: e.paidBy.name, email: e.paidBy.email },
    group: { id: e.group.id, name: e.group.name },
    date: e.date,
  }));
}

export async function joinGroupByInvite(inviteCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const group = await prisma.group.findUnique({
    where: { inviteCode },
    include: {
      members: {
        where: { userId: user.id },
      },
    },
  });

  if (!group) {
    throw new Error("Invalid invite code");
  }

  // Already a member
  if (group.members.length > 0) {
    redirect(`/groups/${group.id}`);
  }

  // Ensure user exists in our DB
  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email || "",
      name: user.user_metadata?.name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
    },
    create: {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
    },
  });

  // Add user to group
  await prisma.groupMember.create({
    data: {
      userId: user.id,
      groupId: group.id,
      role: "MEMBER",
    },
  });

  revalidatePath("/dashboard");
  redirect(`/groups/${group.id}`);
}
