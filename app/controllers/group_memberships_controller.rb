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
      redirect_to group_path(@group), notice: "#{@user.full_name} was successfully added to the group."
    else
      redirect_to group_path(@group), alert: "Failed to add #{@user.full_name} to the group."
    end
  end

  def destroy
    @group_membership = @group.group_memberships.find_by(user_id: params[:id])
    @user = @group_membership.user

    if @group_membership.destroy
      @group.balances.find_by(user: @user).destroy
      redirect_to group_path(@group), notice: "#{@user.full_name} was successfully removed from the group."
    else
      redirect_to group_path(@group), alert: "Failed to remove #{@user.full_name} from the group."
    end
  end

  private

  def set_group
    @group = current_user.groups.find(params[:group_id])
  end
end