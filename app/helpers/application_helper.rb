# app/helpers/application_helper.rb
module ApplicationHelper
  def flash_class(type)
    case type.to_sym
    when :notice then "bg-blue-100 border-blue-500 text-blue-700"
    when :success then "bg-green-100 border-green-500 text-green-700"
    when :error then "bg-red-100 border-red-500 text-red-700"
    when :alert then "bg-yellow-100 border-yellow-500 text-yellow-700"
    else "bg-gray-100 border-gray-500 text-gray-700"
    end
  end
end