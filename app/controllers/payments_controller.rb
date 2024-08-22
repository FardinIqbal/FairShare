# app/controllers/payments_controller.rb
class PaymentsController < ApplicationController
  def pay
    user = User.find(params[:user_id])
    amount = params[:amount]

    # In a real system, you'd handle the actual payment here
    # For now, we'll just show a success message

    flash[:notice] = { amount: amount, user: user.full_name }
    redirect_to dashboard_path
  end

  def remind
    user = User.find(params[:user_id])
    amount = params[:amount]

    # In a real system, you'd send an actual reminder (e.g., email)
    # For now, we'll just show a success message

    flash[:notice] = { amount: amount, user: user.full_name, action: 'remind' }
    redirect_to dashboard_path
  end
end