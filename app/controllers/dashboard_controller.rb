class DashboardController < ApplicationController
  before_action :authenticate_user!

  def index
    @groups = current_user.groups
    @total_balance = current_user.total_balance
    @recent_expenses = Expense.where(group: @groups).order(created_at: :desc).limit(5)
    @owed_by_others = calculate_owed_by_others
    @owed_to_others = calculate_owed_to_others
  end

  private

  def calculate_owed_by_others
    current_user.balances.where('amount > 0').includes(:group).map do |balance|
      { group: balance.group, amount: balance.amount }
    end
  end

  def calculate_owed_to_others
    current_user.balances.where('amount < 0').includes(:group).map do |balance|
      { group: balance.group, amount: -balance.amount }
    end
  end
end