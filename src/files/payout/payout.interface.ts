export interface IPayout {
  _id?: any
  image?: string
  title: string
  initiator: "Vendor" | "Rider" | "Admin"
  initiatorId: any
  userType: "Vendor" | "Rider"
  status: "pending" | "confirmed"
  refNumber: string
  remark: string
  amount: Number
  recipient: any
  isDelete: boolean
  createdAt?: Date
  updatedAt?: Date
}
