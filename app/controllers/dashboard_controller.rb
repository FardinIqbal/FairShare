class DashboardController < ApplicationController
  def index
    @total_balance = current_user.total_balance
    @total_expenses = current_user.expenses.sum(:amount)
    @groups = current_user.groups
    @owed_amounts = calculate_owed_amounts
    @recent_activities = fetch_recent_activities
    @expense_categories = current_user.expenses.group(:category).sum(:amount)
  end

  private

  def calculate_owed_amounts
    owed_to_others = []
    owed_by_others = []

    current_user.groups.each do |group|
      balance = current_user.balance_in_group(group)
      if balance < 0
        owed_to_others << { group: group, amount: balance.abs }
      elsif balance > 0
        owed_by_others << { group: group, amount: balance }
      end
    end

    { owed_to_others: owed_to_others, owed_by_others: owed_by_others }
  end

  def fetch_recent_activities
    Expense.where(group: current_user.groups)
           .order(created_at: :desc)
           .limit(5)
           .includes(:user, :group)
  end
end