export interface IUser {
  _id?: any
  fullName: string
  password: string
  phone: string
  email: string
  image: string
  authType?: string
  wallet: Number
  loginCode: Number
  home: string
  address: string
  office: string
  locationCoord: ILocation
  referralCode?: string
  orders: [string]
  createdAt?: Date
  updatedAt?: Date
  isDelete: Boolean
  isVerified: Boolean
  verificationOtp: string
  dateOfBirth: Date
}

interface ILocation {
  type: string
  coordinates: [lat: Number, lng: Number]
}

export interface ICoord {
  lat: Number
  lng: Number
}
