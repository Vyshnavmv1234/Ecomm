import Address from "../../models/addressSchema.js"
import User from "../../models/userSchema.js"

const loadCheckout = async (req,res)=>{
  try {
    const userId = req.session.user
    const userData = await User.findById(userId)
    const userAddress = await Address.findOne({user_id:userId})
    console.log(userAddress)

    return res.render("user/checkout",{user:userData,address:userAddress})
    
  } catch (error) {
    
  }
}

export default{loadCheckout}