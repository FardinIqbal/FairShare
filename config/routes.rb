Rails.application.routes.draw do
  get 'static_pages/home'
  # Nested resources: This creates routes for expenses within the context of a group
  resources :groups do
    resources :expenses
  end

  # Devise routes for user authentication
  devise_for :users

  # Health check route
  get "up" => "rails/health#show", as: :rails_health_check

  # Define the root path route ("/")
  root 'static_pages#home'
end
