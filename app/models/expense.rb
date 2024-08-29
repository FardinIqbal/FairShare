class Expense < ApplicationRecord
  belongs_to :user
  belongs_to :group

  has_many :notifications, as: :notifiable, dependent: :destroy

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :description, presence: true
  validates :date, presence: true
  validates :user, presence: true
  validates :group, presence: true
  validates :category, presence: true

  after_create :create_notifications

  CATEGORIES = %w[Food Transportation Housing Entertainment Utilities Other Accommodation].freeze
  validates :category, inclusion: { in: CATEGORIES }
  validates :amount, numericality: { greater_than: 0, less_than_or_equal_to: 10_000 }


  after_create :update_group_balances
  after_update :update_group_balances
  after_destroy :update_group_balances

  private

  def update_group_balances
    group.update_balances
  end

  def create_notifications
    group.users.where.not(id: user_id).each do |recipient|
      notification = Notification.new(
        recipient: recipient,
        actor: user,
        action: 'new_expense',
        notifiable: self,
        message: "#{user.full_name} added a new expense of #{ActionController::Base.helpers.number_to_currency(amount)} in #{group.name}"
      )

      unless notification.save
        errors.add(:base, "Failed to create notification for user #{recipient.id}: #{notification.errors.full_messages.join(', ')}")
      end
    end
  end
end