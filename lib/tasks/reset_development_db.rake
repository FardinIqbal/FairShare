# lib/tasks/reset_development_db.rake

namespace :db do
  desc "Reset development database and seed with sample data"
  task reset_and_seed: :environment do
    if Rails.env.development?
      puts "Resetting development database..."

      # Close all connections to the database
      ActiveRecord::Base.connection.execute("SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '#{ActiveRecord::Base.connection.current_database}'
        AND pid <> pg_backend_pid();")

      Rake::Task['db:drop'].invoke
      Rake::Task['db:create'].invoke
      Rake::Task['db:migrate'].invoke

      puts "Clearing all data..."
      # Add any additional models that need clearing here
      [User, Group, Expense].each(&:delete_all)

      puts "Resetting primary key sequences..."
      ActiveRecord::Base.connection.tables.each do |table|
        ActiveRecord::Base.connection.reset_pk_sequence!(table)
      end

      puts "Seeding fresh data..."
      Rake::Task['development:seed_data'].invoke

      puts "Development database reset and seeded successfully!"
    else
      puts "This task can only be run in the development environment."
    end
  end
end