import Cart from "../../models/cartSchema.js"
import Address from "../../models/addressSchema.js"
import Order from "../../models/orderSchema.js"
import product from "../../models/productSchema.js"
import User from "../../models/userSchema.js"
import STATUS_CODES from "../../utitls/statusCodes.js"

const orderSuccess = async (req,res)=>{
  try {
    const userId = req.session.user
    const orderId = req.params.id
    const userData = await User.findById(userId)
    return res.render("user/orderSuccess",{user:userData,orderId})
    
  } catch (error) {
    console.error("Error loading orderPage",error)
    return res.redirect("/user/pageNotFound")
  }
}

const placeOrder = async (req,res)=>{
  try {

    const userId = req.session.user
    const paymentMethod = req.body.paymentMethod

    const cart = await Cart.findOne({userId}).populate("items.productId")
    const defaultAddress = await Address.findOne({"address.isDefault":true},{"address.$":1})
    console.log(defaultAddress)

    const orderSummary = calculateTotal(cart)

    const order = await Order.create({
      userId,
      orderItems: cart.items.map(item=>({ 
        product: item.productId._id,
        variant: item.variantId,
        quantity: item.quantity,
        price: item.unitPrice
      })),
      order_total: orderSummary.grandTotal,
      shipping_address:{
        name: defaultAddress.address[0].name,
        city: defaultAddress.address[0].city,
        state: defaultAddress.address[0].state,
        pincode: defaultAddress.address[0].pincode,
        house: defaultAddress.address[0].house,
        streetName: defaultAddress.address[0].streetName,
        phone: defaultAddress.address[0].phone
      },
      status: paymentMethod === "COD" ? "pending" : "processing",
    })

    return res.status(STATUS_CODES.OK).json({success:true,orderId:order._id})


  } catch (error) {
     console.error("Error placing order:", error);
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

const orderDetail = async (req,res)=>{
  try {
    
    const cart = await Cart.findOne({userId:req.session.user}).populate("items.productId")
    const userData = await User.findById(req.session.user)
    const orderId = req.params.id
    const orderDetails = await Order.findOne({_id:orderId}).populate("orderItems.product")
    const orderSummary = calculateTotal(cart)
    console.log(orderId)

    return res.render("user/orderDetail",{
      user:userData,
      orderId,
      order: orderDetails,
      orderSummary
    })
    
    
  } catch (error) {
    
  }
}

export default {placeOrder,orderSuccess,orderDetail}