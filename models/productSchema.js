import mongoose from "mongoose";
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
  title: {
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
  discount: {
    type: Number,
    required: false
  },
  quantity: {
    type: Number,
    default: true,
    required:false
  },

  images: [{
    url: String,
    public_id: String
  }],

  isBlocked: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["Available","Discontinued","Out of stock"],
    required: false,
    default: "Available"
  }
},{timestamps:true})

const product = mongoose.model("Product",productSchema)

export default product