class Friendship < ApplicationRecord
  belongs_to :user
  belongs_to :friend, class_name: 'User'

  validates :user_id, uniqueness: { scope: :friend_id }
  validates :status, inclusion: { in: %w[pending accepted rejected] }

  def self.create_reciprocal_for_ids(user_id, friend_id)
    user_friendship = Friendship.create(user_id: user_id, friend_id: friend_id, status: 'pending')
    friend_friendship = Friendship.create(user_id: friend_id, friend_id: user_id, status: 'pending')
    [user_friendship, friend_friendship]
  end
end