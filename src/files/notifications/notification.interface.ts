export interface INotification {
  _id?: any
  subject: string
  createdBy: string
  message: string
  recipient: "Admin" | "Vendor" | "Partner" | "Rider" | "User"
  recipientId: any
  status: "new" | "read"
  createdAt?: Date
  updatedAt?: Date
}
