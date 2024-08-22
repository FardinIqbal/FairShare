Rails.application.routes.draw do
  root 'static_pages#home'

  devise_for :users

  get 'dashboard', to: 'dashboard#index'

  resources :groups do
    resources :expenses
    resources :group_memberships, only: [:index, :create, :destroy]
    post 'payments/pay', to: 'payments#pay'
    post 'payments/remind', to: 'payments#remind'
  end

  # Health check route
  get "up" => "rails/health#show", as: :rails_health_check
end