import mongoose from "mongoose";
const {Schema} = mongoose

const wishlistSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  products: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})
const wishlist = mongoose.model("Wishlist",wishlistSchema)
export default wishlist