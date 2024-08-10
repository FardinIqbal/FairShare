# app/controllers/dashboard_controller.rb
class DashboardController < ApplicationController
  before_action :authenticate_user!

  def index
    @groups = current_user.groups
    @recent_expenses = Expense.where(group: @groups).order(date: :desc).limit(5)
    @total_owed = calculate_total_owed
  end

  private

  def calculate_total_owed
    total = 0
    current_user.groups.each do |group|
      splits = group.calculate_splits
      user_split = splits.find { |split| split[:user] == current_user }
      total += user_split[:net] if user_split
    end
    total
  end
end