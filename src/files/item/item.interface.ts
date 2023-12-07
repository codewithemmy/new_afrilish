export interface IItem {
  _id?: any
  menuId: any
  partnerId: any
  name: string
  description: string
  image: string
  outOfStock: Boolean
  price: Number
  deliveryOption: string
  priceDescription: string
  vendorId: any
  leastGuestSize: Number
  preparationTime: string
  selectPack: string
  status: string
  tag: string
  healthStat?: { calorie: Number; carb: Number; fat: Number; protein: Number }
  leastOrder?: string
  mostOrder?: string
  bulkEventPrice: { price: Number; guestSize: Number; description: string }
  isDelete: boolean
  createdAt?: Date
  updatedAt?: Date
}
