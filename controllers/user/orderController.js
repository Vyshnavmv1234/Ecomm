import Cart from "../../models/cartSchema.js"
import Address from "../../models/addressSchema.js"
import Order from "../../models/orderSchema.js"
import Product from "../../models/productSchema.js"
import User from "../../models/userSchema.js"
import STATUS_CODES from "../../utitls/statusCodes.js"

const orderSuccess = async (req,res)=>{
  try {
    const userId = req.session.user
    const orderId = req.params.id
    const cart = await Cart.findOne({userId}).populate("items.productId")
    const userData = await User.findById(userId)
    const order = await Order.find({_id:orderId})
    
      for(const item of order[0].orderItems){
        await Product.updateOne({_id : item.product,"variants._id" : item.variant},{$inc:{"variants.$.stock" : -item.quantity}})
      }
      await cart.deleteOne({userId})
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

    const orderSummary = calculateTotal(cart)
    
    const order = await Order.create({
      userId,
      orderItems: cart.items.map(item=>({ 
        product: item.productId._id,
        variant: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        originalPrice: item.originalPrice
      })),
      orderSummary:{
        subTotal:orderSummary.subTotal,
        discount:orderSummary.totalDiscount,
        total:orderSummary.grandTotal
      },
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
    
    const userData = await User.findById(req.session.user)
    const orderId = req.params.id
    const orderDetails = await Order.findOne({_id:orderId}).populate("orderItems.product")

    return res.render("user/orderDetail",{
      user:userData,
      orderId,
      order: orderDetails,
    }) 
    
    
  } catch (error) {
    console.error("Error loading orderDetails",error)
    return res.redirect("/user/pageNotFound")
  }
}

const cancelProduct = async(req,res)=>{
  try {

    const {itemId,orderId}= req.body
    const order = await Order.findOne({_id:orderId})
    const item = order.orderItems.id(itemId)
    
    if(!item){
      return res.status(STATUS_CODES.NOT_FOUND).json({success:false})
    }
    item.status = "cancelled"

    const itemSubTotal = item.originalPrice * item.quantity
    const itemDiscount = (item.originalPrice - item.unitPrice) * item.quantity
    const total = itemSubTotal - itemDiscount

    order.orderSummary.subTotal -= itemSubTotal 
    order.orderSummary.discount -= itemDiscount
    order.orderSummary.total -= total
    
    await Product.updateOne({_id: item.product,"variants._id": item.variant},{$inc:{"variants.$.stock":item.quantity}})
    await order.save()
    return res.status(STATUS_CODES.OK).json({success:true})

  } catch (error) {
    console.error("error cancelling product order",error)
  }
}

const cancelOrder = async(req,res)=>{
  try {
    const orderId = req.body.orderId
    const order = await Order.findOne({_id:orderId})
    
    order.orderItems.forEach(item=>{
      item.status ="cancelled"
    })
    await order.save()
    return res.status(STATUS_CODES.OK).json({success:true})
    
  } catch (error) {
    console.error("error cancelling order",error)
  }
} 
const orderHistory = async (req,res)=>{
  try {

    const userData = await User.findById(req.session.user)
    const limit = 3              
    const page = parseInt(req.query.page) || 1
    const skip = (page - 1) * limit

    const totalOrders = await Order.countDocuments()

    const orderDetails = await Order.find().populate("orderItems.product")
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit)

    const totalPages = Math.ceil(totalOrders / limit)

    return res.render("user/orderHistory",{
      user:userData,
      orders:orderDetails,
      currentPage: page,
      totalPages
    })
    
  } catch (error) {
    console.error("orderHistory error",error)
  }
}

const requestReturn = async (req, res) => {
  try {
    const { orderId, reason } = req.body

    const order = await Order.findById(orderId)

    order.returnRequested = true
    order.returnReason = reason
    order.returnStatus = "requested"

    await order.save()
    res.redirect(`/user/orderDetail/${orderId}`)

  } catch (error) {
    console.error("Return request error", error)
    res.redirect("/user/pageNotFound")
  }
}

export default {placeOrder,orderSuccess,orderDetail,cancelProduct,cancelOrder,orderHistory,requestReturn}