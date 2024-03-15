import mongoose from "mongoose"
import { IResponse } from "../../constants"
import { IToken, queryConstructor } from "../../utils"
import { INotification } from "./notification.interface"
import { notificationMessages } from "./notification.messages"
import NotificationRepository from "./notification.repository"
import VendorRepository from "../partner/vendor/vendor.repository"
import UserRepository from "../user/user.repository"
import RiderRepository from "../rider/rider.repository"
import { Expo } from "expo-server-sdk"
const expo = new Expo()

export default class NotificationService {
  static async create(payload: Partial<INotification>, params: any) {
    let extra = {}
    if (params && params?.userType === "admin") {
      extra = { general: true }
    }

    const notification = await NotificationRepository.createNotification({
      ...extra,
      ...payload,
    })

    if (!notification)
      return { success: false, msg: `Unable to create notification` }

    if (payload.recipient == "Vendor") {
      const vendors = await VendorRepository.fetchVendorByParams({})
      vendors.map(async (vendorItem) => {
        let message: any = {
          to: `${vendorItem?.deviceId}`,
          sound: "default",
          title: `${payload.subject}`,
          body: `${payload.message}`,
        }
        await expo.sendPushNotificationsAsync([message])
      })
    }

    if (payload.recipient === "User") {
      const users = await UserRepository.fetchUserByParams({})
      users.map(async (userItem) => {
        let message: any = {
          to: `${userItem?.deviceId}`,
          sound: "default",
          title: `${payload.subject}`,
          body: `${payload.message}`,
        }
        await expo.sendPushNotificationsAsync([message])
      })
    }

    if (payload.recipient === "Rider") {
      const riders = await RiderRepository.fetchRiderByParams({})
      riders.map(async (riderItem) => {
        let message: any = {
          to: `${riderItem?.deviceId}`,
          sound: "default",
          title: `${payload.subject}`,
          body: `${payload.message}`,
        }
        await expo.sendPushNotificationsAsync([message])
      })
    }
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
