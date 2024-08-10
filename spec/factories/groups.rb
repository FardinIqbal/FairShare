FactoryBot.define do
  factory :group do
    name { Faker::Team.name }
    description { Faker::Lorem.paragraph }
  end
end
