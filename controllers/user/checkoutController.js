import Address from "../../models/addressSchema.js"
import Cart from "../../models/cartSchema.js"
import User from "../../models/userSchema.js"
import STATUS_CODES from "../../utitls/statusCodes.js"

const loadCheckout = async (req,res)=>{
  try {
    const userId = req.session.user
    const userData = await User.findById(userId)
    const userAddress = await Address.findOne({"address.isDefault":true},{"address.$":1})
    const addresses = await Address.findOne({user_id:userId})
    const cart = await Cart.findOne({userId}).populate("items.productId")

    const orderSummary = calculateTotal(cart)

    if(orderSummary.grandTotal>0){
      return res.render("user/checkout",{
      user:userData,
      cartItems: cart?cart.items:[],
      defaultAddress:userAddress,
      allAddress:addresses?.address||[],
      subTotal:orderSummary.subTotal,
      discount:orderSummary.totalDiscount,
      total:orderSummary.grandTotal
    })
    }else{
      return res.redirect("/user/pageNotFound")
    }
    
  } catch (error) {
    console.error("Error in loading checkout",error)
    return res.redirect("/user/pageNotFound")
  }
}
const postCheckout = async (req,res)=>{
  try {
    const userId = req.session.user
    const cart = await Cart.findOne({userId})
    console.log(cart)

    return res.status(STATUS_CODES.OK).json({
      success:true,
    })
    
  } catch (error) {
    console.error("Error in chekout",error)
    return res.redirect("/user/pageNotFound")
  }
}
const calculateTotal = (cart)=>{
  try {

    let subTotal = 0
    let totalDiscount = 0 

    cart.items.forEach(item => {
      subTotal += item.originalPrice * item.quantity
      totalDiscount += (item.originalPrice - item.unitPrice) * item.quantity
    })

    const shipping = 0
    const grandTotal = subTotal -totalDiscount

    return {
      subTotal,
      totalDiscount,
      grandTotal
    }

  } catch (error) {
    console.error("Error in cart calculation",error)
    return res.redirect("/user/pageNotFound")
  }
}

export default{loadCheckout,postCheckout}