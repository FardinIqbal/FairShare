# app/models/user.rb
class User < ApplicationRecord
  # Devise modules for authentication
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

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
end
