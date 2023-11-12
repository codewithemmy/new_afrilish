export interface IUser {
  _id?: any
  fullName: string
  phone: string
  email: string
  language: string
  home: string
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
