import mongoose from "mongoose";
const {Schema} = mongoose

const wishlistSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    productId:{
    type: Schema.Types.ObjectId,
    ref: "Product",
    },
    variantId:{
      type: Schema.Types.ObjectId,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})
const wishlist = mongoose.model("Wishlist",wishlistSchema)
export default wishlist