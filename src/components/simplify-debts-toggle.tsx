"use client";

import { useTransition } from "react";
import { toggleSimplifyDebts } from "@/lib/actions/expenses";

interface SimplifyDebtsToggleProps {
  groupId: string;
  enabled: boolean;
}

export function SimplifyDebtsToggle({ groupId, enabled }: SimplifyDebtsToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleSimplifyDebts(groupId);
    });
  };

  return (
    <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-md border border-[var(--border)]">
      <div>
        <p className="text-sm text-[var(--foreground)]">Simplify debts</p>
        <p className="text-xs text-[var(--foreground-tertiary)]">
          {enabled
            ? "Minimizing number of payments"
            : "Showing all individual debts"}
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${
          enabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? "translate-x-6" : ""
          }`}
        />
      </button>
    </div>
  );
}
