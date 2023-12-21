export interface IItem {
  _id?: any
  menuId: any
  partnerId: any
  name: string
  description: string
  bulkDescription: string
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
  calorie: Number
  carb: Number
  fat: Number
  protein: Number
  guestSize: Number

  bulk: { price: Number; guestSize: Number; description: string }
  isDelete: boolean
  createdAt?: Date
  updatedAt?: Date
}
