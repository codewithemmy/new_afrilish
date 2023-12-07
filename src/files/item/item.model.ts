import mongoose, { Schema, model } from "mongoose"
import { IItem } from "./item.interface"

const ItemSchema = new Schema<IItem>(
  {
    name: { type: String },
    description: { type: String },
    price: { type: Number },
    priceDescription: { type: String },
    image: { type: String },
    deliveryOption: { type: String },
    preparationTime: { type: String },
    status: { type: String, default: "pending" },
    selectPack: { type: String },
    outOfStock: { type: Boolean, default: false },
    leastOrder: { type: String },
    mostOrder: { type: String },
    healthStat: { calorie: Number, carb: Number, fat: Number, protein: Number },
    bulkEventPrice: 
      {
        price: { type: Number },
        guestSize: { type: Number },
        description: { type: String },
      },
    tag: { type: String },
    leastGuestSize: { type: Number },
    menuId: {
      type: mongoose.Types.ObjectId,
      ref: "Menu",
    },
    vendorId: {
      type: mongoose.Types.ObjectId,
      ref: "Vendor",
    },
    partnerId: {
      type: mongoose.Types.ObjectId,
      ref: "Partner",
    },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const item = model<IItem>("Item", ItemSchema, "item")

export default item
