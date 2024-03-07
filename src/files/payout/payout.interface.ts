export interface IPayout {
  _id?: any
  image?: string
  title: string
  userType: "Partner" | "Rider"
  frequency: string
  remark: string
  amount: Number
  recipient: any
  isDelete: boolean
  createdAt?: Date
  updatedAt?: Date
}
