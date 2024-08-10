class GroupsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group, only: [:show, :edit, :update, :destroy]
  before_action :authorize_user, only: [:show, :edit, :update, :destroy]
  def index
    @groups = current_user.groups
  end

  def show
    @expenses = @group.expenses.order(date: :desc)
    @splits = @group.calculate_splits
  end

  def new
    @group = Group.new
  end

  def create
    @group = Group.new(group_params)
    @group.users << current_user

    if @group.save
      flash[:notice] = 'Group was successfully created.'
      redirect_to @group
    else
      flash.now[:alert] = 'There was an error creating the group.'
      render :new
    end
  end


  def edit
  end


  def update
    if @group.update(group_params)
      flash[:notice] = 'Group was successfully updated.'
      redirect_to @group
    else
      flash.now[:alert] = 'There was an error updating the group.'
      render :edit
    end
  end

  def destroy
    @group.destroy
    flash[:notice] = 'Group was successfully deleted.'
    redirect_to groups_url
  end

  private

  def set_group
    @group = current_user.groups.find(params[:id])
  end

  def group_params
    params.require(:group).permit(:name, :description)
  end

  def authorize_user
    unless @group.users.include?(current_user)
      flash[:alert] = "You don't have permission to access this group."
      redirect_to groups_path
    end
  end
end
