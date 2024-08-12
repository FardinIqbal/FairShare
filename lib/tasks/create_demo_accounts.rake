# lib/tasks/create_demo_accounts.rake

namespace :demo do
  desc "Create enhanced demo accounts with pre-populated data and fixed password"
  task create_accounts: :environment do
    puts "WARNING: This task creates demo accounts with a fixed, insecure password."
    puts "This is intended for demonstration purposes only and should not be used in a public production environment."
    puts "Are you sure you want to continue? (y/n)"
    input = STDIN.gets.chomp.downcase
    unless input == 'y' || input == 'yes'
      puts "Task aborted."
      return
    end

    puts "Creating enhanced demo accounts and data..."

    # Create demo users
    demo_users = 20.times.map do |i|
      {
        email: "demo#{i+1}@example.com",
        first_name: Faker::Name.first_name,
        last_name: Faker::Name.last_name
      }
    end

    created_users = demo_users.map do |user_data|
      User.find_or_create_by!(email: user_data[:email]) do |user|
        user.password = "password"  # Set fixed password
        user.password_confirmation = "password"
        user.first_name = user_data[:first_name]
        user.last_name = user_data[:last_name]
        user.demo = true
      end
    end

    # Create demo groups
    group_names = [
      "Weekend Getaway", "Office Party", "Book Club", "Roommates",
      "Family Vacation", "Sports Team", "Birthday Bash", "Study Group"
    ]

    created_groups = group_names.map do |name|
      Group.find_or_create_by!(name: name) do |group|
        group.description = "Demo group for #{name}"
        group.users = created_users.sample(rand(3..8))  # Assign random users to each group
      end
    end

    # Create demo expenses for each group
    created_groups.each do |group|
      10.times do  # Create 10 expenses for each group
        expense = Expense.create!(
          description: Faker::Lorem.words(number: 2..4).join(' ').capitalize,
          amount: Faker::Number.decimal(l_digits: 2, r_digits: 2),
          date: rand(60).days.ago.to_date,
          category: Expense::CATEGORIES.sample,
          user: group.users.sample,
          group: group
        )
      end
    end

    puts "Enhanced demo accounts and data created successfully!"
    puts "Number of demo users created: #{created_users.count}"
    puts "Number of demo groups created: #{created_groups.count}"
    puts "Total number of demo expenses created: #{Expense.where(user: created_users).count}"
    puts "Demo account emails: #{created_users.map(&:email).join(', ')}"
    puts "All demo accounts have been set with the password: 'password'"
    puts "IMPORTANT: This is not secure for a public production environment."
  end

  desc "Clean up old data from demo accounts"
  task cleanup: :environment do
    puts "Cleaning up old data from demo accounts..."
    deleted_expenses = Expense.where(user: User.where(demo: true))
                              .where('created_at < ?', 30.days.ago)
                              .destroy_all
    puts "Deleted #{deleted_expenses.count} old expenses from demo accounts."
  end
end