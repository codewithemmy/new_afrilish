export interface IPartner {
  _id?: any
  fullName: string
  phone: string
  email: string
  business?: IBusiness
  vendorId?: [any]
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
  itemId?: [any]
  email: string
  wallet: Number
  businessNumber: String
  updated: Boolean
  phone: string
  payment?: IPaymentInfo
  price: string
  vendorOperations: IOperations
  location: string
  locationCoord?: ILocation
  address: string
  image: string
  averageRating: Number
  partnerId: any
  isAvailable: Boolean
  vendorType?:
    | "restaurantVendor"
    | "bulkFoodVendor"
    | "eventPlannerVendor"
    | "privateVendor"
  rating?: [IRating]
  createdAt?: Date
  updatedAt?: Date
}

export interface IRating {
  rate: Number
  review: string
  ratedBy: any
}

interface IBusiness {
  name: string
  phone: string
  email: string
  address: string
}

interface IPaymentInfo {
  sortCode: string
  account: Number
  name: string
}

interface IOperations {
  operation: [
    {
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
    },
  ]
  orderAmount: Number
  tags: string
  updated: Boolean
}

interface ILocation {
  type?: string
  coordinates?: [Number, Number]
}
export interface IVendorSearch {
  search: string
  isAvailable?: Boolean
}
