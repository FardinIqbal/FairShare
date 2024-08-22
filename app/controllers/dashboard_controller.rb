class DashboardController < ApplicationController
  before_action :authenticate_user!

  def index
    @groups = current_user.groups
    @total_expenses = calculate_total_expenses
    @recent_activities = recent_activities
    @owed_by_others = calculate_owed_by_others
    @owed_to_others = calculate_owed_to_others
    @total_balance = calculate_total_balance
    @recent_expenses_count = recent_expenses_count

    # Debugging
    Rails.logger.debug "Total Balance: #{@total_balance}"
    Rails.logger.debug "Total Expenses: #{@total_expenses}"
    Rails.logger.debug "Groups: #{@groups.pluck(:id, :name)}"
    Rails.logger.debug "Owed by others: #{@owed_by_others}"
    Rails.logger.debug "Owed to others: #{@owed_to_others}"
  end

  private

  def calculate_total_balance
    owed_by_others_total = @owed_by_others.sum { |debt| debt[:amount] }
    owed_to_others_total = @owed_to_others.sum { |debt| debt[:amount] }
    balance = owed_by_others_total - owed_to_others_total
    Rails.logger.debug "Calculated total balance: Owed by others (#{owed_by_others_total}) - Owed to others (#{owed_to_others_total}) = #{balance}"
    balance.round(2)
  end

  def calculate_total_expenses
    Expense.where(group: @groups).sum(:amount)
  end

  def recent_activities
    Expense.where(group: @groups).order(created_at: :desc).limit(10)
  end

  def recent_expenses_count
    Expense.where(group: @groups).where('created_at > ?', 30.days.ago).count
  end

  def calculate_owed_by_others
    debts = []
    current_user.groups.each do |group|
      splits_result = group.calculate_splits
      splits_result[:debts].each do |debt|
        if debt[:to] == current_user
          debts << { user: debt[:from], amount: debt[:amount], group: group }
        end
      end
    end
    debts
  end

  def calculate_owed_to_others
    debts = []
    current_user.groups.each do |group|
      splits_result = group.calculate_splits
      splits_result[:debts].each do |debt|
        if debt[:from] == current_user
          debts << { user: debt[:to], amount: debt[:amount], group: group }
        end
      end
    end
    debts
  end
end