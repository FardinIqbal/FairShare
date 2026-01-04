// Expense category options with icons and colors
export const EXPENSE_CATEGORIES = [
  { value: "food", label: "Food & Drinks", icon: "utensils", color: "#f97316" },
  { value: "transport", label: "Transport", icon: "car", color: "#3b82f6" },
  { value: "accommodation", label: "Accommodation", icon: "home", color: "#8b5cf6" },
  { value: "entertainment", label: "Entertainment", icon: "ticket", color: "#ec4899" },
  { value: "shopping", label: "Shopping", icon: "shopping-bag", color: "#10b981" },
  { value: "utilities", label: "Utilities", icon: "zap", color: "#eab308" },
  { value: "groceries", label: "Groceries", icon: "shopping-cart", color: "#14b8a6" },
  { value: "other", label: "Other", icon: "more-horizontal", color: "#6b7280" },
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"];

// Recurring frequency options
export const RECURRING_FREQUENCIES = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Every 2 weeks" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
] as const;

export type RecurringFrequency = (typeof RECURRING_FREQUENCIES)[number]["value"];

// Common currencies
export const CURRENCIES = [
  { value: "USD", label: "$ USD", symbol: "$" },
  { value: "EUR", label: "€ EUR", symbol: "€" },
  { value: "GBP", label: "£ GBP", symbol: "£" },
  { value: "CAD", label: "$ CAD", symbol: "C$" },
  { value: "AUD", label: "$ AUD", symbol: "A$" },
  { value: "JPY", label: "¥ JPY", symbol: "¥" },
  { value: "CNY", label: "¥ CNY", symbol: "¥" },
  { value: "INR", label: "₹ INR", symbol: "₹" },
  { value: "MXN", label: "$ MXN", symbol: "MX$" },
  { value: "BRL", label: "R$ BRL", symbol: "R$" },
  { value: "CHF", label: "CHF", symbol: "CHF" },
  { value: "KRW", label: "₩ KRW", symbol: "₩" },
  { value: "THB", label: "฿ THB", symbol: "฿" },
] as const;

export type Currency = (typeof CURRENCIES)[number]["value"];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.value === code)?.symbol || code;
}
