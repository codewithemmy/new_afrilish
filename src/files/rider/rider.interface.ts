export interface IRider {
  _id?: any
  fullName: string
  email: string
  password: string
  phone: string
  location: string
  isVerified: Boolean
  locationCoord?: ILocation
  image: string
  wallet: Number
  isDelete: Boolean
  serviceAvailable: Boolean
  rating?: Number
  verificationToken: string
  passwordToken: string
  createdAt?: Date
  updatedAt?: Date
}

interface ILocation {
  type?: string
  coordinates?: [lat: Number, lng: Number]
}
