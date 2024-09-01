class Balance < ApplicationRecord
  belongs_to :user
  belongs_to :group

  validates :amount, presence: true

  def adjust_for_payment(payment)
    if user == payment.payer
      update!(amount: amount + payment.amount)
    elsif user == payment.recipient
      update!(amount: amount - payment.amount)
    end
  end
end