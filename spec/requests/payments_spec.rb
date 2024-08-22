require 'rails_helper'

RSpec.describe "Payments", type: :request do
  describe "GET /pay" do
    it "returns http success" do
      get "/payments/pay"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /remind" do
    it "returns http success" do
      get "/payments/remind"
      expect(response).to have_http_status(:success)
    end
  end

end
