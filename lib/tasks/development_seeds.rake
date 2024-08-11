# lib/tasks/development_seeds.rake

namespace :development do
  desc "Seed data for development environment"
  task seed_data: :environment do
    puts "Seeding development data..."

    # Create users
    users = [
      { email: "alice@example.com", first_name: "Alice", last_name: "Johnson" },
      { email: "bob@example.com", first_name: "Bob", last_name: "Smith" },
      { email: "charlie@example.com", first_name: "Charlie", last_name: "Brown" },
      { email: "david@example.com", first_name: "David", last_name: "Lee" },
      { email: "emma@example.com", first_name: "Emma", last_name: "Garcia" },
      { email: "frank@example.com", first_name: "Frank", last_name: "Wilson" },
      { email: "grace@example.com", first_name: "Grace", last_name: "Taylor" },
      { email: "henry@example.com", first_name: "Henry", last_name: "Anderson" }
    ]

    created_users = users.map do |user_data|
      User.find_or_create_by!(email: user_data[:email]) do |user|
        user.password = "password"
        user.first_name = user_data[:first_name]
        user.last_name = user_data[:last_name]
      end
    end

    # Create groups
    groups = [
      { name: "Roommates", description: "Expenses for our shared apartment", users: created_users[0..2] },
      { name: "Road Trip", description: "Summer road trip expenses", users: created_users[1..4] },
      { name: "Office Lunch", description: "Weekly office lunch expenses", users: created_users },
      { name: "Book Club", description: "Monthly book club expenses", users: created_users.values_at(0,2,4,6) },
      { name: "Poker Night", description: "Bi-weekly poker night expenses", users: created_users.values_at(1,3,5,7) }
    ]

    created_groups = groups.map do |group_data|
      group = Group.find_or_create_by!(name: group_data[:name]) do |g|
        g.description = group_data[:description]
      end
      group.users = group_data[:users]
      group
    end

    # Create expenses for each group
    created_groups.each do |group|
      case group.name
      when "Roommates"
        create_roommate_expenses(group)
      when "Road Trip"
        create_road_trip_expenses(group)
      when "Office Lunch"
        create_office_lunch_expenses(group)
      when "Book Club"
        create_book_club_expenses(group)
      when "Poker Night"
        create_poker_night_expenses(group)
      end
    end

    puts "Seeding completed successfully!"
  end

  def create_roommate_expenses(group)
    expenses = [
      { description: "Groceries", amount: 120.50, category: "Food", user_index: 0 },
      { description: "Utilities", amount: 200.00, category: "Utilities", user_index: 1 },
      { description: "Internet", amount: 80.00, category: "Utilities", user_index: 2 },
      { description: "Cleaning supplies", amount: 45.75, category: "Other", user_index: 0 },
      { description: "Netflix subscription", amount: 15.99, category: "Entertainment", user_index: 1 }
    ]
    create_expenses(group, expenses)
  end

  def create_road_trip_expenses(group)
    expenses = [
      { description: "Gas", amount: 150.00, category: "Transportation", user_index: 0 },
      { description: "Hotel (2 nights)", amount: 300.00, category: "Housing", user_index: 1 },
      { description: "Meals", amount: 210.75, category: "Food", user_index: 2 },
      { description: "Attractions", amount: 125.50, category: "Entertainment", user_index: 3 },
      { description: "Snacks", amount: 35.25, category: "Food", user_index: 0 }
    ]
    create_expenses(group, expenses)
  end

  def create_office_lunch_expenses(group)
    4.times do |i|
      create_expenses(group, [
        { description: "Office Lunch Week #{i+1}", amount: 120.00 + (i * 10), category: "Food", user_index: i }
      ])
    end
  end

  def create_book_club_expenses(group)
    3.times do |i|
      create_expenses(group, [
        { description: "Books for Month #{i+1}", amount: 75.00 + (i * 5), category: "Entertainment", user_index: i }
      ])
    end
  end

  def create_poker_night_expenses(group)
    expenses = [
      { description: "Poker chips set", amount: 50.00, category: "Entertainment", user_index: 0 },
      { description: "Snacks and drinks", amount: 35.75, category: "Food", user_index: 1 },
      { description: "Pizza delivery", amount: 45.00, category: "Food", user_index: 2 }
    ]
    create_expenses(group, expenses)
  end

  def create_expenses(group, expenses)
    expenses.each do |expense_data|
      unless Expense.exists?(description: expense_data[:description], group: group)
        Expense.create!(
          description: expense_data[:description],
          amount: expense_data[:amount],
          date: rand(60).days.ago.to_date,
          category: expense_data[:category],
          user: group.users[expense_data[:user_index]],
          group: group
        )
      end
    end
  end
end