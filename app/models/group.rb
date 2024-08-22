class Group < ApplicationRecord
  # Associations
  has_many :expenses
  has_and_belongs_to_many :users
  belongs_to :leader, class_name: "User"

  # Validations
  validates :name, presence: true, uniqueness: true
  validates :leader, presence: true

  # Calculate the expense splits for all users in the group
  def calculate_splits
    Rails.logger.debug "Starting split calculation for group #{id}"
    total_expenses = expenses.sum(:amount)
    Rails.logger.debug "Total expenses: #{total_expenses}"
    per_person_share = total_expenses.to_f / users.count
    Rails.logger.debug "Per person share: #{per_person_share}"

    splits = users.map do |user|
      user_expenses = expenses.where(user: user).sum(:amount)
      Rails.logger.debug "User #{user.id} expenses: #{user_expenses}"
      net = user_expenses - per_person_share
      Rails.logger.debug "User #{user.id} net: #{net}"
      {
        user: user,
        paid: user_expenses,
        owed: per_person_share,
        net: net  # This is the key change
      }
    end
    Rails.logger.debug "Calculated splits: #{splits}"

    # Calculate who owes whom
    debts = []
    payers = splits.select { |split| split[:net] > 0 }.sort_by { |split| -split[:net] }
    owers = splits.select { |split| split[:net] < 0 }.sort_by { |split| split[:net] }

    payers.each do |payer|
      owers.each do |ower|
        break if payer[:net].zero? || ower[:net].zero?

        amount = [payer[:net], -ower[:net]].min
        debts << {
          from: ower[:user],
          to: payer[:user],
          amount: amount.round(2)
        }
        payer[:net] -= amount
        ower[:net] += amount
      end
    end

    result = {
      splits: splits,
      debts: debts
    }
    Rails.logger.debug "Final split result for group #{id}: #{result}"
    result
  end
end