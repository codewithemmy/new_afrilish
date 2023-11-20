import mongoose, { Schema, model } from "mongoose"
import { IRider } from "./rider.interface"
// import { IRestaurant } from "./partner.interface"

const RiderSchema = new Schema<IRider>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String },
    serviceAvailable: { type: Boolean, default: true },
    locationCoord: {
      type: { type: String },
      coordinates: [],
    },
    location: { type: String },
    wallet: { type: Number },
    rating: { type: Number },
    verificationToken: { type: String },
    passwordToken: { type: String },
    resetTokenExpirationDate: { type: Date },
    passwordTokenExpirationDate: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const rider = model<IRider>("Rider", RiderSchema, "rider")

export default rider
