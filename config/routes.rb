Rails.application.routes.draw do
  # Root route
  root 'static_pages#home'

  # Devise routes for user authentication
  devise_for :users

  # User profile route
  resources :users, only: [:show]

  # Dashboard routes
  get 'dashboard', to: 'dashboard#index'
  get 'dashboard/expense_categories', to: 'dashboard#expense_categories'

  # Notification routes
  resources :notifications, only: [:index] do
    member do
      patch :mark_as_read
    end
    collection do
      post :mark_all_as_read
    end
  end

  # Group routes with nested resources
  resources :groups do
    resources :expenses
    resources :group_memberships, only: [:index, :create, :destroy] do
      collection do
        get 'manage'
        post 'add_multiple'
      end
    end
    resources :payments, only: [:index, :new, :create] do
      member do
        post :mark_as_paid
        post :approve
        post :reject
        post :remind
      end
    end
  end

  # New route for expense group selection
  get 'expenses/new', to: 'expenses#new_with_group_selection', as: 'new_expense_with_group_selection'

  # Dashboard action routes
  post '/pay_debt', to: 'dashboard#pay_debt'
  post '/remind_payment', to: 'dashboard#remind_payment'

  # Health check route
  get "up" => "rails/health#show", as: :rails_health_check
end