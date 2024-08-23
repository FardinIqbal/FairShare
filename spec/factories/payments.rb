FactoryBot.define do
  factory :payment do
    amount { "9.99" }
    status { 1 }
    transaction_id { "MyString" }
    notes { "MyText" }
  end
end
