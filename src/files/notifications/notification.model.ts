import mongoose, { Schema, model } from "mongoose"
import { INotification } from "./notification.interface"

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: String,
      enum: ["Admin", "Partner", "User", "Rider", "Vendor"],
    },
    recipientId: {
      type: mongoose.Types.ObjectId,
      refPath: "recipient",
    },
    general: { type: Boolean, default: false },
    createdBy: { type: String },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ["new", "read"],
      default: "new",
    },
  },
  { timestamps: true },
)

const notification = model<INotification>(
  "Notification",
  NotificationSchema,
  "notification",
)

export default notification
