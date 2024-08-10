Rails.application.routes.draw do
  # Nested resources: This creates routes for expenses within the context of a group
  resources :groups do
    resources :expenses
  end

  # Devise routes for user authentication
  devise_for :users

  # Health check route
  get "up" => "rails/health#show", as: :rails_health_check

  # Define the root path route ("/")
  # Uncomment and update this to point to your preferred root path
  # root "posts#index"
end
