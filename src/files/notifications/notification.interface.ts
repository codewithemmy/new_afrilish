export interface INotification {
  _id?: any
  subject: string
  createdBy: string
  general: Boolean
  message: string
  recipient: "Admin" | "Vendor" | "Partner" | "Rider" | "User"
  recipientId: any
  status: "new" | "read"
  createdAt?: Date
  updatedAt?: Date
}
