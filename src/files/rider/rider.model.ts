import mongoose, { Schema, model } from "mongoose"
import { IRider } from "./rider.interface"

const RiderSchema = new Schema<IRider>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String },
    serviceAvailable: { type: Boolean, default: false },
    locationCoord: {
      type: { type: String },
      coordinates: [],
    },
    location: { type: String },
    deviceId: { type: String },
    isDelete: { type: Boolean },
    wallet: { type: Number, default: 0 },
    registration: {
      workPermit: { type: String },
      idCard: { type: String },
      vehicleSerialNo: { type: String },
      accountName: { type: String },
      bankAccount: { type: String },
      insuranceNo: { type: String },
      deliveryInsuranceNo: { type: String },
      driverLicenseNo: { type: String },
      sortCode: { type: String },
      accountType: { type: String },
      routingNumber: { type: String },
    },
    bank: {
      accountName: { type: String },
      bankName: { type: String },
      accountNumber: { type: String },
      sortCode: { type: String },
      accountType: { type: String },
      routingNumber: { type: String },
    },
    document: { image: { type: String }, docType: { type: String } },
    rating: { type: Number },
    verificationToken: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const rider = model<IRider>("Rider", RiderSchema, "rider")

export default rider
