import Cart from "../../models/cartSchema.js"
import Address from "../../models/addressSchema.js"
import Order from "../../models/orderSchema.js"
import Product from "../../models/productSchema.js"
import Coupon from "../../models/couponSchema.js"
import User from "../../models/userSchema.js"
import STATUS_CODES from "../../utitls/statusCodes.js"
import moment from "moment"
import Wallet from "../../models/walletSchema.js"


const orderSuccess = async (req,res)=>{
  try {
    const user = req.session.user
    const orderId = req.params.id
    const cart = await Cart.findOne({userId:user}).populate("items.productId")
    const userData = await User.findById(user)
    const order = await Order.find({_id:orderId})

    const couponCode = req.session.appliedCoupon
    const coupon = await Coupon.findOne({code:couponCode})

    if(coupon){
      
      if(!coupon.userId.includes(user)){
        coupon.userId.push(user)
        coupon.usedCount+=1
        await coupon.save()
      }
    }
    
      for(const item of order[0].orderItems){
        await Product.updateOne({_id : item.product,"variants._id" : item.variant},{$inc:{"variants.$.stock" : -item.quantity}})
      }
      await cart.deleteOne({userId:user})
      return res.render("user/orderSuccess",{user:userData,orderId})
    
    
  } catch (error) {
    console.error("Error loading orderPage",error)
    return res.redirect("/user/pageNotFound")
  }
}

const placeOrder = async (req,res)=>{
  try {

    const userId = req.session.user
    const { paymentMethod, address, paymentStatus, isDefaultUsed ,gst,status,total} = req.body;
    const couponCode = req.session.appliedCoupon
    const wallet = await Wallet.findOne()
    const validateCoupon = await Coupon.findOne({code:couponCode,userId:req.session.user})
    if(validateCoupon){
      return res.status(STATUS_CODES.BAD_REQUEST).json({success:false})
    }
    if(status== "WALLET"){
      if(wallet.balance <total){
      return res.json({success:false,message:"Insufficient balance"})
    }
    }

    console.log(paymentMethod, paymentStatus, address, isDefaultUsed,gst)

    const cart = await Cart.findOne({userId}).populate("items.productId")
    const orderSummary = calculateTotal(cart)

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address required"
      });
    }
    if(status == "WALLET"){
      wallet.balance -= total

      wallet.transactions.push({
        amount:total,
        type: "Debit",
        description: "Paid using wallet",
      })
      await wallet.save()
    }
    const gstValue = Number(gst);
    const totalValue = Number(total);

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
        GST:gst,
        total,
        coupon: orderSummary.subTotal+gstValue-orderSummary.totalDiscount-totalValue
      },
      shipping_address:{
        name: address.name,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        house: address.house,
        streetName: address.streetName,
        phone: address.phone
      },
      status: paymentMethod === "COD" ? "pending" : "delivered",
      paymentMethod,
      paymentStatus: paymentMethod === "COD"? "Pending": "Paid"
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
    orderDetails.formattedDate = moment(orderDetails.createdAt).format("DD MMM YYYY");

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

const cancelProduct = async (req, res) => {
  try {

    const { itemId, orderId } = req.body;
    const wallet = await Wallet.findOne()
    const order = await Order.findById(orderId);
    const item = order.orderItems.id(itemId);

    wallet.balance += item.unitPrice*item.quantity

    wallet.transactions.push({
      amount: item.unitPrice,
      type: "Credit",
      description: "Order Cancellation",
    })
    await wallet.save()

    if (item.status === "cancelled") {
    return res.status(400).json({ success: false });
  }

    item.status = "cancelled";

    await Product.updateOne(
      { _id: item.product, "variants._id": item.variant },
      { $inc: { "variants.$.stock": item.quantity } }
    );

    let newSubTotal = 0;
    let newDiscount = 0;

    order.orderItems.forEach(i => {
      if (i.status !== "cancelled") {
        const itemSubTotal = i.originalPrice * i.quantity;
        const itemDiscount =
          (i.originalPrice - i.unitPrice) * i.quantity;

        newSubTotal += itemSubTotal;
        newDiscount += itemDiscount;
      }
    });

    const newGST = Math.round((newSubTotal - newDiscount) * 0.05); 
    const newTotal = newSubTotal - newDiscount + newGST;

    order.orderSummary.subTotal = newSubTotal;
    order.orderSummary.discount = newDiscount;
    order.orderSummary.GST = newGST;
    order.orderSummary.total = newTotal;

    await order.save();

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Cancel product error:", error);
    return res.status(500).json({ success: false });
  }
};

const cancelOrder = async(req,res)=>{
  try {
    const orderId = req.body.orderId
    const order = await Order.findOne({_id:orderId})
    const wallet = await Wallet.findOne()
    
    order.orderItems.forEach(item=>{
      item.status ="cancelled"
    })
    
    wallet.balance += order.orderSummary.total
    wallet.transactions.push({
      amount: order.orderSummary.total,
      type: "credit",
      description: "Order Cancellation"
    })
    await wallet.save()

    console.log(order,"hhh",wallet)

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

    const orderDetails = await Order.find({userId:req.session.user}).populate("orderItems.product")
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
const requestItemReturn = async (req,res)=>{
  try {
    
    const wallet = await Wallet.findOne()
    const {orderItemId,reason,orderId} = req.body

    console.log(orderItemId,reason,orderId)

    const order = await Order.findById(orderId)
    const item = order.orderItems.id(orderItemId)

    wallet.balance += order.orderSummary.total
    wallet.transactions.push({
      amount: order.orderSummary.total,
      type: "credit",
      description: "Order Cancellation"
    })
    await wallet.save()

    item.returnRequested = true
    item.returnReason = reason
    item.returnStatus = "requested"

    

    await order.save()
    res.redirect(`/user/orderDetail/${orderId}`)

    console.log(item)

  } catch (error) {
    console.error("Return request error", error)
    res.redirect("/user/pageNotFound")
  }
}

export default {placeOrder,orderSuccess,orderDetail,cancelProduct,cancelOrder,orderHistory,requestReturn,requestItemReturn}