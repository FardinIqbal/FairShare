class ExpensesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group
  before_action :authorize_user
  before_action :set_expense, only: [:show, :edit, :update, :destroy]

  def index
    @expenses = @group.expenses
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

  def authorize_user
    unless @group.users.include?(current_user)
      flash[:alert] = "You don't have permission to access expenses for this group."
      redirect_to groups_path
    end
  end

  def set_expense
    @expense = @group.expenses.find(params[:id])
  end

  def expense_params
    params.require(:expense).permit(:amount, :description, :date)
  end
end
