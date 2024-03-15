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
  registration: IRegistration
  document: { image: string; docType: string }
  bank: IBank
  rating?: Number
  verificationToken: string
  deviceId: string
  passwordToken: string
  createdAt?: Date
  updatedAt?: Date
}

interface ILocation {
  type?: string
  coordinates?: [lng: Number, lat: Number]
}

interface IRegistration {
  workPermit: string
  idCard: string
  vehicleSerialNo: string
  accountName: string
  bankAccount: string
  insuranceNo: string
  deliveryInsuranceNo: string
  driverLicenseNo: string
  sortCode: string
  accountType: string
  routingNumber: string
}

interface IBank {
  accountName: string
  bankName: string
  accountNumber: string
  sortCode: string
  accountType: string
  routingNumber: string
}
