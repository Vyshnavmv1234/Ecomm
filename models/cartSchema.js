import mongoose from "mongoose"
const {Schema}= mongoose

const cartSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items:[{
    product_id: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
}]
})
const cart = mongoose.model("Cart",cartSchema)
export default cart