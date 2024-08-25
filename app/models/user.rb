class User < ApplicationRecord
  # Devise modules for authentication
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  attribute :demo, :boolean, default: false

  # Associations
  has_many :group_memberships
  has_many :groups, through: :group_memberships
  has_many :expenses
  has_many :balances

  has_many :friendships
  has_many :friends, through: :friendships
  has_many :inverse_friendships, class_name: "Friendship", foreign_key: "friend_id"
  has_many :inverse_friends, through: :inverse_friendships, source: :user

  has_many :notifications, foreign_key: :recipient_id, dependent: :destroy


  # Validations
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :email, presence: true, uniqueness: true


  # Instance Methods
  def full_name
    "#{first_name} #{last_name}"
  end

  def total_balance
    balances.sum(:amount)
  end

  def balance_in_group(group)
    balance = balances.find_by(group: group)
    balance ? balance.amount : 0
  end
end