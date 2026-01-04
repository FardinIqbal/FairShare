"use client";

import { useState, useTransition } from "react";
import { deleteExpense, updateExpense } from "@/lib/actions/expenses";
import { EXPENSE_CATEGORIES, getCurrencySymbol, RECURRING_FREQUENCIES } from "@/lib/constants";
import { CategoryIcon } from "./category-icon";

interface ExpenseShare {
  userId: string;
  amount: number;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string | null;
  splitType: string;
  currency: string;
  isRecurring: boolean;
  recurringFrequency: string | null;
  date: Date;
  paidBy: {
    id: string;
    name: string | null;
    email: string;
  };
  shares: ExpenseShare[];
}

interface ExpenseItemProps {
  expense: Expense;
  currentUserId: string;
  members: Member[];
  totalMembers: number;
}

export function ExpenseItem({
  expense,
  currentUserId,
  members,
  totalMembers,
}: ExpenseItemProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState(expense.category || "");
  const [splitType, setSplitType] = useState<"EQUAL" | "CUSTOM">(
    expense.splitType as "EQUAL" | "CUSTOM"
  );
  const [includedMembers, setIncludedMembers] = useState<string[]>(
    expense.shares.map((s) => s.userId)
  );
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(
    Object.fromEntries(expense.shares.map((s) => [s.userId, s.amount.toString()]))
  );

  const isPaidByMe = expense.paidBy.id === currentUserId;
  const perPerson = expense.amount / expense.shares.length;
  const categoryLabel = EXPENSE_CATEGORIES.find((c) => c.value === expense.category)?.label;

  const handleDelete = async () => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteExpense(expense.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete");
        setShowConfirmDelete(false);
      }
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("expenseId", expense.id);
    formData.set("description", description);
    formData.set("amount", amount);
    formData.set("category", category);
    formData.set("splitType", splitType);

    if (splitType === "CUSTOM") {
      const customSplits = Object.entries(customAmounts)
        .filter(([userId]) => includedMembers.includes(userId))
        .map(([userId, amt]) => ({
          userId,
          amount: parseFloat(amt) || 0,
        }));
      formData.set("customSplits", JSON.stringify(customSplits));
    } else {
      formData.set("includedMembers", JSON.stringify(includedMembers));
    }

    startTransition(async () => {
      try {
        await updateExpense(formData);
        setIsEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update");
      }
    });
  };

  const toggleMember = (userId: string) => {
    setIncludedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const amountNum = parseFloat(amount) || 0;
  const totalCustomAmount = Object.entries(customAmounts)
    .filter(([userId]) => includedMembers.includes(userId))
    .reduce((sum, [, amt]) => sum + (parseFloat(amt) || 0), 0);
  const remaining = amountNum - totalCustomAmount;

  if (isEditing) {
    return (
      <li className="px-8 py-5 bg-[var(--background-warm)]">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-[var(--foreground)] text-sm"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)] text-sm">
                {getCurrencySymbol(expense.currency)}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                step="0.01"
                min="0.01"
                className="w-28 pl-7 pr-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-[var(--foreground)] text-sm"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-[var(--foreground)] text-sm"
            >
              <option value="">No category</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setSplitType("EQUAL")}
                className={`px-3 py-2 text-sm rounded-l-md border transition-all ${
                  splitType === "EQUAL"
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)]"
                }`}
              >
                Equal
              </button>
              <button
                type="button"
                onClick={() => setSplitType("CUSTOM")}
                className={`px-3 py-2 text-sm rounded-r-md border transition-all ${
                  splitType === "CUSTOM"
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)]"
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Member selection */}
          <div className="space-y-2">
            {members.map((member) => {
              const isIncluded = includedMembers.includes(member.userId);
              const displayName = member.user.name || member.user.email.split("@")[0];

              if (splitType === "EQUAL") {
                return (
                  <label
                    key={member.id}
                    className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer ${
                      isIncluded ? "bg-[var(--accent-light)]" : "bg-[var(--background)] opacity-60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isIncluded}
                      onChange={() => toggleMember(member.userId)}
                      className="w-3 h-3"
                    />
                    <span>{displayName}</span>
                    {isIncluded && amountNum > 0 && (
                      <span className="ml-auto text-[var(--foreground-secondary)]">
                        {getCurrencySymbol(expense.currency)}{(amountNum / includedMembers.length).toFixed(2)}
                      </span>
                    )}
                  </label>
                );
              } else {
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 p-2 rounded bg-[var(--background)] text-sm"
                  >
                    <span className="flex-1">{displayName}</span>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)] text-xs">
                        {getCurrencySymbol(expense.currency)}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customAmounts[member.userId] || ""}
                        onChange={(e) =>
                          setCustomAmounts((prev) => ({
                            ...prev,
                            [member.userId]: e.target.value,
                          }))
                        }
                        className="w-20 pl-5 pr-2 py-1 text-sm bg-[var(--background-elevated)] border border-[var(--border)] rounded"
                      />
                    </div>
                  </div>
                );
              }
            })}
          </div>

          {splitType === "CUSTOM" && amountNum > 0 && (
            <div
              className={`p-2 rounded text-sm ${
                Math.abs(remaining) < 0.01
                  ? "bg-[var(--success-light)] text-[var(--success)]"
                  : "bg-[var(--error-light)] text-[var(--error)]"
              }`}
            >
              {Math.abs(remaining) < 0.01
                ? "Balanced"
                : remaining > 0
                ? `${getCurrencySymbol(expense.currency)}${remaining.toFixed(2)} left to assign`
                : `${getCurrencySymbol(expense.currency)}${Math.abs(remaining).toFixed(2)} over budget`}
            </div>
          )}

          {error && (
            <div className="p-2 rounded bg-[var(--error-light)] text-[var(--error)] text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || (splitType === "CUSTOM" && Math.abs(remaining) >= 0.01)}
              className="px-4 py-2 text-sm bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="px-4 sm:px-8 py-4 sm:py-5 hover:bg-[var(--background-warm)] transition-colors group">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <CategoryIcon category={expense.category} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-[var(--foreground)] truncate">{expense.description}</p>
              {expense.isRecurring && expense.recurringFrequency && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--gold)]/10 text-[var(--gold)] whitespace-nowrap">
                  {RECURRING_FREQUENCIES.find(f => f.value === expense.recurringFrequency)?.label || "Recurring"}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[var(--foreground-tertiary)] truncate">
              Paid by {isPaidByMe ? "you" : expense.paidBy.name || expense.paidBy.email}
              <span className="mx-1 sm:mx-1.5">·</span>
              {expense.shares.length === totalMembers
                ? `${getCurrencySymbol(expense.currency)}${perPerson.toFixed(2)}/person`
                : `Split ${expense.shares.length} ways`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="font-serif text-base sm:text-lg text-[var(--foreground)]">
              {getCurrencySymbol(expense.currency)}{expense.amount.toFixed(2)}
            </p>
            <p className="text-xs text-[var(--foreground-tertiary)]">
              {new Date(expense.date).toLocaleDateString()}
            </p>
          </div>

          {isPaidByMe && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-2 text-[var(--foreground-secondary)] hover:text-[var(--accent)] transition-colors"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="p-2 text-[var(--foreground-secondary)] hover:text-[var(--error)] transition-colors"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {showConfirmDelete && (
        <div className="mt-4 p-4 rounded-md bg-[var(--error-light)] border border-[var(--error)]/20">
          <p className="text-sm text-[var(--error)] mb-3">
            Are you sure you want to delete this expense?
          </p>
          {error && (
            <p className="text-sm text-[var(--error)] mb-3">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(false)}
              className="px-3 py-1.5 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="px-3 py-1.5 text-sm bg-[var(--error)] text-white rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
