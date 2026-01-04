"use client";

import { useState, useTransition, useEffect } from "react";
import { addExpense } from "@/lib/actions/expenses";
import { EXPENSE_CATEGORIES, RECURRING_FREQUENCIES, CURRENCIES, getCurrencySymbol } from "@/lib/constants";

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
  defaultCurrency?: string;
}

type SplitType = "EQUAL" | "CUSTOM" | "PERCENTAGE" | "SHARES";

// Category keywords for auto-suggestion
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ["pizza", "burger", "restaurant", "dinner", "lunch", "breakfast", "coffee", "cafe", "bar", "drinks", "food", "meal", "sushi", "tacos", "mcdonalds", "starbucks", "chipotle", "subway", "wendys", "taco bell", "dominos", "grubhub", "doordash", "ubereats"],
  transport: ["uber", "lyft", "taxi", "gas", "fuel", "parking", "toll", "train", "bus", "metro", "subway", "flight", "airline", "car", "rental"],
  accommodation: ["hotel", "airbnb", "hostel", "motel", "resort", "lodging", "stay", "room", "booking"],
  entertainment: ["movie", "cinema", "theater", "concert", "show", "game", "tickets", "netflix", "spotify", "museum", "park", "bowling", "arcade"],
  shopping: ["amazon", "target", "walmart", "costco", "clothes", "shoes", "electronics", "gift", "present"],
  utilities: ["electric", "electricity", "water", "internet", "wifi", "phone", "gas bill", "utility", "cable", "power"],
  groceries: ["grocery", "groceries", "supermarket", "whole foods", "trader joe", "safeway", "kroger", "publix", "aldi", "costco"],
  other: [],
};

function suggestCategory(description: string): string {
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return category;
    }
  }
  return "";
}

