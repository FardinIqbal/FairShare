class NotificationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_notification, only: [:mark_as_read]

  def index
    @notifications = current_user.notifications.recent.includes(:actor, :notifiable)
    @unread_count = @notifications.unread.count
  end

  def mark_as_read
    @notification.mark_as_read!
    respond_to do |format|
      format.html { redirect_to notifications_path }
      format.json { head :no_content }
    end
  end

  def mark_all_as_read
    current_user.notifications.unread.update_all(read_at: Time.current)
    redirect_to notifications_path, notice: 'All notifications marked as read.'
  end

  private

  def set_notification
    @notification = current_user.notifications.find(params[:id])
  end
end