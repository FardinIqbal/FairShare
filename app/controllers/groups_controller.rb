# app/controllers/groups_controller.rb

class GroupsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group, only: [:show, :edit, :update, :destroy, :add_users, :add_user]
  before_action :authorize_user, only: [:show, :edit, :update, :destroy]

  # GET /groups
  def index
    @groups = current_user.groups
  end

  # GET /groups/:id
  # GET /groups/:id
  def show
    @group = Group.find(params[:id])
    @expenses = @group.expenses.order(date: :desc)

    @total_expenses = @group.expenses.sum(:amount)
    @per_person_share = @total_expenses.to_f / @group.users.count

    splits_result = @group.calculate_splits

    # Add debugging
    Rails.logger.debug "splits_result: #{splits_result.inspect}"

    if splits_result.is_a?(Hash) && splits_result[:splits].is_a?(Array)
      @splits = splits_result[:splits]
    else
      # Handle the error case
      @splits = []
      flash.now[:alert] = "There was an error calculating splits. Please try again."
    end

    @user_summaries = @group.users.map do |user|
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

    @current_user_split = @splits.find { |split| split[:user] == current_user }
    @current_user_summary = @user_summaries.find { |summary| summary[:user] == current_user }

    @optimized_settlements = splits_result[:debts]

    # use the optimized settlements to find out who owes current user and who current user owes
    @current_user_owes = @optimized_settlements.select { |settlement| settlement[:from] == current_user }
    @current_user_owed = @optimized_settlements.select { |settlement| settlement[:to] == current_user }
  end



  # GET /groups/new
  def new
    @group = Group.new
  end

  # POST /groups
  def create
    @group = Group.new(group_params)
    @group.leader = current_user  # Set the current user as the group leader
    @group.users << current_user  # Add the current user to the group

    if @group.save
      flash[:notice] = 'Group was successfully created.'
      redirect_to @group
    else
      flash.now[:alert] = 'There was an error creating the group.'
      render :new
    end
  end

  # GET /groups/:id/edit
  def edit
  end

  # PATCH/PUT /groups/:id
  def update
    if @group.update(group_params)
      flash[:notice] = 'Group was successfully updated.'
      redirect_to @group
    else
      flash.now[:alert] = 'There was an error updating the group.'
      render :edit
    end
  end

  # DELETE /groups/:id
  def destroy
    @group.destroy
    flash[:notice] = 'Group was successfully deleted.'
    redirect_to groups_url
  end

  # GET /groups/:id/add_users
  def add_users
    @users = User.where.not(id: @group.users.pluck(:id))
  end

  # POST /groups/:id/add_user
  def add_user
    user = User.find(params[:user_id])
    if @group.users << user
      redirect_to @group, notice: 'User was successfully added to the group.'
    else
      redirect_to add_users_group_path(@group), alert: 'Failed to add user to the group.'
    end
  end

  private

  # Calculate optimized settlements to minimize the number of transactions
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

  # Set the group for specific actions
  def set_group
    @group = current_user.groups.find(params[:id])
  end

  # Strong parameters for group creation and update
  def group_params
    params.require(:group).permit(:name, :description)
  end

  # Ensure the current user has permission to access the group
  def authorize_user
    unless @group.users.include?(current_user)
      flash[:alert] = "You don't have permission to access this group."
      redirect_to groups_path
    end
  end
end