class GroupsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group, only: [:show, :edit, :update, :destroy, :add_users, :add_user]
  before_action :authorize_user, only: [:show, :edit, :update, :destroy]
  def index
    @groups = current_user.groups
  end

  def show
    @group = Group.find(params[:id])
    @expenses = @group.expenses.order(date: :desc)
    @splits = @group.calculate_splits
    @current_user_split = @splits.find { |split| split[:user] == current_user }

    @you_owe = @splits.select { |split| split[:user] != current_user && split[:net] > @current_user_split[:net] }
                      .map { |split| { user: split[:user], amount: split[:net] - @current_user_split[:net] } }

    @you_are_owed = @splits.select { |split| split[:user] != current_user && split[:net] < @current_user_split[:net] }
                           .map { |split| { user: split[:user], amount: @current_user_split[:net] - split[:net] } }

    @user_summaries = @group.users.map do |user|
      user_expenses = @expenses.where(user: user)
      {
        user: user,
        total_paid: user_expenses.sum(:amount),
        expense_count: user_expenses.count,
        largest_expense: user_expenses.maximum(:amount) || 0,
        net_balance: @splits.find { |split| split[:user] == user }[:net]
      }
    end

    @optimized_settlements = calculate_optimized_settlements(@splits)
  end

  def new
    @group = Group.new
  end

  def create
    @group = Group.new(group_params)
    @group.users << current_user

    if @group.save
      flash[:notice] = 'Group was successfully created.'
      redirect_to @group
    else
      flash.now[:alert] = 'There was an error creating the group.'
      render :new
    end
  end


  def edit
  end


  def update
    if @group.update(group_params)
      flash[:notice] = 'Group was successfully updated.'
      redirect_to @group
    else
      flash.now[:alert] = 'There was an error updating the group.'
      render :edit
    end
  end

  def destroy
    @group.destroy
    flash[:notice] = 'Group was successfully deleted.'
    redirect_to groups_url
  end

  def add_users
    @users = User.where.not(id: @group.users.pluck(:id))
  end

  def add_user
    user = User.find(params[:user_id])
    if @group.users << user
      redirect_to @group, notice: 'User was successfully added to the group.'
    else
      redirect_to add_users_group_path(@group), alert: 'Failed to add user to the group.'
    end
  end

  private

  def calculate_optimized_settlements(splits)
    debtors = splits.select { |s| s[:net] < 0 }.sort_by { |s| s[:net] }
    creditors = splits.select { |s| s[:net] > 0 }.sort_by { |s| -s[:net] }
    settlements = []

    while debtors.any? && creditors.any?
      debtor = debtors.first
      creditor = creditors.first
      amount = [debtor[:net].abs, creditor[:net]].min

      settlements << {
        from: debtor[:user],
        to: creditor[:user],
        amount: amount
      }

      debtor[:net] += amount
      creditor[:net] -= amount

      debtors.shift if debtor[:net].zero?
      creditors.shift if creditor[:net].zero?
    end

    settlements
  end

  def set_group
    @group = current_user.groups.find(params[:id])
  end

  def group_params
    params.require(:group).permit(:name, :description)
  end

  def authorize_user
    unless @group.users.include?(current_user)
      flash[:alert] = "You don't have permission to access this group."
      redirect_to groups_path
    end
  end
end
