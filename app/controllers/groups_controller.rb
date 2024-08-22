class GroupsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group, only: [:show, :edit, :update, :destroy]

  def index
    @groups = current_user.groups
  end

  def show
    @expenses = @group.expenses.order(date: :desc)
    @total_expenses = @group.total_expenses
    @balances = @group.balances
    @debts = @group.calculate_debts
    @current_user_balance = @group.balances.find_by(user: current_user)&.amount || 0
  end

  def new
    @group = Group.new
  end

  def create
    @group = Group.new(group_params)
    @group.leader = current_user

    if @group.save
      @group.group_memberships.create(user: current_user)
      @group.balances.create(user: current_user, amount: 0)
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
    @group.destroy
    redirect_to groups_url, notice: 'Group was successfully deleted.'
  end

  private

  def set_group
    @group = current_user.groups.find(params[:id])
  end

  def group_params
    params.require(:group).permit(:name, :description)
  end
end