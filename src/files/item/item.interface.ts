export interface IItem {
  _id?: any
  menuId: any
  partnerId: any
  name: string
  description: string
  image: string
  outOfStock: Boolean
  price: Number
  dateAvailability: Date
  deliveryOption: string
  priceDescription: string
  vendorId: any
  leastGuestSize: Number
  decorationTime: string
  preparationTime: string
  selectPack: string
  status: string
  tag: string
  leastOrder?: string
  mostOrder?: string
  healthStat?: { calorie: Number; carb: Number; fat: Number; protein: Number }
  bulkEventPrice: { price: Number; guestSize: Number; description: string }
  bulk: { price: Number; guestSize: Number; description: string }
  isDelete: boolean
  createdAt?: Date
  updatedAt?: Date
}
