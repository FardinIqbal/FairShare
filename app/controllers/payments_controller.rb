class PaymentsController < ApplicationController
  before_action :authenticate_user!

  def pay
    @group = Group.find(params[:group_id])
    @recipient = User.find(params[:user_id])
    amount = params[:amount].to_f

    ActiveRecord::Base.transaction do
      payment = Payment.create!(
        payer: current_user,
        recipient: @recipient,
        group: @group,
        amount: amount,
        status: :completed,
        notes: params[:notes]
      )

      update_balances(payment)

      create_notification(payment, 'payment_made')
    end

    redirect_to @group, notice: "Payment of #{helpers.number_to_currency(amount)} to #{@recipient.full_name} recorded."
  end

  def remind
    @group = Group.find(params[:group_id])
    @debtor = User.find(params[:user_id])
    amount = params[:amount].to_f

    notification = create_notification(nil, 'payment_reminder')

    redirect_to @group, notice: "Reminder sent to #{@debtor.full_name} for #{helpers.number_to_currency(amount)}."
  end

  private

  def update_balances(payment)
    payer_balance = payment.group.balances.find_by(user: payment.payer)
    recipient_balance = payment.group.balances.find_by(user: payment.recipient)

    payer_balance.update!(amount: payer_balance.amount + payment.amount)
    recipient_balance.update!(amount: recipient_balance.amount - payment.amount)
  end

  def create_notification(notifiable, action)
    Notification.create!(
      recipient: action == 'payment_made' ? notifiable.recipient : @debtor,
      actor: current_user,
      action: action,
      notifiable: notifiable,
      message: notification_message(action, notifiable)
    )
  end

  def notification_message(action, notifiable)
    case action
    when 'payment_made'
      "#{current_user.full_name} paid you #{helpers.number_to_currency(notifiable.amount)} in the group #{notifiable.group.name}"
    when 'payment_reminder'
      "#{current_user.full_name} reminded you about a payment of #{helpers.number_to_currency(params[:amount])} in the group #{@group.name}"
    end
  end
end