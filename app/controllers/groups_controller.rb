class GroupsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group, only: [:show, :edit, :update, :destroy, :add_users, :add_user, :add_multiple_users]

  def index
    @groups = current_user.groups
  end

  def show
    @expenses = @group.expenses.order(date: :desc)
    @total_expenses = @group.total_expenses
    @per_person_share = @total_expenses.to_f / @group.users.count
    @group.update_balances

    @user_summaries = @group.users.map do |user|
      user_expenses = @group.expenses.where(user: user)
      {
        user: user,
        total_paid: user_expenses.sum(:amount),
        expense_count: user_expenses.count,
        largest_expense: user_expenses.maximum(:amount) || 0,
        net_balance: user.balance_in_group(@group)
      }
    end

    @current_user_summary = @user_summaries.find { |summary| summary[:user] == current_user }
    @optimized_settlements = @group.calculate_debts
    @current_user_owes = @optimized_settlements.select { |settlement| settlement[:from] == current_user }
    @current_user_owed = @optimized_settlements.select { |settlement| settlement[:to] == current_user }
    @most_expensive_category = @group.expenses
                                     .select('category, SUM(amount) as total_amount')
                                     .group(:category)
                                     .order('total_amount DESC')
                                     .first
                                 &.category
  end

  def new
    @group = Group.new
  end

  def create
    @group = Group.new(group_params)
    @group.leader = current_user
    @group.users << current_user

    respond_to do |format|
      if @group.save
        format.html { redirect_to add_users_group_path(@group), notice: 'Group was successfully created.' }
        format.json { render json: { success: true, redirect_url: add_users_group_path(@group) }, status: :created }
      else
        format.html { render :new }
        format.json { render json: { success: false, errors: @group.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def edit
  end

  def update
    if @group.update(group_params)
      redirect_to @group, notice: 'Group was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @group.destroy
    redirect_to groups_url, notice: 'Group was successfully deleted.'
  end

  def add_users
    @users = User.where.not(id: @group.users.pluck(:id))
  end

  def add_user
    user = User.find(params[:user_id])
    if @group.users << user
      respond_to do |format|
        format.html { redirect_to add_users_group_path(@group), notice: 'User was successfully added to the group.' }
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.remove(ActionView::RecordIdentifier.dom_id(user)), # Remove the user from the "Add New Members" list
            turbo_stream.append('current_group_members', "<div id='#{ActionView::RecordIdentifier.dom_id(user)}' class='group-members-existing-item animate-fade-in-up'>
            <span class='group-members-user-name'>#{user.full_name}</span>
            <span class='group-members-user-email'>#{user.email}</span>
            #{view_context.button_to(group_group_membership_path(@group, user), method: :delete, remote: true, class: 'group-members-action-button group-members-remove-button', data: { confirm: 'Are you sure you want to remove this member?' }) do
              'Remove'
            end}
          </div>")
          ]
        end
      end
    else
      redirect_to add_users_group_path(@group), alert: 'Failed to add user to the group.'
    end
  end



  def add_multiple_users
    user_ids = params[:user_ids]
    users = User.where(id: user_ids)

    ActiveRecord::Base.transaction do
      users.each do |user|
        unless @group.users.include?(user)
          @group.users << user
          create_new_member_notification(user)
        end
      end
    end

    redirect_to @group, notice: 'Users were successfully added to the group.'
  rescue ActiveRecord::RecordInvalid
    redirect_to add_users_group_path(@group), alert: 'Failed to add some users to the group.'
  end

  private

  def set_group
    @group = current_user.groups.find(params[:group_id] || params[:id])
  end

  def group_params
    params.require(:group).permit(:name, :description)
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
