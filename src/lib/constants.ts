// Expense category options
export const EXPENSE_CATEGORIES = [
  { value: "food", label: "Food & Drinks" },
  { value: "transport", label: "Transport" },
  { value: "accommodation", label: "Accommodation" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "utilities", label: "Utilities" },
  { value: "groceries", label: "Groceries" },
  { value: "other", label: "Other" },
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
