import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getSimplifiedDebts, processRecurringExpenses } from "@/lib/actions/expenses";
import { ThemeToggle } from "@/components/theme-toggle";
import { AddExpenseForm } from "@/components/add-expense-form";
import { SettleUpCard } from "@/components/settle-up-card";
import { ExpenseItem } from "@/components/expense-item";
import { ExportButton } from "@/components/export-button";
import { InviteQRCode } from "@/components/qr-code";
import { SimplifyDebtsToggle } from "@/components/simplify-debts-toggle";
import { EmptyState } from "@/components/empty-state";
import { ActivityFeed } from "@/components/activity-feed";
import { getCurrencySymbol } from "@/lib/constants";

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

  // Process any due recurring expenses
  await processRecurringExpenses(groupId);

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
    currency: e.currency,
    isRecurring: e.isRecurring,
    recurringFrequency: e.recurringFrequency,
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[var(--accent)] flex items-center justify-center">
                <span className="text-white font-serif text-base sm:text-lg">F</span>
              </div>
              <span className="font-serif text-base sm:text-lg text-[var(--foreground)] hidden sm:block">FairShare</span>
            </Link>
            <span className="text-[var(--foreground-tertiary)]">/</span>
            <span className="font-medium text-sm sm:text-base text-[var(--foreground)] truncate">{group.name}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-start justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-serif text-xl sm:text-2xl">{group.name[0].toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm uppercase tracking-[0.15em] text-[var(--gold)] mb-0.5 sm:mb-1">Group</p>
                <h1 className="font-serif text-xl sm:text-2xl text-[var(--foreground)] truncate">{group.name}</h1>
                {group.description && (
                  <p className="text-sm text-[var(--foreground-secondary)] mt-1 hidden sm:block">{group.description}</p>
                )}
              </div>
            </div>
            <ExportButton groupId={groupId} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mb-1 sm:mb-2">Total spent</p>
              <p className="font-serif text-lg sm:text-2xl text-[var(--foreground)]">${totalExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mb-1 sm:mb-2">You owe</p>
              <p className={`font-serif text-lg sm:text-2xl ${youOwe > 0 ? 'text-[var(--error)]' : 'text-[var(--foreground)]'}`}>
                ${youOwe.toFixed(2)}
              </p>
            </div>
            <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mb-1 sm:mb-2">You are owed</p>
              <p className={`font-serif text-lg sm:text-2xl ${owedToYou > 0 ? 'text-[var(--success)]' : 'text-[var(--foreground)]'}`}>
                ${owedToYou.toFixed(2)}
              </p>
            </div>
            <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mb-1 sm:mb-2">Members</p>
              <p className="font-serif text-lg sm:text-2xl text-[var(--foreground)]">{group.members.length}</p>
            </div>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 mb-6 sm:mb-10">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Add expense form */}
            <AddExpenseForm
              groupId={groupId}
              members={membersForComponents}
              currentUserId={user.id}
              defaultCurrency={group.defaultCurrency}
            />

            {/* Expenses list */}
            <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)]">
              <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="font-serif text-lg sm:text-xl text-[var(--foreground)]">Recent expenses</h2>
                <span className="text-xs sm:text-sm text-[var(--foreground-tertiary)]">{group.expenses.length} expenses</span>
              </div>
              {group.expenses.length === 0 ? (
                <EmptyState type="expenses" />
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
          <div className="space-y-4 sm:space-y-8">
            {/* Debt simplification toggle */}
            <SimplifyDebtsToggle
              groupId={groupId}
              enabled={group.simplifyDebts}
            />

            {/* Settle up */}
            <SettleUpCard
              groupId={groupId}
              currentUserId={user.id}
              debts={debts}
            />

            {/* Activity Feed */}
            <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-4 sm:p-6">
              <h2 className="font-serif text-lg sm:text-xl text-[var(--foreground)] mb-4">Recent Activity</h2>
              <ActivityFeed
                activities={expensesForComponents.slice(0, 5).map((e) => ({
                  id: e.id,
                  type: "expense" as const,
                  description: e.description,
                  amount: e.amount,
                  currency: e.currency,
                  category: e.category,
                  user: e.paidBy,
                  date: e.date,
                }))}
              />
            </div>

            {/* Members */}
            <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-4 sm:p-6">
              <h2 className="font-serif text-lg sm:text-xl text-[var(--foreground)] mb-4 sm:mb-5">Members</h2>
              <ul className="space-y-2 sm:space-y-3">
                {group.members.map((member) => (
                  <li key={member.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[var(--accent)] flex items-center justify-center text-white font-serif text-sm">
                      {(member.user.name?.[0] || member.user.email[0]).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base text-[var(--foreground)] truncate">
                        {member.user.name || member.user.email}
                        {member.userId === user.id && (
                          <span className="text-[var(--foreground-tertiary)] ml-1">(you)</span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[var(--border)]">
                <p className="text-xs sm:text-sm uppercase tracking-[0.1em] text-[var(--gold)] mb-3 sm:mb-4">Invite members</p>
                <InviteQRCode
                  inviteCode={group.inviteCode}
                  baseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL ? "https://fairshare-two-bice.vercel.app" : "http://localhost:3000"}
                />
                <p className="text-xs text-[var(--foreground-tertiary)] mt-3 text-center">
                  Scan QR code or share the link
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
