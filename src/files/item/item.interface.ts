export interface IItem {
  _id?: any
  menuId: any
  name: string
  description: string
  image: string
  price: Number
  deliveryOption: string
  preparationTime: string
  selectPack: string
  status: string
  tag: string
  healthStat?: string
  leastOrder?: string
  mostOrder?: string
  bulkEventPrice: [IBulkEventPrice]
  isDelete: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface IBulkEventPrice {
  price: Number
  guestSize: Number
  description: string
}
