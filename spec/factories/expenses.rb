FactoryBot.define do
  factory :expense do
    amount { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    description { Faker::Lorem.sentence }
    date { Faker::Date.backward(days: 30) }
    association :user
    association :group
  end
end