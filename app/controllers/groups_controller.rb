class GroupsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group, only: [:show, :edit, :update, :destroy]

  def index
    @groups = current_user.groups
  end

  def show
    @expenses = @group.expenses.order(date: :desc)
    @total_expenses = @group.total_expenses
    @per_person_share = @total_expenses.to_f / @group.users.count
    @group.update_balances_with_pending_payments

    @user_summaries = @group.users.map do |user|
      user_expenses = @group.expenses.where(user: user)
      {
        user: user,
        total_paid: user_expenses.sum(:amount),
        expense_count: user_expenses.count,
        largest_expense: user_expenses.maximum(:amount) || 0,
        net_balance: user.balance_in_group(@group)
      }
    end

    @current_user_summary = @user_summaries.find { |summary| summary[:user] == current_user }
    @optimized_settlements = @group.calculate_debts
    @current_user_owes = @optimized_settlements.select { |settlement| settlement[:from] == current_user }
    @current_user_owed = @optimized_settlements.select { |settlement| settlement[:to] == current_user }
    @most_expensive_category = @group.expenses
                                     .select('category, SUM(amount) as total_amount')
                                     .group(:category)
                                     .order('total_amount DESC')
                                     .first
                                 &.category

    @members = @group.users
    @non_members = User.where.not(id: @members.pluck(:id))

    @pending_payments = @group.payments.pending_approval
  end

  def new
    @group = Group.new
  end

  def create
    @group = Group.new(group_params)
    @group.leader = current_user
    @group.users << current_user

    if @group.save
      redirect_to @group, notice: 'Group was successfully created.'
    else
      render :new
    end
  end

  def edit
  end

  def update
    if @group.update(group_params)
      redirect_to @group, notice: 'Group was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    if @group.leader == current_user
      @group.destroy
      redirect_to groups_url, notice: 'Group was successfully deleted.'
    else
      redirect_to @group, alert: 'Only the group leader can delete the group.'
    end
  end

  private

  def set_group
    @group = Group.find(params[:id])
    unless current_user.groups.include?(@group)
      flash[:alert] = "You don't have access to this group."
      redirect_to groups_path
    end
  rescue ActiveRecord::RecordNotFound
    flash[:alert] = "The group you're looking for doesn't exist."
    redirect_to groups_path
  end

  def group_params
    params.require(:group).permit(:name, :description)
  end
end