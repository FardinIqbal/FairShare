# Step 4: Update the Group model (app/models/group.rb)
class Group < ApplicationRecord
  has_many :expenses
  has_and_belongs_to_many :users

  validates :name, presence: true, uniqueness: true

  def calculate_splits
    total_expenses = expenses.sum(:amount)
    per_person_share = total_expenses / users.count

    splits = users.map do |user|
      user_expenses = expenses.where(user: user).sum(:amount)
      {
        user: user,
        paid: user_expenses,
        owed: per_person_share,
        net: user_expenses - per_person_share
      }
    end

    splits.sort_by { |split| -split[:net] }
  end
end