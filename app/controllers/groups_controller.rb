class GroupsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group, only: [:show, :edit, :update, :destroy]

  def index
    @groups = current_user.groups
  end

  def show
    @group = Group.find(params[:id])
    @expenses = @group.expenses.order(date: :desc)

    @total_expenses = @group.total_expenses
    @per_person_share = @total_expenses.to_f / @group.users.count

    @group.update_balances  # Update balances before calculating debts

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
  end

  def new
    @group = Group.new
  end

  def create
    @group = Group.new(group_params)
    @group.leader = current_user
    @group.users << current_user

    respond_to do |format|
      if @group.save
        format.html { redirect_to add_users_group_path(@group), notice: 'Group was successfully created.' }
        format.json { render json: { success: true, redirect_url: add_users_group_path(@group) }, status: :created }
      else
        format.html { render :new }
        format.json { render json: { success: false, errors: @group.errors.full_messages }, status: :unprocessable_entity }
      end
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
    @group.destroy
    redirect_to groups_url, notice: 'Group was successfully deleted.'
  end

  def add_users
    @group = Group.find(params[:id])
    @users = User.where.not(id: @group.users.pluck(:id))
  end

  def add_user
    @group = Group.find(params[:id])
    user = User.find(params[:user_id])
    if @group.users << user
      redirect_to @group, notice: 'User was successfully added to the group.'
    else
      redirect_to add_users_group_path(@group), alert: 'Failed to add user to the group.'
    end
  end

  private

  def set_group
    @group = current_user.groups.find(params[:id])
  end

  def group_params
    params.require(:group).permit(:name, :description)
  end

  private
  def calculate_user_summary(user)
    user_expenses = @group.expenses.where(user: user)
    total_paid = user_expenses.sum(:amount)
    {
      user: user,
      total_paid: total_paid,
      expense_count: user_expenses.count,
      largest_expense: user_expenses.maximum(:amount) || 0,
      net_balance: total_paid - @per_person_share
    }
  end
end