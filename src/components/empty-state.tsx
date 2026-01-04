"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  type: "groups" | "expenses" | "settled" | "members";
  action?: React.ReactNode;
}

const illustrations = {
  groups: (
    <svg viewBox="0 0 200 200" className="w-32 h-32 sm:w-40 sm:h-40">
      <circle cx="100" cy="100" r="80" fill="var(--accent-light)" />
      <circle cx="70" cy="85" r="25" fill="var(--accent)" opacity="0.8" />
      <circle cx="130" cy="85" r="25" fill="var(--accent)" opacity="0.6" />
      <circle cx="100" cy="130" r="25" fill="var(--accent)" opacity="0.4" />
      <circle cx="70" cy="85" r="8" fill="white" />
      <circle cx="130" cy="85" r="8" fill="white" />
      <circle cx="100" cy="130" r="8" fill="white" />
    </svg>
  ),
  expenses: (
    <svg viewBox="0 0 200 200" className="w-32 h-32 sm:w-40 sm:h-40">
      <rect x="40" y="50" width="120" height="100" rx="8" fill="var(--accent-light)" />
      <rect x="55" y="70" width="90" height="8" rx="4" fill="var(--accent)" opacity="0.3" />
      <rect x="55" y="90" width="70" height="8" rx="4" fill="var(--accent)" opacity="0.3" />
      <rect x="55" y="110" width="50" height="8" rx="4" fill="var(--accent)" opacity="0.3" />
      <circle cx="140" cy="130" r="25" fill="var(--accent)" />
      <text x="140" y="137" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">$</text>
    </svg>
  ),
  settled: (
    <svg viewBox="0 0 200 200" className="w-32 h-32 sm:w-40 sm:h-40">
      <circle cx="100" cy="100" r="70" fill="var(--success-light)" />
      <circle cx="100" cy="100" r="50" fill="var(--success)" opacity="0.3" />
      <path
        d="M75 100 L95 120 L130 80"
        stroke="var(--success)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  members: (
    <svg viewBox="0 0 200 200" className="w-32 h-32 sm:w-40 sm:h-40">
      <circle cx="100" cy="100" r="80" fill="var(--accent-light)" />
      <circle cx="100" cy="80" r="30" fill="var(--accent)" opacity="0.6" />
      <ellipse cx="100" cy="145" rx="45" ry="25" fill="var(--accent)" opacity="0.6" />
      <circle cx="100" cy="80" r="12" fill="white" />
    </svg>
  ),
};

const messages = {
  groups: {
    title: "No groups yet",
    description: "Create your first group to start splitting expenses with friends",
  },
  expenses: {
    title: "No expenses yet",
    description: "Add your first expense to start tracking who owes what",
  },
  settled: {
    title: "All settled up!",
    description: "No outstanding balances. Everyone is square!",
  },
  members: {
    title: "Just you for now",
    description: "Invite friends to join this group and start splitting",
  },
};

export function EmptyState({ type, action }: EmptyStateProps) {
  const { title, description } = messages[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {illustrations[type]}
      </motion.div>
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 font-serif text-xl sm:text-2xl text-[var(--foreground)]"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-2 text-sm sm:text-base text-[var(--foreground-secondary)] max-w-xs"
      >
        {description}
      </motion.p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
