import User from "../../models/userSchema.js"

const loadWallet = async (req,res)=>{
  try {

    const user = await User.findOne({_id:req.session.user})
    return res.render("user/wallet",{user})
    
  } catch (error) {
    console.error("Error loading wallet",error)
  }
}

export default {loadWallet}