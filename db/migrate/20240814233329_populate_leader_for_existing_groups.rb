class PopulateLeaderForExistingGroups < ActiveRecord::Migration[7.1]
  def up
    Group.reset_column_information
    Group.find_each do |group|
      # Set the leader_id to the first user in the group or any other logic that fits
      group.update_columns(leader_id: group.users.first.id) if group.users.any?
    end
  end

  def down
    # No rollback needed for this migration
  end
end
