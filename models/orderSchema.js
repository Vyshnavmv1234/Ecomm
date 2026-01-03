import mongoose from "mongoose";
const {Schema} = mongoose
import { v4 as uuidv4 } from "uuid";

const orderSchema = new Schema({
  order_id: {
    type: String,
    default: ()=>uuidv4(),
    unique: true
  },
  orderItems: [{
    
    product: {
      type: Schema.Types.ObjectId,
      ref:"Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      default: 0,
      required: true
    }
  }],
  order_total: {
    type: Number,
    required: true
  },
  shipping_address: {
    type: Schema.Types.ObjectId,
    ref: "Address",
    required: true
  },
  invoice_date: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ["pending","processing","shipped","delivered","cancelled","return request","returned"]
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  couponApplied: {
    type: Boolean,
    default: false
  }
})

const order = mongoose.model("Order",orderSchema)
export default order