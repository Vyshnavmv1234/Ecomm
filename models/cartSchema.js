import mongoose from "mongoose"
const {Schema}= mongoose

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items:[{
    productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  variantId: {
    type: Schema.Types.ObjectId,
    required: false
  }
}]
})
const cart = mongoose.model("Cart",cartSchema)
export default cart