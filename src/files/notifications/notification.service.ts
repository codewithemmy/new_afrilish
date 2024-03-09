import mongoose from "mongoose"
import { IResponse } from "../../constants"
import { IToken, queryConstructor } from "../../utils"
import { INotification } from "./notification.interface"
import { notificationMessages } from "./notification.messages"
import NotificationRepository from "./notification.repository"

export default class NotificationService {
  static async create(payload: Partial<INotification>) {
    const notification = await NotificationRepository.createNotification({
      ...payload,
    })

    if (!notification)
      return { success: false, msg: `Unable to create notification` }

    return { success: true, msg: `Notification created successfully` }
  }

  static async fetchUserNotifications(
    query: Partial<INotification>,
  ): Promise<IResponse> {
    const { error, params, limit, skip, sort } = queryConstructor(
      query,
      "createdAt",
      "Notification",
    )

    if (error) return { success: false, msg: error }

    const notifications =
      await NotificationRepository.fetchNotificationsByParams({
        ...params,
        limit,
        skip,
        sort,
      })

    if (notifications.length < 1)
      return {
        success: true,
        msg: notificationMessages.NOTIFICATION_NOT_FOUND,
        data: [],
      }

    return {
      success: true,
      msg: notificationMessages.NOTIFICATION_FETCHED,
      data: notifications,
    }
  }
}
