export interface IMenu {
  _id?: any
  title: string
  outOfStock: Boolean
  image?: string
  description: string
  vendorId: any
  item?: [any]
  isDelete: boolean
  createdAt?: Date
  updatedAt?: Date
}
