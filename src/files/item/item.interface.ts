export interface IItem {
  _id?: any
  menuId: any
  name: string
  description: string
  image: string
  price: Number
  deliveryOption: string
  priceDescription: string
  vendorId: any
  preparationTime: string
  selectPack: string
  status: string
  tag: string
  healthStat?: { calorie: Number, carb: Number, fat: Number, protein: Number}
  leastOrder?: string
  mostOrder?: string
  bulkEventPrice: [{ price: Number; guestSize: Number; description: string }]
  isDelete: boolean
  createdAt?: Date
  updatedAt?: Date
}
