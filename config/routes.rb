Rails.application.routes.draw do
  root 'static_pages#home'

  devise_for :users

  get 'dashboard', to: 'dashboard#index'
  get 'dashboard/expense_categories', to: 'dashboard#expense_categories'

  resources :groups do
    member do
      get 'add_users'
      post 'add_user'
    end
    resources :expenses
    resources :group_memberships, only: [:index, :create, :destroy]
  end

  post 'payments/pay', to: 'payments#pay'
  post 'payments/remind', to: 'payments#remind'
  post '/pay_debt', to: 'payments#pay', as: :pay_debt
  post '/remind_payment', to: 'payments#remind', as: :remind_payment

  # Health check route
  get "up" => "rails/health#show", as: :rails_health_check
end