export function AddExpenseForm({ groupId, members, currentUserId, defaultCurrency = "USD" }: AddExpenseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [splitType, setSplitType] = useState<SplitType>("EQUAL");
  const [includedMembers, setIncludedMembers] = useState<string[]>(
    members.map((m) => m.userId)
  );
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [shares, setShares] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [suggestedCategory, setSuggestedCategory] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("MONTHLY");

  // Auto-suggest category based on description
  useEffect(() => {
    const suggestion = suggestCategory(description);
    setSuggestedCategory(suggestion);
    // Auto-set category if not already set by user
    if (suggestion && !category) {
      setCategory(suggestion);
    }
  }, [description]);

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    formData.set("splitType", splitType);
    formData.set("description", description);
    formData.set("category", category);
    formData.set("currency", currency);
    formData.set("isRecurring", isRecurring.toString());
    if (isRecurring) {
      formData.set("recurringFrequency", recurringFrequency);
    }

    if (splitType === "CUSTOM") {
      const customSplits = Object.entries(customAmounts)
        .filter(([userId]) => includedMembers.includes(userId))
        .map(([userId, amt]) => ({
          userId,
          amount: parseFloat(amt) || 0,
        }));
      formData.set("customSplits", JSON.stringify(customSplits));
    } else if (splitType === "PERCENTAGE") {
      const percentageSplits = Object.entries(percentages)
        .filter(([userId]) => includedMembers.includes(userId))
        .map(([userId, pct]) => ({
          userId,
          percentage: parseFloat(pct) || 0,
        }));
      formData.set("percentageSplits", JSON.stringify(percentageSplits));
    } else if (splitType === "SHARES") {
      const shareSplits = Object.entries(shares)
        .filter(([userId]) => includedMembers.includes(userId))
        .map(([userId, sh]) => ({
          userId,
          shares: parseInt(sh) || 1,
        }));
      formData.set("shareSplits", JSON.stringify(shareSplits));
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
        setPercentages({});
        setShares({});
        setShowAdvanced(false);
        setAmount("");
        setDescription("");
        setCategory("");
        setCurrency(defaultCurrency);
        setIsRecurring(false);
        setRecurringFrequency("MONTHLY");
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

  const amountNum = parseFloat(amount) || 0;

  // Calculate totals for validation
  const totalCustomAmount = Object.entries(customAmounts)
    .filter(([userId]) => includedMembers.includes(userId))
    .reduce((sum, [, amt]) => sum + (parseFloat(amt) || 0), 0);
  const customRemaining = amountNum - totalCustomAmount;

  const totalPercentage = Object.entries(percentages)
    .filter(([userId]) => includedMembers.includes(userId))
    .reduce((sum, [, pct]) => sum + (parseFloat(pct) || 0), 0);

  const totalShares = Object.entries(shares)
    .filter(([userId]) => includedMembers.includes(userId))
    .reduce((sum, [, sh]) => sum + (parseInt(sh) || 1), 0);

  const splitTypeOptions: { value: SplitType; label: string }[] = [
    { value: "EQUAL", label: "Equal" },
    { value: "PERCENTAGE", label: "Percentage" },
    { value: "SHARES", label: "Shares" },
    { value: "CUSTOM", label: "Custom $" },
  ];

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
          <div className="flex-1 relative">
            <input
              type="text"
              name="description"
              required
              placeholder="What was it for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] transition-all"
            />
            {suggestedCategory && !showAdvanced && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 bg-[var(--accent-light)] text-[var(--accent)] rounded">
                {EXPENSE_CATEGORIES.find(c => c.value === suggestedCategory)?.label || suggestedCategory}
              </span>
            )}
          </div>
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
            {/* Category and Currency row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm text-[var(--foreground-secondary)] mb-2">
                  Category
                  {suggestedCategory && suggestedCategory !== category && (
                    <button
                      type="button"
                      onClick={() => setCategory(suggestedCategory)}
                      className="ml-2 text-xs text-[var(--accent)] hover:underline"
                    >
                      Use: {EXPENSE_CATEGORIES.find(c => c.value === suggestedCategory)?.label}
                    </button>
                  )}
                </label>
                <select
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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

              {/* Currency */}
              <div>
                <label className="block text-sm text-[var(--foreground-secondary)] mb-2">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)] transition-all"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.value} value={curr.value}>
                      {curr.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recurring expense toggle */}
            <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-md border border-[var(--border)]">
              <div>
                <p className="text-sm text-[var(--foreground)]">Recurring expense</p>
                <p className="text-xs text-[var(--foreground-tertiary)]">
                  Automatically repeat this expense
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isRecurring ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    isRecurring ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            {/* Recurring frequency selector */}
            {isRecurring && (
              <div>
                <label className="block text-sm text-[var(--foreground-secondary)] mb-2">
                  Repeat frequency
                </label>
                <div className="flex gap-2 flex-wrap">
                  {RECURRING_FREQUENCIES.map((freq) => (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => setRecurringFrequency(freq.value)}
                      className={`px-4 py-2 text-sm rounded-md border transition-all ${
                        recurringFrequency === freq.value
                          ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                          : "bg-[var(--background)] text-[var(--foreground-secondary)] border-[var(--border)] hover:border-[var(--accent)]"
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Split type tabs */}
            <div>
              <label className="block text-sm text-[var(--foreground-secondary)] mb-2">
                Split type
              </label>
              <div className="flex gap-1 p-1 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                {splitTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSplitType(opt.value)}
                    className={`flex-1 px-3 py-2 text-sm rounded-md transition-all ${
                      splitType === opt.value
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Member selection / amounts based on split type */}
            <div>
              <label className="block text-sm text-[var(--foreground-secondary)] mb-2">
                {splitType === "EQUAL" && "Who was involved?"}
                {splitType === "CUSTOM" && "How much does each person owe?"}
                {splitType === "PERCENTAGE" && "What percentage does each person owe?"}
                {splitType === "SHARES" && "How many shares does each person have?"}
              </label>
              <div className="space-y-2">
                {members.map((member) => {
                  const isIncluded = includedMembers.includes(member.userId);
                  const displayName = member.user.name || member.user.email.split("@")[0];
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
                          {isCurrentUser && <span className="text-[var(--foreground-tertiary)] ml-1">(you)</span>}
                        </span>
                        {isIncluded && amountNum > 0 && (
                          <span className="ml-auto text-sm text-[var(--foreground-secondary)]">
                            ${(amountNum / includedMembers.length).toFixed(2)}
                          </span>
                        )}
                      </label>
                    );
                  } else if (splitType === "PERCENTAGE") {
                    const pct = parseFloat(percentages[member.userId] || "0") || 0;
                    const calculatedAmount = (amountNum * pct) / 100;
                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-md border bg-[var(--background)] border-[var(--border)]"
                      >
                        <span className="text-[var(--foreground)] flex-1">
                          {displayName}
                          {isCurrentUser && <span className="text-[var(--foreground-tertiary)] ml-1">(you)</span>}
                        </span>
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={percentages[member.userId] || ""}
                            onChange={(e) => setPercentages(prev => ({ ...prev, [member.userId]: e.target.value }))}
                            className="w-20 pr-6 pl-2 py-2 text-sm text-right bg-[var(--background-elevated)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] transition-all"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)] text-sm">%</span>
                        </div>
                        {pct > 0 && amountNum > 0 && (
                          <span className="text-sm text-[var(--foreground-secondary)] w-20 text-right">
                            ${calculatedAmount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    );
                  } else if (splitType === "SHARES") {
                    const memberShares = parseInt(shares[member.userId] || "1") || 1;
                    const calculatedAmount = totalShares > 0 ? (amountNum * memberShares) / totalShares : 0;
                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-md border bg-[var(--background)] border-[var(--border)]"
                      >
                        <span className="text-[var(--foreground)] flex-1">
                          {displayName}
                          {isCurrentUser && <span className="text-[var(--foreground-tertiary)] ml-1">(you)</span>}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShares(prev => ({ ...prev, [member.userId]: String(Math.max(0, memberShares - 1)) }))}
                            className="w-8 h-8 rounded-md bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-[var(--foreground)]">{memberShares}</span>
                          <button
                            type="button"
                            onClick={() => setShares(prev => ({ ...prev, [member.userId]: String(memberShares + 1) }))}
                            className="w-8 h-8 rounded-md bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                          >
                            +
                          </button>
                        </div>
                        {amountNum > 0 && (
                          <span className="text-sm text-[var(--foreground-secondary)] w-20 text-right">
                            ${calculatedAmount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    );
                  } else {
                    // CUSTOM
                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-md border bg-[var(--background)] border-[var(--border)]"
                      >
                        <span className="text-[var(--foreground)] flex-1">
                          {displayName}
                          {isCurrentUser && <span className="text-[var(--foreground-tertiary)] ml-1">(you)</span>}
                        </span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)] text-sm">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={customAmounts[member.userId] || ""}
                            onChange={(e) => setCustomAmounts(prev => ({ ...prev, [member.userId]: e.target.value }))}
                            className="w-24 pl-7 pr-2 py-2 text-sm bg-[var(--background-elevated)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] transition-all"
                          />
                        </div>
                      </div>
                    );
                  }
                })}
              </div>

              {/* Validation messages */}
              {splitType === "CUSTOM" && amountNum > 0 && (
                <div className={`mt-3 p-3 rounded-md ${
                  Math.abs(customRemaining) < 0.01
                    ? "bg-[var(--success-light)] text-[var(--success)]"
                    : "bg-[var(--error-light)] text-[var(--error)]"
                }`}>
                  <div className="flex justify-between text-sm">
                    <span>Total: ${amountNum.toFixed(2)}</span>
                    <span>Assigned: ${totalCustomAmount.toFixed(2)}</span>
                    <span>
                      {Math.abs(customRemaining) < 0.01
                        ? "Balanced"
                        : customRemaining > 0
                        ? `$${customRemaining.toFixed(2)} left`
                        : `$${Math.abs(customRemaining).toFixed(2)} over`}
                    </span>
                  </div>
                </div>
              )}

              {splitType === "PERCENTAGE" && (
                <div className={`mt-3 p-3 rounded-md ${
                  Math.abs(totalPercentage - 100) < 0.01
                    ? "bg-[var(--success-light)] text-[var(--success)]"
                    : "bg-[var(--error-light)] text-[var(--error)]"
                }`}>
                  <div className="flex justify-between text-sm">
                    <span>Total: {totalPercentage.toFixed(0)}%</span>
                    <span>
                      {Math.abs(totalPercentage - 100) < 0.01
                        ? "Balanced (100%)"
                        : totalPercentage < 100
                        ? `${(100 - totalPercentage).toFixed(0)}% remaining`
                        : `${(totalPercentage - 100).toFixed(0)}% over`}
                    </span>
                  </div>
                </div>
              )}

              {splitType === "SHARES" && totalShares > 0 && amountNum > 0 && (
                <div className="mt-3 p-3 rounded-md bg-[var(--accent-light)] text-[var(--accent)]">
                  <div className="text-sm">
                    {totalShares} total shares = ${(amountNum / totalShares).toFixed(2)} per share
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
            {splitType === "EQUAL" && `Split equally among ${includedMembers.length} ${includedMembers.length === 1 ? "person" : "people"}`}
            {splitType === "CUSTOM" && "Custom amounts"}
            {splitType === "PERCENTAGE" && "Split by percentage"}
            {splitType === "SHARES" && `${totalShares} shares total`}
          </p>
          <button
            type="submit"
            disabled={
              isPending ||
              (splitType === "CUSTOM" && Math.abs(customRemaining) >= 0.01) ||
              (splitType === "PERCENTAGE" && Math.abs(totalPercentage - 100) >= 0.01)
            }
            className="px-6 py-3 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Adding..." : "Add expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
