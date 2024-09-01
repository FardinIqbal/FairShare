# db/seeds.rb

require 'faker'

puts "Clearing existing data..."
Payment.destroy_all
Expense.destroy_all
Balance.destroy_all
GroupMembership.destroy_all
Friendship.destroy_all
Group.destroy_all
User.destroy_all

def create_user(first_name, last_name)
  User.create!(
    first_name: first_name,
    last_name: last_name,
    email: "#{first_name.downcase}.#{last_name.downcase}@example.com",
    password: 'password123',
    password_confirmation: 'password123'
  )
end

puts "Creating users..."
users = [
  create_user("Emma", "Johnson"),
  create_user("Liam", "Smith"),
  create_user("Olivia", "Brown"),
  create_user("Noah", "Jones"),
  create_user("Ava", "Garcia"),
  create_user("Ethan", "Miller"),
  create_user("Sophia", "Davis"),
  create_user("Mason", "Rodriguez"),
  create_user("Isabella", "Martinez"),
  create_user("William", "Hernandez"),
  create_user("Mia", "Lopez"),
  create_user("James", "Gonzalez"),
  create_user("Charlotte", "Wilson"),
  create_user("Benjamin", "Anderson"),
  create_user("Amelia", "Thomas"),
  create_user("Elijah", "Taylor"),
  create_user("Harper", "Moore"),
  create_user("Lucas", "Jackson"),
  create_user("Evelyn", "Martin"),
  create_user("Alexander", "Lee")
]

puts "Creating groups..."
groups = [
  { name: "NYC Roommates", description: "Shared expenses for apartment 5B", members: users[0..3] },
  { name: "Europe Summer 2024", description: "Backpacking trip across Europe", members: users[2..6] },
  { name: "Friday Night Poker", description: "Weekly poker night expenses", members: users[5..9] },
  { name: "Ski Trip 2025", description: "Annual ski trip to Aspen", members: users[1..4] + [users[7], users[10]] },
  { name: "Book Club", description: "Monthly book club meetups", members: users[3..7] + [users[11], users[13]] },
  { name: "Office Lunch Group", description: "Team lunch rotations", members: users[8..14] },
  { name: "Family Reunion 2024", description: "Johnson family reunion expenses", members: [users[0], users[5], users[9], users[12]] },
  { name: "Fitness Challenge", description: "Group fitness program expenses", members: users[1..5] + [users[10], users[14]] },
  { name: "Movie Night Club", description: "Monthly movie nights and snacks", members: users[15..19] + [users[0], users[7]] },
  { name: "Community Garden", description: "Shared expenses for local garden project", members: users[10..14] + [users[17], users[19]] }
]

created_groups = groups.map do |group_data|
  group = Group.create!(
    name: group_data[:name],
    description: group_data[:description],
    leader: group_data[:members].first
  )
  group_data[:members].each do |member|
    GroupMembership.create!(user: member, group: group)
  end
  group
end

