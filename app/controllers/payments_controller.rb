class PaymentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group
  before_action :set_recipient_or_debtor, only: [:pay, :remind]

  def pay
    amount = params[:amount].to_f

    ActiveRecord::Base.transaction do
      @payment = Payment.new(
        payer: current_user,
        recipient: @recipient,
        group: @group,
        amount: amount,
        status: :completed,
        notes: params[:notes]
      )

      if @payment.save
        update_balances(@payment)
        create_payment_notification(@payment)
        redirect_to @group, notice: "Payment of #{helpers.number_to_currency(amount)} to #{@recipient.full_name} recorded."
      else
        redirect_to @group, alert: "Failed to process payment. Please try again."
      end
    end
  end

  def remind
    amount = params[:amount].to_f
    create_reminder_notification(amount)
    redirect_to @group, notice: "Reminder sent to #{@debtor.full_name} for #{helpers.number_to_currency(amount)}."
  end

  private

  def set_group
    @group = Group.find(params[:group_id])
  end

  def set_recipient_or_debtor
    if params[:action] == 'pay'
      @recipient = User.find(params[:user_id])
    else
      @debtor = User.find(params[:user_id])
    end
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
      action: 'payment_made',
      notifiable: payment,
      message: "#{current_user.full_name} paid you #{helpers.number_to_currency(payment.amount)} in the group #{@group.name}"
    )
  end

  def create_reminder_notification(amount)
    Notification.create!(
      recipient: @debtor,
      actor: current_user,
      action: 'payment_reminder',
      notifiable: @group,
      message: "#{current_user.full_name} reminded you about a payment of #{helpers.number_to_currency(amount)} in the group #{@group.name}"
    )
  end
end