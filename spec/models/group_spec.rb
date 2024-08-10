require 'rails_helper'

RSpec.describe Group, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_uniqueness_of(:name) }
  end

  describe 'associations' do
    it { should have_many(:expenses) }
    it { should have_and_belong_to_many(:users) }
  end
end