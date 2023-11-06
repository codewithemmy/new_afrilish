import mongoose, { Schema, model } from "mongoose"
import { IPartner } from "./partner.interface"
// import { IRestaurant } from "./partner.interface"

const PartnerSchema = new Schema<IPartner>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    business: { name: String, phone: String, email: String, address: String },
    restaurantId: [{ type: mongoose.Types.ObjectId, ref: "Restaurant" }],
    operations: [
      {
        day: String,
        openingTime: String,
        closingTime: String,
        orderAmount: Number,
        tags: String,
      },
    ],
    payment: { bank: String, account: Number, name: String },
    language: { type: String },
    location: { type: String },
    partnerType: String,
    referralCode: String,
    isDelete: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationOtp: { type: String },
  },
  { timestamps: true },
)

const partner = model<IPartner>("Partner", PartnerSchema, "partner")

export default partner
