export interface IPartner {
  _id?: any
  fullName: string
  phone: string
  email: string
  language: string
  business?: IBusiness
  payment?: IPaymentInfo
  restaurantId?: [any]
  operations?: [IOperations]
  location?: string
  password: string
  referralCode?: string
  partnerType: "restaurantVendor" | "bulkFoodVendor" | "eventPlanner"
  createdAt?: Date
  updatedAt?: Date
  isDelete: Boolean
  isVerified: Boolean
  verificationOtp: string
}

export interface IVendor {
  _id?: any
  name: string
  email: string
  phone: string
  price: string
  locationCoord: ILocation
  address: string
  image: string
  partnerId: any
  isAvailable: Boolean
  vendorType?: "restaurant" | "bulk" | "eventPlanner"
  rating?: Number
  createdAt?: Date
  updatedAt?: Date
}

interface IBusiness {
  name: string
  phone: string
  email: string
  address: string
}

interface IPaymentInfo {
  bank: string
  account: Number
  name: string
}

interface IOperations {
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
  openingTime: string
  closingTime: string
  orderAmount: Number
  tags: string
}

interface ILocation {
  type: string
  coordinates: []
}
export interface IVendorSearch {
  search: string
  isAvailable?: Boolean
}
