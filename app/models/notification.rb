class Notification < ApplicationRecord
  belongs_to :recipient, class_name: 'User'
  belongs_to :actor, class_name: 'User'
  belongs_to :notifiable, polymorphic: true

  scope :unread, -> { where(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }
  scope :latest, -> { recent.limit(5) }

  def mark_as_read!
    update!(read_at: Time.current) unless read?
  end

  def read?
    read_at.present?
  end
end