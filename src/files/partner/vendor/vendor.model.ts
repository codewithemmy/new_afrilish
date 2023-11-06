import mongoose, { Schema, model } from "mongoose"
import { IVendor } from "../partner.interface"

const VendorSchema = new Schema<IVendor>(
  {
    name: String,
    email: String,
    address: String,
    vendorType: String,
    phone: String,
    image: String,
    rating: Number,
    isAvailable: { type: Boolean, default: true },
    partnerId: { type: mongoose.Types.ObjectId, ref: "Partner" },
  },
  { timestamps: true },
)

const vendor = model<IVendor>("Vendor", VendorSchema, "vendor")

export default vendor
