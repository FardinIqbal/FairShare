class AddDescriptionToExpenses < ActiveRecord::Migration[7.1]
  def up
    unless column_exists?(:expenses, :description)
      add_column :expenses, :description, :string
    end
  end

  def down
    remove_column :expenses, :description if column_exists?(:expenses, :description)
  end
end