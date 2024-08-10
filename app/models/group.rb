# Step 4: Update the Group model (app/models/group.rb)
class Group < ApplicationRecord
  has_many :expenses
  has_and_belongs_to_many :users

  validates :name, presence: true, uniqueness: true
end