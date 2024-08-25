# app/controllers/users_controller.rb
class UsersController < ApplicationController
  before_action :authenticate_user!

  def show
    @user = User.find(params[:id])
    @groups = @user.groups
    @total_balance = @user.total_balance
    @recent_expenses = @user.expenses.order(created_at: :desc).limit(5)
    @expense_categories = @user.expenses.group(:category).sum(:amount)
  end
end