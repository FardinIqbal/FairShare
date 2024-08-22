class CreateBalances < ActiveRecord::Migration[7.1]
  def change
    create_table :balances do |t|
      t.references :user, null: false, foreign_key: true
      t.references :group, null: false, foreign_key: true
      t.decimal :amount, precision: 10, scale: 2, default: 0

      t.timestamps
    end

    add_index :balances, [:user_id, :group_id], unique: true
  end
end