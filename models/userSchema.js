import mongoose from "mongoose";
const {Schema} = mongoose

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  googleId: {
    type: String,
    unique: false
  },
  password: {
    type: String,
    required: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  cart: [{
    type: Schema.Types.ObjectId,
    ref: "Cart"
  }],
  wishlist: [{
    type: Schema.Types.ObjectId,
    ref:"Wishlist"
  }],
  orderHistory: [{
    type: Schema.Types.ObjectId,
    ref:"Order"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  searchHistory: [{
    category: {
      type: Schema.Types.ObjectId,
      ref:"Category"
    },
    searchOn: { 
      type: Date,
      default: Date.now
    }
  }]
},{ timestamps: true })

const user = mongoose.model("user",userSchema)
export default user