class Payment < ApplicationRecord
  belongs_to :payer, class_name: 'User'
  belongs_to :recipient, class_name: 'User'
  belongs_to :group

  enum status: { pending: 0, completed: 1, failed: 2 }

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :status, presence: true
end