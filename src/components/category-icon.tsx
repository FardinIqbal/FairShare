"use client";

import { EXPENSE_CATEGORIES } from "@/lib/constants";

interface CategoryIconProps {
  category: string | null;
  size?: "sm" | "md" | "lg";
  showBackground?: boolean;
}

const icons: Record<string, React.ReactNode> = {
  utensils: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8V3m0 5a4 4 0 00-4 4v1a4 4 0 008 0v-1a4 4 0 00-4-4zm-6 8h12M6 21h12m-9-3v3m6-3v3M3 3l3 3m12-3l-3 3" />
  ),
  car: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17h.01M16 17h.01M5 11l2-6h10l2 6M5 11v6a1 1 0 001 1h1m12-7v6a1 1 0 01-1 1h-1m-10 0h10M5 11h14" />
  ),
  home: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  ),
  ticket: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  ),
  "shopping-bag": (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  ),
  zap: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  ),
  "shopping-cart": (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  ),
  "more-horizontal": (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
  ),
};

const sizes = {
  sm: { container: "w-6 h-6", icon: "w-3 h-3" },
  md: { container: "w-8 h-8 sm:w-10 sm:h-10", icon: "w-4 h-4 sm:w-5 sm:h-5" },
  lg: { container: "w-12 h-12", icon: "w-6 h-6" },
};

export function CategoryIcon({ category, size = "md", showBackground = true }: CategoryIconProps) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.value === category);
  const iconName = cat?.icon || "more-horizontal";
  const color = cat?.color || "#6b7280";
  const { container, icon } = sizes[size];

  if (!showBackground) {
    return (
      <svg
        className={icon}
        style={{ color }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {icons[iconName]}
      </svg>
    );
  }

  return (
    <div
      className={`${container} rounded-lg flex items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: `${color}15` }}
    >
      <svg
        className={icon}
        style={{ color }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {icons[iconName]}
      </svg>
    </div>
  );
}
