import mongoose, { Schema, model } from "mongoose"
import { IPartner } from "./partner.interface"

const PartnerSchema = new Schema<IPartner>(
  {
    fullName: { type: String },
    phone: { type: String },
    email: { type: String, required: true },
    authType: { type: String },
    password: { type: String },
    business: { name: String, phone: String, email: String, address: String },
    vendorId: { type: mongoose.Types.ObjectId, ref: "Vendor" },
    location: { type: String },
    partnerType: { type: String },
    referralCode: { type: String },
    isDelete: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationOtp: { type: String },
    isSuspend: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const partner = model<IPartner>("Partner", PartnerSchema, "partner")

export default partner
