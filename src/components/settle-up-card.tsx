"use client";

import { useState, useTransition } from "react";
import { settleDebt } from "@/lib/actions/expenses";

interface Debt {
  from: { id: string; name: string | null; email: string };
  to: { id: string; name: string | null; email: string };
  amount: number;
}

interface SettleUpCardProps {
  groupId: string;
  currentUserId: string;
  debts: Debt[];
}

export function SettleUpCard({ groupId, currentUserId, debts }: SettleUpCardProps) {
  const [isPending, startTransition] = useTransition();
  const [settlingDebt, setSettlingDebt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentUserDebts = debts.filter(
    (d) => d.from.id === currentUserId || d.to.id === currentUserId
  );

  const handleSettle = async (toUserId: string, amount: number) => {
    setError(null);
    setSettlingDebt(toUserId);

    const formData = new FormData();
    formData.set("groupId", groupId);
    formData.set("toUserId", toUserId);
    formData.set("amount", amount.toString());

    startTransition(async () => {
      try {
        await settleDebt(formData);
        setSettlingDebt(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to settle debt");
        setSettlingDebt(null);
      }
    });
  };

  return (
    <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-6">
      <h2 className="font-serif text-xl text-[var(--foreground)] mb-5">Settle up</h2>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-[var(--error-light)] text-[var(--error)] text-sm">
          {error}
        </div>
      )}

      {currentUserDebts.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-[var(--success)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="font-serif text-lg text-[var(--foreground)] mb-1">All settled</p>
          <p className="text-sm text-[var(--foreground-secondary)]">
            You&apos;re all settled up!
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {currentUserDebts.map((debt, i) => {
            const isYouOwing = debt.from.id === currentUserId;
            const otherPerson = isYouOwing ? debt.to : debt.from;
            const isSettling = settlingDebt === otherPerson.id;

            return (
              <li
                key={i}
                className={`p-4 rounded-md border ${
                  isYouOwing
                    ? "bg-[var(--error-light)] border-[var(--error)]/20"
                    : "bg-[var(--success-light)] border-[var(--success)]/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    {isYouOwing ? (
                      <p className="text-[var(--error)] text-sm">
                        You owe{" "}
                        <span className="font-medium">
                          {otherPerson.name || otherPerson.email}
                        </span>
                      </p>
                    ) : (
                      <p className="text-[var(--success)] text-sm">
                        <span className="font-medium">
                          {otherPerson.name || otherPerson.email}
                        </span>{" "}
                        owes you
                      </p>
                    )}
                  </div>
                  <p
                    className={`font-serif text-lg ${
                      isYouOwing ? "text-[var(--error)]" : "text-[var(--success)]"
                    }`}
                  >
                    ${debt.amount.toFixed(2)}
                  </p>
                </div>

                {isYouOwing && (
                  <button
                    type="button"
                    onClick={() => handleSettle(otherPerson.id, debt.amount)}
                    disabled={isPending}
                    className="w-full mt-2 px-4 py-2 text-sm bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSettling ? "Settling..." : "Mark as paid"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* All debts in group */}
      {debts.length > currentUserDebts.length && (
        <div className="mt-6 pt-6 border-t border-[var(--border)]">
          <p className="text-sm uppercase tracking-[0.1em] text-[var(--gold)] mb-3">
            Other balances
          </p>
          <ul className="space-y-2">
            {debts
              .filter((d) => d.from.id !== currentUserId && d.to.id !== currentUserId)
              .map((debt, i) => (
                <li
                  key={i}
                  className="text-sm text-[var(--foreground-secondary)] flex justify-between"
                >
                  <span>
                    {debt.from.name || debt.from.email.split("@")[0]} owes{" "}
                    {debt.to.name || debt.to.email.split("@")[0]}
                  </span>
                  <span>${debt.amount.toFixed(2)}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
