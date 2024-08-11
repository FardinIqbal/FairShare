# lib/tasks/development_seeds.rake

namespace :development do
  desc "Seed data for development environment"
  task seed_data: :environment do
    puts "Seeding development data..."

    # Create or find users
    user1 = User.find_or_create_by!(email: "alice@example.com") do |user|
      user.password = "password"
      user.first_name = "Alice"
      user.last_name = "Johnson"
    end

    user2 = User.find_or_create_by!(email: "bob@example.com") do |user|
      user.password = "password"
      user.first_name = "Bob"
      user.last_name = "Smith"
    end

    user3 = User.find_or_create_by!(email: "charlie@example.com") do |user|
      user.password = "password"
      user.first_name = "Charlie"
      user.last_name = "Brown"
    end

    # Create groups
    group1 = Group.find_or_create_by!(name: "Roommates") do |group|
      group.description = "Expenses for our shared apartment"
    end

    group2 = Group.find_or_create_by!(name: "Road Trip") do |group|
      group.description = "Summer road trip expenses"
    end

    # Add users to groups
    group1.users << [user1, user2, user3] - group1.users
    group2.users << [user1, user2] - group2.users

    # Create expenses for Roommates group if they don't exist
    unless Expense.exists?(description: "Groceries", group: group1)
      Expense.create!(
        description: "Groceries",
        amount: 120.50,
        date: Date.today - 5.days,
        category: "Food",
        user: user1,
        group: group1
      )
    end

    unless Expense.exists?(description: "Utilities", group: group1)
      Expense.create!(
        description: "Utilities",
        amount: 200.00,
        date: Date.today - 3.days,
        category: "Utilities",
        user: user2,
        group: group1
      )
    end

    unless Expense.exists?(description: "Internet", group: group1)
      Expense.create!(
        description: "Internet",
        amount: 80.00,
        date: Date.today - 1.day,
        category: "Utilities",
        user: user3,
        group: group1
      )
    end

    # Create expenses for Road Trip group if they don't exist
    unless Expense.exists?(description: "Gas", group: group2)
      Expense.create!(
        description: "Gas",
        amount: 50.00,
        date: Date.today - 10.days,
        category: "Transportation",
        user: user1,
        group: group2
      )
    end

    unless Expense.exists?(description: "Hotel", group: group2)
      Expense.create!(
        description: "Hotel",
        amount: 150.00,
        date: Date.today - 9.days,
        category: "Housing",
        user: user2,
        group: group2
      )
    end

    puts "Seeding completed successfully!"
  end
end