class AddLeaderToGroups < ActiveRecord::Migration[7.1]
  def change
    add_column :groups, :leader_id, :bigint # remove null: false for now
    add_foreign_key :groups, :users, column: :leader_id
  end
end
