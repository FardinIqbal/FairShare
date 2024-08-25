class Group < ApplicationRecord
  # Associations
  has_many :group_memberships, dependent: :destroy
  has_many :users, through: :group_memberships
  has_many :expenses
  has_many :balances, dependent: :destroy
  belongs_to :leader, class_name: "User"

  # Validations
  validates :name, presence: true, uniqueness: true
  validates :leader, presence: true

  def total_expenses
    expenses.sum(:amount)
  end

  def update_balances
    total = total_expenses
    per_person_share = total.to_f / users.count

    transaction do
      users.each do |user|
        user_paid = expenses.where(user: user).sum(:amount)
        balance = user_paid - per_person_share
        user_balance = balances.find_or_initialize_by(user: user)
        user_balance.update!(amount: balance)
      end
    end
  end

  def calculate_debts
    positive_balances = balances.where("amount > 0").order(amount: :desc).to_a
    negative_balances = balances.where("amount < 0").order(amount: :asc).to_a

    debts = []

    while positive_balances.any? && negative_balances.any?
      payer = positive_balances.first
      ower = negative_balances.first

      amount = [payer.amount, -ower.amount].min

      debts << {
        from: ower.user,
        to: payer.user,
        amount: amount.round(2)
      }

      payer.amount -= amount
      ower.amount += amount

      positive_balances.shift if payer.amount.zero?
      negative_balances.shift if ower.amount.zero?
    end

    debts
  end
end