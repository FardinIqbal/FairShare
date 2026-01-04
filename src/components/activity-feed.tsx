"use client";

import { motion } from "framer-motion";
import { CategoryIcon } from "./category-icon";
import { getCurrencySymbol } from "@/lib/constants";

interface ActivityItem {
  id: string;
  type: "expense" | "settlement" | "join";
  description: string;
  amount?: number;
  currency?: string;
  category?: string | null;
  user: {
    name: string | null;
    email: string;
  };
  date: Date;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  if (type === "expense") {
    return (
      <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] flex items-center justify-center">
        <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
    );
  }
  if (type === "settlement") {
    return (
      <div className="w-8 h-8 rounded-full bg-[var(--success-light)] flex items-center justify-center">
        <svg className="w-4 h-4 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
      <svg className="w-4 h-4 text-[var(--gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    </div>
  );
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--foreground-tertiary)] text-sm">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => {
        const userName = activity.user.name || activity.user.email.split("@")[0];

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--background-warm)] transition-colors"
          >
            <ActivityIcon type={activity.type} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--foreground)]">
                <span className="font-medium">{userName}</span>
                {activity.type === "expense" && (
                  <>
                    {" "}added{" "}
                    <span className="font-medium">{activity.description}</span>
                    {activity.amount && (
                      <span className="text-[var(--foreground-secondary)]">
                        {" "}for {getCurrencySymbol(activity.currency || "USD")}{activity.amount.toFixed(2)}
                      </span>
                    )}
                  </>
                )}
                {activity.type === "settlement" && (
                  <>
                    {" "}settled{" "}
                    <span className="font-medium text-[var(--success)]">
                      {getCurrencySymbol(activity.currency || "USD")}{activity.amount?.toFixed(2)}
                    </span>
                  </>
                )}
                {activity.type === "join" && " joined the group"}
              </p>
              <p className="text-xs text-[var(--foreground-tertiary)] mt-0.5">
                {formatRelativeTime(activity.date)}
              </p>
            </div>
            {activity.type === "expense" && activity.category && (
              <CategoryIcon category={activity.category} size="sm" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
