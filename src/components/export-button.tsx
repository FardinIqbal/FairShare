"use client";

import { useState, useTransition } from "react";
import { exportGroupToCSV } from "@/lib/actions/expenses";

interface ExportButtonProps {
  groupId: string;
}

export function ExportButton({ groupId }: ExportButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    setError(null);
    startTransition(async () => {
      try {
        const { filename, content } = await exportGroupToCSV(groupId);

        // Create blob and download
        const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Export failed");
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-md hover:border-[var(--accent)] transition-all disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {isPending ? "Exporting..." : "Export CSV"}
      </button>
      {error && (
        <p className="text-xs text-[var(--error)] mt-1">{error}</p>
      )}
    </div>
  );
}
