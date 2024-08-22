# config/routes.rb
Rails.application.routes.draw do
  # Root path route ("/") pointing to the home action in StaticPagesController
  root 'static_pages#home'

  # Dashboard route
  get 'dashboard', to: 'dashboard#index'

  # Devise routes for user authentication
  devise_for :users

  # Nested resources: This creates routes for expenses within the context of a group
  resources :groups do
    resources :expenses
    member do
      get 'add_users'
      post 'add_user'
    end
  end

  # Payment routes
  post 'payments/pay/:user_id', to: 'payments#pay', as: 'pay_debt'
  post 'payments/remind/:user_id', to: 'payments#remind', as: 'remind_payment'

  # Health check route
  get "up" => "rails/health#show", as: :rails_health_check
end