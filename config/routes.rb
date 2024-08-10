Rails.application.routes.draw do
  # This line automatically creates the RESTful routes for GroupsController:
  resources :groups

  # Devise routes for user authentication
  devise_for :users

  # Health check route
  get "up" => "rails/health#show", as: :rails_health_check

  # Define the root path route ("/")
  # Uncomment and update this to point to your preferred root path
  # root "posts#index"
end
