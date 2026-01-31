import mongoose from "mongoose"
const {Schema}= mongoose

const addressSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  address:[{
    name: {
      type: String,
      required: true
    },
    streetName: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: Number,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  }]
    
},{timestamps: true})
const address = mongoose.model("Address",addressSchema)
export default address