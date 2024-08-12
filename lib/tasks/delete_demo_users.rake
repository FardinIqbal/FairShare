# lib/tasks/delete_demo_users.rake

namespace :demo do
  desc "Delete all demo users and their associated data"
  task delete_users: :environment do
    puts "WARNING: This will delete all demo users and their associated data."
    puts "This action cannot be undone. Are you sure you want to continue? (y/n)"
    input = STDIN.gets.chomp.downcase

    if input == 'y' || input == 'yes'
      ActiveRecord::Base.transaction do
        demo_users = User.where(demo: true)

        # Delete expenses associated with demo users
        expenses_deleted = Expense.where(user: demo_users).delete_all
        puts "Deleted #{expenses_deleted} expenses associated with demo users."

        # Remove demo users from groups
        Group.all.each do |group|
          group.users.delete(demo_users)
        end

        # Delete empty groups (groups with no users)
        empty_groups_deleted = Group.left_outer_joins(:users).where(users: { id: nil }).delete_all
        puts "Deleted #{empty_groups_deleted} empty groups."

        # Finally, delete the demo users
        users_deleted = demo_users.delete_all
        puts "Deleted #{users_deleted} demo users."

        puts "All demo users and their associated data have been successfully deleted."
      end
    else
      puts "Task aborted. No users were deleted."
    end
  end
end