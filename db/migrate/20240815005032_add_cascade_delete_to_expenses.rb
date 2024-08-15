class AddCascadeDeleteToExpenses < ActiveRecord::Migration[7.1]
  def change
    remove_foreign_key :expenses, :groups
    add_foreign_key :expenses, :groups, on_delete: :cascade
  end
end
