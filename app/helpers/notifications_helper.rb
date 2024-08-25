# app/helpers/notifications_helper.rb

module NotificationsHelper
  def notification_message(notification)
    actor_name = notification.actor.full_name
    case notification.action
    when 'new_member'
      "#{actor_name} joined #{notification.notifiable.name}"
    when 'new_expense'
      expense = notification.notifiable
      "#{actor_name} added a new expense of #{number_to_currency(expense.amount)} in #{expense.group.name}"
    when 'payment_made'
      payment = notification.notifiable
      "#{actor_name} paid you #{number_to_currency(payment.amount)} in the group #{payment.group.name}"
    when 'payment_reminder'
      group = notification.notifiable
      amount = notification.message.match(/\$[\d,.]+/).to_s
      "#{actor_name} reminded you about a payment of #{amount} in the group #{group.name}"
    when 'payment_received'
      payment = notification.notifiable
      "You received a payment of #{number_to_currency(payment.amount)} from #{actor_name}"
    else
      notification.message
    end
  end

  def notification_icon(notification)
    case notification.action
    when 'new_member'
      'user-plus'
    when 'new_expense'
      'file-text'
    when 'payment_made', 'payment_received'
      'credit-card'
    when 'payment_reminder'
      'bell'
    else
      'info'
    end
  end

  def notification_color(notification)
    case notification.action
    when 'new_member'
      'bg-green-100 text-green-800'
    when 'new_expense'
      'bg-yellow-100 text-yellow-800'
    when 'payment_made', 'payment_received'
      'bg-blue-100 text-blue-800'
    when 'payment_reminder'
      'bg-red-100 text-red-800'
    else
      'bg-gray-100 text-gray-800'
    end
  end

  def render_notification_icon(notification)
    icon_class = case notification_icon(notification)
                 when 'user-plus'
                   'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                 when 'file-text'
                   'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                 when 'credit-card'
                   'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                 when 'bell'
                   'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                 else
                   'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                 end

    color_class = notification_color(notification)

    content_tag(:div, class: "flex-shrink-0 #{color_class} rounded-full p-3") do
      content_tag(:svg, class: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg") do
        content_tag(:path, nil, stroke_linecap: "round", stroke_linejoin: "round", stroke_width: "2", d: icon_class)
      end
    end
  end
end