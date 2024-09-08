class GroupMembershipsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group

  def manage
    @members = @group.users
    @non_members = User.where.not(id: @members.pluck(:id))
  end

  def create
    @user = User.find(params[:user_id])

    if @group.users.include?(@user)
      respond_to do |format|
        format.html { redirect_to manage_group_group_memberships_path(@group), alert: "#{@user.full_name} is already a member of this group." }
        format.turbo_stream { render turbo_stream: turbo_stream.replace("user_#{@user.id}", partial: 'member', locals: { member: @user, group: @group }) }
      end
      return
    end

    @group_membership = @group.group_memberships.build(user: @user)

    if @group_membership.save
      @group.balances.find_or_create_by(user: @user) do |balance|
        balance.amount = 0
      end

      create_new_member_notification(@user)
      respond_to do |format|
        format.html { redirect_to manage_group_group_memberships_path(@group), notice: "#{@user.full_name} was successfully added to the group." }
        format.turbo_stream { render turbo_stream: turbo_stream.replace("user_#{@user.id}", partial: 'member', locals: { member: @user, group: @group }) }
      end
    else
      respond_to do |format|
        format.html { redirect_to manage_group_group_memberships_path(@group), alert: "Failed to add #{@user.full_name} to the group." }
        format.turbo_stream { render turbo_stream: turbo_stream.replace("user_#{@user.id}", partial: 'non_member', locals: { user: @user, group: @group }) }
      end
    end
  end

  def destroy
    @user = User.find(params[:id])
    @group_membership = @group.group_memberships.find_by(user_id: @user.id)

    if @group_membership.destroy
      respond_to do |format|
        format.html { redirect_to manage_group_group_memberships_path(@group), notice: "#{@user.full_name} was successfully removed from the group." }
        format.turbo_stream { render turbo_stream: turbo_stream.replace("user_#{@user.id}", partial: 'non_member', locals: { user: @user, group: @group }) }
      end
    else
      respond_to do |format|
        format.html { redirect_to manage_group_group_memberships_path(@group), alert: "Failed to remove #{@user.full_name} from the group." }
        format.turbo_stream { render turbo_stream: turbo_stream.replace("user_#{@user.id}", partial: 'member', locals: { member: @user, group: @group }) }
      end
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