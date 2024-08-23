FactoryBot.define do
  factory :notification do
    recipient { nil }
    actor { nil }
    action { "MyString" }
    notifiable { nil }
    message { "MyText" }
    read_at { "2024-08-23 13:00:08" }
  end
end
