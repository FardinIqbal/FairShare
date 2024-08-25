class ExpensesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group
  before_action :set_expense, only: [:show, :edit, :update, :destroy]

  def index
    @expenses = @group.expenses.order(date: :desc)
    @total_expenses = @group.expenses.sum(:amount)
    @user_balance = calculate_user_balance
  end

  def show
  end

  def new
    @expense = @group.expenses.build
  end

  def create
    @expense = @group.expenses.build(expense_params)
    @expense.user = current_user

    if @expense.save
      create_new_expense_notification(@expense)
      redirect_to group_expense_path(@group, @expense), notice: 'Expense was successfully created.'
    else
      render :new
    end
  end

  def edit
  end

  def update
    if @expense.update(expense_params)
      redirect_to group_expense_path(@group, @expense), notice: 'Expense was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @expense.destroy
    redirect_to group_expenses_path(@group), notice: 'Expense was successfully destroyed.'
  end

  private

  def set_group
    @group = current_user.groups.find(params[:group_id])
  end

  def set_expense
    @expense = @group.expenses.find(params[:id])
  end

  def calculate_user_balance
    current_user.balance_in_group(@group)
  end

  def expense_params
    params.require(:expense).permit(:amount, :description, :date, :category)
  end

  def create_new_expense_notification(expense)
    @group.users.where.not(id: current_user.id).each do |user|
      Notification.create(
        recipient: user,
        actor: current_user,
        action: 'new_expense',
        notifiable: expense,
        message: "#{current_user.full_name} added a new expense of #{helpers.number_to_currency(expense.amount)} in #{@group.name}"
      )
    end
  end
end