puts "Creating expenses..."
created_groups.each do |group|
  case group.name
  when "NYC Roommates"
    12.times do |i|
      Expense.create!(
        description: "Rent - Month #{i+1}",
        amount: 3000,
        category: "Housing",
        date: i.months.ago.to_date,
        user: group.users.sample,
        group: group
      )
      Expense.create!(
        description: "Utilities - Month #{i+1}",
        amount: rand(150..250),
        category: "Utilities",
        date: i.months.ago.to_date,
        user: group.users.sample,
        group: group
      )
      Expense.create!(
        description: "Groceries - Month #{i+1}",
        amount: rand(300..500),
        category: "Food",
        date: i.months.ago.to_date,
        user: group.users.sample,
        group: group
      )
    end
  when "Europe Summer 2024"
    Expense.create!(
      description: "Flight tickets",
      amount: 2500,
      category: "Transportation",
      date: 2.months.ago.to_date,
      user: group.users.sample,
      group: group
    )
    %w[Paris Rome Barcelona Berlin Amsterdam].each do |city|
      Expense.create!(
        description: "Hotel in #{city}",
        amount: rand(600..1000),
        category: "Accommodation",
        date: rand(30..60).days.ago.to_date,
        user: group.users.sample,
        group: group
      )
      Expense.create!(
        description: "#{city} sightseeing",
        amount: rand(100..300),
        category: "Entertainment",
        date: rand(30..60).days.ago.to_date,
        user: group.users.sample,
        group: group
      )
      Expense.create!(
        description: "#{city} dining",
        amount: rand(150..400),
        category: "Food",
        date: rand(30..60).days.ago.to_date,
        user: group.users.sample,
        group: group
      )
    end
  when "Friday Night Poker"
    24.times do |i|
      Expense.create!(
        description: "Poker night snacks and drinks",
        amount: rand(50..100),
        category: "Food",
        date: i.weeks.ago.to_date,
        user: group.users.sample,
        group: group
      )
    end
  when "Ski Trip 2025"
    Expense.create!(
      description: "Cabin rental",
      amount: 2000,
      category: "Accommodation",
      date: 1.month.ago.to_date,
      user: group.users.sample,
      group: group
    )
    Expense.create!(
      description: "Ski passes",
      amount: 1500,
      category: "Entertainment",
      date: 2.weeks.ago.to_date,
      user: group.users.sample,
      group: group
    )
    Expense.create!(
      description: "Group dinner",
      amount: 300,
      category: "Food",
      date: 1.week.ago.to_date,
      user: group.users.sample,
      group: group
    )
    Expense.create!(
      description: "Ski equipment rental",
      amount: 800,
      category: "Other",
      date: 3.days.ago.to_date,
      user: group.users.sample,
      group: group
    )
  else
    10.times do
      Expense.create!(
        description: Faker::Lorem.words(number: 3).join(' ').capitalize,
        amount: rand(20..200),
        category: Expense::CATEGORIES.sample,
        date: rand(1..90).days.ago.to_date,
        user: group.users.sample,
        group: group
      )
    end
  end
end

puts "Creating balances..."
created_groups.each do |group|
  total_expenses = group.expenses.sum(:amount)
  per_person_share = total_expenses / group.users.count

  group.users.each do |user|
    user_expenses = group.expenses.where(user: user).sum(:amount)
    balance = user_expenses - per_person_share

    Balance.find_or_create_by!(user: user, group: group) do |b|
      b.amount = balance.round(2)
    end
  end
end

puts "Creating friendships..."
users.combination(2).to_a.sample(50).each do |user, friend|
  Friendship.create_reciprocal_for_ids(user.id, friend.id)
end

puts "Updating friendship statuses..."
Friendship.all.each do |friendship|
  if friendship.status == 'pending' && rand < 0.8  # 80% chance of accepting
    friendship.update(status: 'accepted')
    Friendship.find_by(user: friendship.friend, friend: friendship.user)&.update(status: 'accepted')
  end
end

puts "Creating payments..."
created_groups.each do |group|
  group.users.to_a.combination(2).to_a.each do |user1, user2|
    if rand < 0.7 # 70% chance of creating a payment between each pair
      payer, recipient = [user1, user2].shuffle
      Payment.create!(
        payer: payer,
        recipient: recipient,
        group: group,
        amount: rand(10.0..100.0).round(2),
        status: %w[completed completed pending_approval pending_approval rejected].sample,
        notes: ["Paying my share", "Thanks for covering!", "Here's what I owe", "Splitting the cost"].sample,
        created_at: rand(1..90).days.ago
      )
    end
  end
end

puts "Creating notifications..."
users.each do |user|
  5.times do
    Notification.create!(
      recipient: user,
      actor: users.sample,
      action: ['new_expense', 'payment_request', 'group_invite', 'expense_update', 'payment_approved'].sample,
      notifiable: [Group, Expense, Payment].sample.all.sample,
      message: Faker::Lorem.sentence,
      created_at: rand(1..30).days.ago
    )
  end
end

puts "Seed data creation completed!"

puts "Created:"
puts "#{User.count} users"
puts "#{Group.count} groups"
puts "#{Expense.count} expenses"
puts "#{Balance.count} balances"
puts "#{Friendship.count} friendships"
puts "#{Payment.count} payments"
puts "#{Notification.count} notifications"