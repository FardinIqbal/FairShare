"use client";

import { useState, useTransition } from "react";
import { addExpense } from "@/lib/actions/expenses";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface AddExpenseFormProps {
  groupId: string;
  members: Member[];
  currentUserId: string;
}

export function AddExpenseForm({ groupId, members, currentUserId }: AddExpenseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [splitType, setSplitType] = useState<"EQUAL" | "CUSTOM">("EQUAL");
  const [includedMembers, setIncludedMembers] = useState<string[]>(
    members.map((m) => m.userId)
  );
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    // Add split type and related data
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
        await addExpense(formData);
        // Reset form
        setSplitType("EQUAL");
        setIncludedMembers(members.map((m) => m.userId));
        setCustomAmounts({});
        setShowAdvanced(false);
        setAmount("");
        // Reset the form element
        const form = document.getElementById("add-expense-form") as HTMLFormElement;
        form?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add expense");
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

  const handleCustomAmountChange = (userId: string, value: string) => {
    setCustomAmounts((prev) => ({ ...prev, [userId]: value }));
  };

  const totalCustomAmount = Object.entries(customAmounts)
    .filter(([userId]) => includedMembers.includes(userId))
    .reduce((sum, [, amt]) => sum + (parseFloat(amt) || 0), 0);

  const amountNum = parseFloat(amount) || 0;
  const remaining = amountNum - totalCustomAmount;

  return (
    <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl text-[var(--foreground)]">Add an expense</h2>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          {showAdvanced ? "Simple mode" : "Advanced options"}
        </button>
      </div>

      <form id="add-expense-form" action={handleSubmit} className="space-y-4">
        <input type="hidden" name="groupId" value={groupId} />

        {/* Basic fields */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            name="description"
            required
            placeholder="What was it for?"
            className="flex-1 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] transition-all"
          />
          <div className="flex gap-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)]">
                $
              </span>
              <input
                type="number"
                name="amount"
                required
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-32 pl-8 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Advanced options */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-[var(--border)]">
            {/* Category */}
            <div>
              <label className="block text-sm text-[var(--foreground-secondary)] mb-2">
                Category
              </label>
              <select
                name="category"
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)] transition-all"
              >
                <option value="">No category</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Split type */}
            <div>
              <label className="block text-sm text-[var(--foreground-secondary)] mb-2">
                Split type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSplitType("EQUAL")}
                  className={`flex-1 px-4 py-2 rounded-md border transition-all ${
                    splitType === "EQUAL"
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--accent)]"
                  }`}
                >
                  Equal split
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType("CUSTOM")}
                  className={`flex-1 px-4 py-2 rounded-md border transition-all ${
                    splitType === "CUSTOM"
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--accent)]"
                  }`}
                >
                  Custom amounts
                </button>
              </div>
            </div>

            {/* Member selection / Custom amounts */}
            <div>
              <label className="block text-sm text-[var(--foreground-secondary)] mb-2">
                {splitType === "EQUAL" ? "Who was involved?" : "How much does each person owe?"}
              </label>
              <div className="space-y-2">
                {members.map((member) => {
                  const isIncluded = includedMembers.includes(member.userId);
                  const displayName =
                    member.user.name ||
                    member.user.email.split("@")[0];
                  const isCurrentUser = member.userId === currentUserId;

                  if (splitType === "EQUAL") {
                    return (
                      <label
                        key={member.id}
                        className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                          isIncluded
                            ? "bg-[var(--accent-light)] border-[var(--accent)]"
                            : "bg-[var(--background)] border-[var(--border)] opacity-60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isIncluded}
                          onChange={() => toggleMember(member.userId)}
                          className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                        />
                        <span className="text-[var(--foreground)]">
                          {displayName}
                          {isCurrentUser && (
                            <span className="text-[var(--foreground-tertiary)] ml-1">
                              (you)
                            </span>
                          )}
                        </span>
                        {isIncluded && amountNum > 0 && (
                          <span className="ml-auto text-sm text-[var(--foreground-secondary)]">
                            ${(amountNum / includedMembers.length).toFixed(2)}
                          </span>
                        )}
                      </label>
                    );
                  } else {
                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-md border bg-[var(--background)] border-[var(--border)]"
                      >
                        <span className="text-[var(--foreground)] flex-1">
                          {displayName}
                          {isCurrentUser && (
                            <span className="text-[var(--foreground-tertiary)] ml-1">
                              (you)
                            </span>
                          )}
                        </span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)] text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={customAmounts[member.userId] || ""}
                            onChange={(e) =>
                              handleCustomAmountChange(member.userId, e.target.value)
                            }
                            className="w-24 pl-7 pr-2 py-2 text-sm bg-[var(--background-elevated)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] transition-all"
                          />
                        </div>
                      </div>
                    );
                  }
                })}
              </div>

              {/* Custom split validation */}
              {splitType === "CUSTOM" && amountNum > 0 && (
                <div
                  className={`mt-3 p-3 rounded-md ${
                    Math.abs(remaining) < 0.01
                      ? "bg-[var(--success-light)] text-[var(--success)]"
                      : "bg-[var(--error-light)] text-[var(--error)]"
                  }`}
                >
                  <div className="flex justify-between text-sm">
                    <span>Total: ${amountNum.toFixed(2)}</span>
                    <span>Assigned: ${totalCustomAmount.toFixed(2)}</span>
                    <span>
                      {Math.abs(remaining) < 0.01
                        ? "Balanced"
                        : remaining > 0
                        ? `$${remaining.toFixed(2)} left`
                        : `$${Math.abs(remaining).toFixed(2)} over`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-md bg-[var(--error-light)] text-[var(--error)] text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-between items-center pt-2">
          <p className="text-sm text-[var(--foreground-tertiary)]">
            {splitType === "EQUAL"
              ? `Split equally among ${includedMembers.length} ${
                  includedMembers.length === 1 ? "person" : "people"
                }`
              : "Custom split"}
          </p>
          <button
            type="submit"
            disabled={isPending || (splitType === "CUSTOM" && Math.abs(remaining) >= 0.01)}
            className="px-6 py-3 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Adding..." : "Add expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
