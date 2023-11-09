import mongoose, { Schema, model } from "mongoose"
import { IItem } from "./item.interface"

const ItemSchema = new Schema<IItem>(
  {
    name: { type: String },
    description: { type: String },
    price: { type: Number },
    image: { type: String },
    deliveryOption: { type: String },
    preparationTime: { type: String },
    status: { type: String, default: "pending" },
    selectPack: { type: String },
    leastOrder: { type: String },
    mostOrder: { type: String },
    healthStat: { type: String },
    bulkEventPrice: [{
      price: { type: Number },
      guestSize: { type: Number },
      description: { type: String },
    }],
    tag: { type: String },
    menuId: {
      type: mongoose.Types.ObjectId,
      ref: "Menu",
    },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const item = model<IItem>("Item", ItemSchema, "item")

export default item
