class Expense < ApplicationRecord
  belongs_to :user
  belongs_to :group

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :description, presence: true
  validates :date, presence: true
  validates :user, presence: true
  validates :group, presence: true
  validates :category, presence: true

  CATEGORIES = %w[Food Transportation Housing Entertainment Utilities Other Accommodation].freeze
  validates :category, inclusion: { in: CATEGORIES }

  after_create :update_group_balances
  after_update :update_group_balances
  after_destroy :update_group_balances

  private

  def update_group_balances
    group.update_balances
  end
end