class Expense < ApplicationRecord
  belongs_to :user
  belongs_to :group

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :date, presence: true
  validates :user, presence: true
  validates :group, presence: true
  validates :category, presence: true

  CATEGORIES = %w[Food Transportation Housing Entertainment Utilities Other]
  validates :category, inclusion: { in: CATEGORIES }
end