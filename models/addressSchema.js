import mongoose from "mongoose"
const {Schema}= mongoose

const addressSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
    username: {
      type: String,
      required: true
    },
    street_name: {
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
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
},{timestamps: true})
const address = mongoose.model("Address",addressSchema)
export default address