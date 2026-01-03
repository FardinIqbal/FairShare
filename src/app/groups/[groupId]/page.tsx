import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getSimplifiedDebts } from "@/lib/actions/expenses";
import { ThemeToggle } from "@/components/theme-toggle";
import { AddExpenseForm } from "@/components/add-expense-form";
import { SettleUpCard } from "@/components/settle-up-card";
import { ExpenseItem } from "@/components/expense-item";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GroupPage({ params }: PageProps) {
  const { groupId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Verify membership and get group data
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      expenses: {
        include: {
          paidBy: true,
          shares: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: 20,
      },
    },
  });

  if (!group) {
    notFound();
  }

  const isMember = group.members.some((m) => m.userId === user.id);
  if (!isMember) {
    redirect("/dashboard");
  }

  const debts = await getSimplifiedDebts(groupId);
  const currentUserDebts = debts.filter((d) => d.from.id === user.id || d.to.id === user.id);

  // Calculate totals
  const totalExpenses = group.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const youOwe = currentUserDebts
    .filter((d) => d.from.id === user.id)
    .reduce((sum, d) => sum + d.amount, 0);
  const owedToYou = currentUserDebts
    .filter((d) => d.to.id === user.id)
    .reduce((sum, d) => sum + d.amount, 0);

  // Format members for components
  const membersForComponents = group.members.map((m) => ({
    id: m.id,
    userId: m.userId,
    user: {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
    },
  }));

  // Format expenses for components
  const expensesForComponents = group.expenses.map((e) => ({
    id: e.id,
    description: e.description,
    amount: Number(e.amount),
    category: e.category,
    splitType: e.splitType,
    date: e.date,
    paidBy: {
      id: e.paidBy.id,
      name: e.paidBy.name,
      email: e.paidBy.email,
    },
    shares: e.shares.map((s) => ({
      userId: s.userId,
      amount: Number(s.amount),
      user: {
        id: s.user.id,
        name: s.user.name,
        email: s.user.email,
      },
    })),
  }));

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[var(--accent)] flex items-center justify-center">
                <span className="text-white font-serif text-lg">F</span>
              </div>
              <span className="font-serif text-lg text-[var(--foreground)]">FairShare</span>
            </Link>
            <span className="text-[var(--foreground-tertiary)]">/</span>
            <span className="font-medium text-[var(--foreground)]">{group.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back to dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-md bg-[var(--accent)] flex items-center justify-center">
                <span className="text-white font-serif text-2xl">{group.name[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.15em] text-[var(--gold)] mb-1">Group</p>
                <h1 className="font-serif text-2xl text-[var(--foreground)]">{group.name}</h1>
                {group.description && (
                  <p className="text-[var(--foreground-secondary)] mt-1">{group.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-5">
              <p className="text-sm text-[var(--foreground-secondary)] mb-2">Total spent</p>
              <p className="font-serif text-2xl text-[var(--foreground)]">${totalExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-5">
              <p className="text-sm text-[var(--foreground-secondary)] mb-2">You owe</p>
              <p className={`font-serif text-2xl ${youOwe > 0 ? 'text-[var(--error)]' : 'text-[var(--foreground)]'}`}>
                ${youOwe.toFixed(2)}
              </p>
            </div>
            <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-5">
              <p className="text-sm text-[var(--foreground-secondary)] mb-2">You are owed</p>
              <p className={`font-serif text-2xl ${owedToYou > 0 ? 'text-[var(--success)]' : 'text-[var(--foreground)]'}`}>
                ${owedToYou.toFixed(2)}
              </p>
            </div>
            <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-5">
              <p className="text-sm text-[var(--foreground-secondary)] mb-2">Members</p>
              <p className="font-serif text-2xl text-[var(--foreground)]">{group.members.length}</p>
            </div>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Add expense form */}
            <AddExpenseForm
              groupId={groupId}
              members={membersForComponents}
              currentUserId={user.id}
            />

            {/* Expenses list */}
            <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)]">
              <div className="px-8 py-5 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="font-serif text-xl text-[var(--foreground)]">Recent expenses</h2>
                <span className="text-sm text-[var(--foreground-tertiary)]">{group.expenses.length} expenses</span>
              </div>
              {group.expenses.length === 0 ? (
                <div className="px-8 py-16 text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-[var(--accent)] flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-[var(--foreground-secondary)]">No expenses yet. Add one above!</p>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {expensesForComponents.map((expense) => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      currentUserId={user.id}
                      members={membersForComponents}
                      totalMembers={group.members.length}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Settle up */}
            <SettleUpCard
              groupId={groupId}
              currentUserId={user.id}
              debts={debts}
            />

            {/* Members */}
            <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-6">
              <h2 className="font-serif text-xl text-[var(--foreground)] mb-5">Members</h2>
              <ul className="space-y-3">
                {group.members.map((member) => (
                  <li key={member.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-[var(--accent)] flex items-center justify-center text-white font-serif text-sm">
                      {(member.user.name?.[0] || member.user.email[0]).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--foreground)] truncate">
                        {member.user.name || member.user.email}
                        {member.userId === user.id && (
                          <span className="text-[var(--foreground-tertiary)] ml-1">(you)</span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <p className="text-sm uppercase tracking-[0.1em] text-[var(--gold)] mb-3">Invite link</p>
                <div className="bg-[var(--background)] rounded-md p-3 border border-[var(--border)]">
                  <code className="text-xs text-[var(--foreground-secondary)] break-all">
                    {`${process.env.NEXT_PUBLIC_SUPABASE_URL ? "https://fairshare.vercel.app" : "http://localhost:3000"}/invite/${group.inviteCode}`}
                  </code>
                </div>
                <p className="text-xs text-[var(--foreground-tertiary)] mt-2">
                  Share this link to invite others to the group
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
