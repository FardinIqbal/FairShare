# lib/tasks/reset_development_db.rake

namespace :db do
  desc "Reset development database and seed with sample data"
  task reset_and_seed: :environment do
    if Rails.env.development?
      puts "Resetting development database..."
      Rake::Task['db:drop'].invoke
      Rake::Task['db:create'].invoke
      Rake::Task['db:migrate'].invoke
      Rake::Task['development:seed_data'].invoke
      puts "Development database reset and seeded successfully!"
    else
      puts "This task can only be run in the development environment."
    end
  end
end