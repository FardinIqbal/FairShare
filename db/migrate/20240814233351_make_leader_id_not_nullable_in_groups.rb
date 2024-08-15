class MakeLeaderIdNotNullableInGroups < ActiveRecord::Migration[7.1]
  def change
    change_column_null :groups, :leader_id, false
  end
end
