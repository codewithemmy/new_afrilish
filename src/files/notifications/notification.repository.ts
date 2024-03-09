import { INotification } from "./notification.interface"
import Notification from "./notification.model"
import pagination, { IPagination } from "../../constants"

const { LIMIT, SKIP, SORT } = pagination

export default class NotificationRepository {
  static createNotification(
    notificationPayload: Partial<INotification>,
  ): Promise<INotification> {
    return Notification.create(notificationPayload)
  }

  static async findSingleNotificationByParams(
    notificationPayload: Partial<INotification>,
  ): Promise<INotification | null> {
    const notification: Awaited<INotification | null> =
      await Notification.findOne({
        ...notificationPayload,
      })
    return notification
  }

  static async fetchNotificationsByParams(
    notificationPayload: Partial<INotification & IPagination>,
  ): Promise<INotification[] | []> {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = notificationPayload
    const notifications: Awaited<INotification[] | null> =
      await Notification.find({
        ...restOfPayload,
      })
        .populate({ path: "recipientId" })
        .sort(sort)
        .skip(skip)
        .limit(limit)

    return notifications
  }
}
