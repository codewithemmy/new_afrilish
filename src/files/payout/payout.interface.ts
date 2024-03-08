export interface IPayout {
  _id?: any
  image?: string
  title: string
  userType: "Vendor" | "Rider"
  frequency: string
  status: "pending" | "confirmed"
  remark: string
  amount: Number
  recipient: any
  isDelete: boolean
  createdAt?: Date
  updatedAt?: Date
}
