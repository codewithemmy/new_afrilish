export interface IPartner {
  _id?: any
  fullName: string
  phone: string
  email: string
  authType: string
  isSuspend: Boolean
  business?: IBusiness
  vendorId?: any
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
  deviceId?: string
  name: string
  itemId?: [any]
  email: string
  wallet: Number
  ratingAverage: number
  businessNumber: String
  updated: Boolean
  phone: string
  isVerified: Boolean
  payment: [IPaymentInfo]
  price: string
  vendorOperations: IOperations
  location: string
  locationCoord?: ILocation
  address: string
  image: string
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
  accountName: string
  sortCode: string
  accountNumber: number
  bankName: string
  branchName: string
  phone1: string
  addressLine1: string
  addressLine2: string
  postTown: String
  stateId: number
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
