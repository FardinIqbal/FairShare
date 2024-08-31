class GroupMembershipsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group

  def index
    @members = @group.users
    @non_members = User.where.not(id: @members.pluck(:id))
  end

  def create
    @user = User.find(params[:user_id])
    @group_membership = @group.group_memberships.build(user: @user)

    if @group_membership.save
      @group.balances.create(user: @user, amount: 0)
      create_new_member_notification(@user)
      respond_to do |format|
        format.html { redirect_to group_path(@group), notice: "#{@user.full_name} was successfully added to the group." }
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.remove(ActionView::RecordIdentifier.dom_id(@user)),
            turbo_stream.append('current_group_members', render_to_string(partial: 'group_memberships/member', locals: { member: @user, group: @group }))
          ]
        end
      end
    else
      redirect_to group_path(@group), alert: "Failed to add #{@user.full_name} to the group."
    end
  end

  def destroy
    @user = User.find(params[:id])

    if @user == current_user
      redirect_to group_path(@group), alert: "You cannot remove yourself from the group."
      return
    end

    if @user == @group.leader
      redirect_to group_path(@group), alert: "The group leader cannot be removed."
      return
    end

    @group_membership = @group.group_memberships.find_by(user_id: @user.id)

    if @group_membership.destroy
      respond_to do |format|
        format.html { redirect_to group_path(@group), notice: "#{@user.full_name} was successfully removed from the group." }
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.remove(ActionView::RecordIdentifier.dom_id(@user)),
            turbo_stream.append('available_group_members', render_to_string(partial: 'group_memberships/non_member', locals: { user: @user, group: @group }))
          ]
        end
      end
    else
      redirect_to group_path(@group), alert: "Failed to remove #{@user.full_name} from the group."
    end
  end

  private

  def set_group
    @group = current_user.groups.find(params[:group_id])
  end

  def create_new_member_notification(new_member)
    @group.users.each do |user|
      Notification.create(
        recipient: user,
        actor: current_user,
        action: 'new_member',
        notifiable: @group,
        message: "#{current_user.full_name} added #{new_member.full_name} to the group '#{@group.name}'"
      )
    end
  end
end