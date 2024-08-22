class PaymentsController < ApplicationController
  before_action :authenticate_user!

  def pay
    @group = Group.find(params[:group_id])
    @recipient = User.find(params[:user_id])
    amount = params[:amount].to_f

    ActiveRecord::Base.transaction do
      current_user_balance = @group.balances.find_by(user: current_user)
      recipient_balance = @group.balances.find_by(user: @recipient)

      current_user_balance.update!(amount: current_user_balance.amount + amount)
      recipient_balance.update!(amount: recipient_balance.amount - amount)
    end

    redirect_to @group, notice: "Payment of #{number_to_currency(amount)} to #{@recipient.full_name} recorded."
  end

  def remind
    @group = Group.find(params[:group_id])
    @debtor = User.find(params[:user_id])
    amount = params[:amount]

    # In a real system, you'd send an actual reminder (e.g., email)
    # For now, we'll just show a success message

    redirect_to @group, notice: "Reminder sent to #{@debtor.full_name} for #{number_to_currency(amount)}."
  end
end