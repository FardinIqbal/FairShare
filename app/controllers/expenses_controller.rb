class ExpensesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group, except: [:new_with_group_selection]
  before_action :set_expense, only: [:show, :edit, :update, :destroy]

  def index
    @expenses = @group.expenses.order(date: :desc)
    @total_expenses = @group.expenses.sum(:amount)
    @user_balance = calculate_user_balance
  end

  def show
  end

  def new_with_group_selection
    @groups = current_user.groups
  end

  def new
    @expense = @group.expenses.build
  end

  def create
    @expense = @group.expenses.build(expense_params)
    @expense.user = current_user

    if @expense.save
      Rails.logger.info "Expense saved successfully: #{@expense.inspect}"
      create_new_expense_notification(@expense)
      redirect_to group_path(@group), notice: 'Expense was successfully created.'
    else
      Rails.logger.error "Failed to save expense: #{@expense.errors.full_messages}"
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
    Rails.logger.info "Creating notifications for expense: #{expense.id}"
    users_to_notify = @group.users # Include all users, including the current user
    Rails.logger.info "Users to notify: #{users_to_notify.pluck(:id)}"

    users_to_notify.each do |user|
      notification = Notification.new(
        recipient: user,
        actor: current_user,
        action: 'new_expense',
        notifiable: expense,
        message: "#{current_user.full_name} added a new expense '#{expense.description}' for #{helpers.number_to_currency(expense.amount)} in the group '#{@group.name}'. Category: #{expense.category}"
      )

      if notification.save
        Rails.logger.info "Notification created for user #{user.id}: #{notification.inspect}"
      else
        Rails.logger.error "Failed to create notification for user #{user.id}: #{notification.errors.full_messages}"
      end
    end
  end
end