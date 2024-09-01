class PaymentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group
  before_action :set_payment, only: [:approve, :reject]
  before_action :set_recipient, only: [:mark_as_paid]

  def mark_as_paid
    amount = params[:amount].to_f

    @payment = Payment.new(
      payer: current_user,
      recipient: @recipient,
      group: @group,
      amount: amount,
      status: :pending_approval,
      notes: params[:notes]
    )

    if @payment.save
      create_payment_notification(@payment)
      redirect_to @group, notice: "Payment of #{helpers.number_to_currency(amount)} to #{@recipient.full_name} marked as paid and pending approval."
    else
      redirect_to @group, alert: "Failed to mark payment as paid. Please try again."
    end
  end

  def approve
    if @payment.update(status: :approved)
      update_balances(@payment)
      create_approval_notification(@payment)
      redirect_to @group, notice: "Payment of #{helpers.number_to_currency(@payment.amount)} from #{@payment.payer.full_name} has been approved."
    else
      redirect_to @group, alert: "Failed to approve payment. Please try again."
    end
  end

  def reject
    if @payment.update(status: :rejected)
      create_rejection_notification(@payment)
      redirect_to @group, notice: "Payment of #{helpers.number_to_currency(@payment.amount)} from #{@payment.payer.full_name} has been rejected."
    else
      redirect_to @group, alert: "Failed to reject payment. Please try again."
    end
  end

  def remind
    debtor = User.find(params[:user_id])
    amount = params[:amount].to_f
    create_reminder_notification(debtor, amount)
    redirect_to @group, notice: "Reminder sent to #{debtor.full_name} for #{helpers.number_to_currency(amount)}."
  end

  private

  def set_group
    @group = Group.find(params[:group_id])
  end

  def set_payment
    @payment = Payment.find(params[:id])
  end

  def set_recipient
    @recipient = User.find(params[:recipient_id])
  end

  def update_balances(payment)
    payer_balance = payment.group.balances.find_by(user: payment.payer)
    recipient_balance = payment.group.balances.find_by(user: payment.recipient)

    payer_balance.update!(amount: payer_balance.amount + payment.amount)
    recipient_balance.update!(amount: recipient_balance.amount - payment.amount)
  end

  def create_payment_notification(payment)
    Notification.create!(
      recipient: payment.recipient,
      actor: current_user,
      action: 'payment_marked_as_paid',
      notifiable: payment,
      message: "#{current_user.full_name} marked a payment of #{helpers.number_to_currency(payment.amount)} as paid to you in the group #{@group.name}. Please approve or reject this payment."
    )
  end

  def create_approval_notification(payment)
    Notification.create!(
      recipient: payment.payer,
      actor: current_user,
      action: 'payment_approved',
      notifiable: payment,
      message: "Your payment of #{helpers.number_to_currency(payment.amount)} to #{payment.recipient.full_name} in the group #{@group.name} has been approved."
    )
  end

  def create_rejection_notification(payment)
    Notification.create!(
      recipient: payment.payer,
      actor: current_user,
      action: 'payment_rejected',
      notifiable: payment,
      message: "Your payment of #{helpers.number_to_currency(payment.amount)} to #{payment.recipient.full_name} in the group #{@group.name} has been rejected."
    )
  end

  def create_reminder_notification(debtor, amount)
    Notification.create!(
      recipient: debtor,
      actor: current_user,
      action: 'payment_reminder',
      notifiable: @group,
      message: "#{current_user.full_name} reminded you about a payment of #{helpers.number_to_currency(amount)} in the group #{@group.name}"
    )
  end
end