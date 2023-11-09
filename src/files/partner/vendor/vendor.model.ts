import mongoose, { Schema, model } from "mongoose"
import { IVendor } from "../partner.interface"

const VendorSchema = new Schema<IVendor>(
  {
    name: String,
    email: String,
    address: String,
    price: String,
    location: String,
    vendorType: String,
    locationCoord: {
      type: { type: String },
      coordinates: [],
    },
    phone: String,
    image: String,
    rating: Number,
    isAvailable: { type: Boolean, default: true },
    partnerId: { type: mongoose.Types.ObjectId, ref: "Partner" },
  },
  { timestamps: true },
)

VendorSchema.index({ locationCoord: "2dsphere" })

const vendor = model<IVendor>("Vendor", VendorSchema, "vendor")

export default vendor
