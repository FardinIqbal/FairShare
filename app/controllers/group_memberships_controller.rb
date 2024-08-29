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
    @user = User.find(params[:id])

    if @user == current_user
      redirect_to add_users_group_path(@group), alert: "You cannot remove yourself from the group."
      return
    end

    if @user == @group.leader
      redirect_to add_users_group_path(@group), alert: "The group leader cannot be removed."
      return
    end

    @group_membership = @group.group_memberships.find_by(user_id: @user.id)

    if @group_membership.destroy
      respond_to do |format|
        format.html { redirect_to add_users_group_path(@group), notice: "#{@user.full_name} was successfully removed from the group." }
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.remove(ActionView::RecordIdentifier.dom_id(@user)), # Remove the user from the "Current Group Members" list
            turbo_stream.append('available_group_members', "<div id='#{ActionView::RecordIdentifier.dom_id(@user)}' class='group-members-user-item animate-fade-in-up'>
              <span class='group-members-user-name'>#{@user.full_name}</span>
              <span class='group-members-user-email'>#{@user.email}</span>
              #{view_context.button_to(add_user_group_path(@group, user_id: @user.id), method: :post, remote: true, class: 'group-members-action-button group-members-add-button') do
              'Add'
            end}
            </div>")
          ]
        end
      end
    else
      redirect_to add_users_group_path(@group), alert: "Failed to remove #{@user.full_name} from the group."
    end
  end

  private

  def set_group
    @group = current_user.groups.find(params[:group_id])
  end
end
