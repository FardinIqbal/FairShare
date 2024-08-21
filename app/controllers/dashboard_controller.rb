class DashboardController < ApplicationController
  before_action :authenticate_user!

  def index
    @groups = current_user.groups
    @recent_expenses = Expense.where(group: @groups).order(date: :desc).limit(5)
    @total_balance = calculate_total_balance
    @recent_activities = recent_activities
    @expenses_by_month = expenses_by_month
    @top_expense_categories = top_expense_categories
    @upcoming_expenses = upcoming_expenses
  end

  private

  def calculate_total_balance
    total = 0
    current_user.groups.each do |group|
      splits_result = group.calculate_splits
      user_split = splits_result[:splits].find { |split| split[:user] == current_user }
      total += user_split[:net] if user_split
    end
    total
  end

  def recent_activities
    Expense.where(group: @groups).order(created_at: :desc).limit(10)
  end

  def expenses_by_month
    Expense.where(group: @groups)
           .where('date >= ?', 6.months.ago.beginning_of_month)
           .group("DATE_TRUNC('month', date)")
           .sum(:amount)
  end

  def top_expense_categories
    Expense.where(group: @groups)
           .group(:category)
           .order('sum_amount DESC')
           .limit(5)
           .sum(:amount)
  end

  def upcoming_expenses
    Expense.where(group: @groups)
           .where('date > ?', Date.today)
           .order(:date)
           .limit(5)
  end
end