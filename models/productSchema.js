import mongoose from "mongoose";
import { type } from "os";
const {Schema} = mongoose

const productSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref:"Category",
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: true
  },
  product_image: {
    type: [String],
    required: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["Available","Discontinued","Out of stock"],
    required: true,
    default: "Available"
  }
},{timestamps:true})

const product = mongoose.model("Product",productSchema)

export default product