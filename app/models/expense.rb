class Expense < ApplicationRecord
  belongs_to :user
  belongs_to :group

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :date, presence: true
  validates :user, presence: true
  validates :group, presence: true
end