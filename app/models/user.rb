# app/models/user.rb
class User < ApplicationRecord
  # Devise modules for authentication
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  attribute :demo, :boolean, default: false

  # Associations
  has_and_belongs_to_many :groups  # A user can belong to many groups
  has_many :expenses  # A user can have many expenses

  # Validations
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :email, presence: true, uniqueness: true

  # Instance Methods
  def full_name
    "#{first_name} #{last_name}"
  end

  def calculate_total_balance
    total = 0
    groups.each do |group|
      splits_result = group.calculate_splits
      user_split = splits_result[:splits].find { |split| split[:user] == self }
      total += user_split[:net] if user_split
    end
    total
  end
end
