require 'rails_helper'

RSpec.describe "GroupMemberships", type: :request do
  describe "GET /index" do
    it "returns http success" do
      get "/group_memberships/index"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /create" do
    it "returns http success" do
      get "/group_memberships/create"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /destroy" do
    it "returns http success" do
      get "/group_memberships/destroy"
      expect(response).to have_http_status(:success)
    end
  end

end
