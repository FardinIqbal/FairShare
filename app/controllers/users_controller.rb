class UsersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user, only: [:show, :destroy]

  def show
    @groups = @user.groups
    @total_balance = @user.total_balance
    @recent_expenses = @user.expenses.order(created_at: :desc).limit(5)
    @expense_categories = @user.expenses.group(:category).sum(:amount)
  end

  def destroy
    if @user.destroy
      redirect_to root_path, notice: 'User was successfully deleted.'
    else
      redirect_to user_path(@user), alert: 'Failed to delete user. Please try again.'
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  end
end