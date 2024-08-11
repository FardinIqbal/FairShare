namespace :sample_data do
  desc "Generate sample users for development"
  task generate_users: :environment do
    num_users = ENV['NUM_USERS'] ? ENV['NUM_USERS'].to_i : 10

    num_users.times do |i|
      user = User.create!(
        email: "user#{i+1}@example.com",
        password: 'password123',
        password_confirmation: 'password123',
        first_name: Faker::Name.first_name,
        last_name: Faker::Name.last_name
      )
      puts "Created user: #{user.email}"
    end

    puts "Created #{num_users} sample users"
  end
end