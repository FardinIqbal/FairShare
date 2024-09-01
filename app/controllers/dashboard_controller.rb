class DashboardController < ApplicationController
  before_action :authenticate_user!

  def index
    @total_balance = current_user.total_balance
    @total_expenses = current_user.expenses.sum(:amount)
    @groups = current_user.groups
    @owed_amounts = calculate_owed_amounts
    @recent_activities = fetch_recent_activities
    @expense_categories = current_user.expenses.group(:category).sum(:amount)
    @pending_payments = current_user.pending_payments
    @pending_approvals = current_user.pending_approvals
  end

  def pay_debt
    group = current_user.groups.find(params[:group_id])
    amount = params[:amount].to_f
    recipient = group.users.where.not(id: current_user.id).first # This is simplified; you might want to determine the recipient more accurately

    payment = Payment.new(
      payer: current_user,
      recipient: recipient,
      group: group,
      amount: amount,
      status: :pending_approval
    )

    if payment.save
      redirect_to dashboard_path, notice: "Payment of #{helpers.number_to_currency(amount)} marked as paid and pending approval."
    else
      redirect_to dashboard_path, alert: "Failed to mark payment as paid. Please try again."
    end
  end

  def remind_payment
    group = current_user.groups.find(params[:group_id])
    amount = params[:amount].to_f
    debtor = group.users.where.not(id: current_user.id).first # This is simplified; you might want to determine the debtor more accurately

    notification = Notification.create(
      recipient: debtor,
      actor: current_user,
      action: 'payment_reminder',
      notifiable: group,
      message: "#{current_user.full_name} reminded you about a payment of #{helpers.number_to_currency(amount)} in the group #{group.name}"
    )

    if notification.persisted?
      redirect_to dashboard_path, notice: "Payment reminder sent successfully."
    else
      redirect_to dashboard_path, alert: "Failed to send payment reminder. Please try again."
    end
  end

  private

  def calculate_owed_amounts
    owed_to_others = []
    owed_by_others = []

    current_user.groups.each do |group|
      balance = current_user.balance_in_group(group)
      if balance < 0
        owed_to_others << { group: group, amount: balance.abs }
      elsif balance > 0
        owed_by_others << { group: group, amount: balance }
      end
    end

    { owed_to_others: owed_to_others, owed_by_others: owed_by_others }
  end

  def fetch_recent_activities
    Expense.where(group: current_user.groups)
           .order(created_at: :desc)
           .limit(5)
           .includes(:user, :group)
  end
end