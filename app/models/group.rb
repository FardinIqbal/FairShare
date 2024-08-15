# app/models/group.rb

class Group < ApplicationRecord
  # Associations
  has_many :expenses
  has_and_belongs_to_many :users
  belongs_to :leader, class_name: "User"  # Ensure this line is present


  # Validations
  validates :name, presence: true, uniqueness: true
  validates :leader, presence: true

  # Calculate the expense splits for all users in the group
  def calculate_splits
    total_expenses = expenses.sum(:amount)
    per_person_share = total_expenses.to_f / users.count

    # Calculate individual splits
    splits = users.map do |user|
      user_expenses = expenses.where(user: user).sum(:amount)
      {
        user: user,
        paid: user_expenses,
        owed: per_person_share,
        net: user_expenses - per_person_share
      }
    end

    # Calculate who owes whom
    debts = []
    splits.each do |payer|
      if payer[:net] > 0
        splits.each do |ower|
          if ower[:net] < 0
            amount = [payer[:net], -ower[:net]].min
            debts << {
              from: ower[:user],
              to: payer[:user],
              amount: amount.round(2)
            }
            payer[:net] -= amount
            ower[:net] += amount
            break if payer[:net].zero?
          end
        end
      end
    end

    {
      splits: splits,
      debts: debts
    }
  end
end