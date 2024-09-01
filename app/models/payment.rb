class Payment < ApplicationRecord
  belongs_to :payer, class_name: 'User'
  belongs_to :recipient, class_name: 'User'
  belongs_to :group

  enum status: {
    pending: 0,
    pending_approval: 1,
    approved: 2,
    rejected: 3,
    completed: 4,
    failed: 5
  }

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :status, presence: true
  validate :payer_and_recipient_are_different
  validate :payer_and_recipient_in_same_group

  scope :pending_approval, -> { where(status: :pending_approval) }
  scope :for_user, ->(user) { where(payer: user).or(where(recipient: user)) }

  after_create :create_notification

  private

  def payer_and_recipient_are_different
    if payer_id == recipient_id
      errors.add(:base, "Payer and recipient must be different users")
    end
  end

  def payer_and_recipient_in_same_group
    unless group.users.include?(payer) && group.users.include?(recipient)
      errors.add(:base, "Both payer and recipient must be members of the group")
    end
  end

  def create_notification
    Notification.create(
      recipient: recipient,
      actor: payer,
      action: 'new_payment',
      notifiable: self,
      message: "#{payer.full_name} has initiated a payment of #{ActionController::Base.helpers.number_to_currency(amount)} to you in the group #{group.name}"
    )
  end
end