import StatusCodes from '../../utitls/statusCodes.js';
import ErrorMessages from '../../utitls/errorMessages.js';
import Cart from "../../models/cartSchema.js"
import User from "../../models/userSchema.js"
import Product from "../../models/productSchema.js"
import Wishlist from "../../models/wishlistSchema.js"
import STATUS_CODES from "../../utitls/statusCodes.js"
import Address from "../../models/addressSchema.js"

const loadAddToCart = async(req,res)=>{
  try {

    const userId = req.session.user

    const userData = await User.findById(userId)

    const cart = await Cart.findOne({userId})
    .populate("items.productId")

    

    const userAddress = await Address.findOne({"address.isDefault":true},{"address.$":1})

      if (!cart || cart.items.length === 0) {
      return res.render("user/cart", {
        user: userData,
        subTotal: 0,
        discount: 0,
        total: 0, 
        cartItems: [],
        defaultAddress: userAddress,
        emptyMessage: ErrorMessages.YOUR_CART_IS_EMPTY
      })
    }  
    const cartTotal = calculateCartTotal(cart)
    return res.render("user/cart",{
      user: userData,
      subTotal: cartTotal.subTotal,
      discount: cartTotal.totalDiscount,
      total: cartTotal.grandTotal,
      cartItems: cart?cart.items:[],
      defaultAddress: userAddress,
    })
    
  } catch (error) {
    console.error("Error in loading cart",error) 
    return res.redirect("/user/pageNotFound")
  }
}
const calculateCartTotal = (cart)=>{
  try {

    let subTotal = 0
    let totalDiscount = 0 

    cart.items.forEach(item => {
      subTotal += item.originalPrice * item.quantity
      totalDiscount += (item.originalPrice - item.unitPrice) * item.quantity
    })

    const shipping = 0
    const grandTotal = subTotal - totalDiscount

    return {
      subTotal,
      totalDiscount,
      grandTotal
    }

  } catch (error) {
    console.error("Error in cart calculation",error)
  }
}

const addToCart = async (req,res)=>{
  try {

    if(!req.session.user){
      return res.status(STATUS_CODES.UNAUTHORIZED).json({success:false})
    }
    const productId = req.body.productId
    const variantId = req.body.variantId
    const userId = req.session.user
    const productData = await Product.findById(productId)
    
    if(productData.isBlocked === true){
      return res.status(StatusCodes.FORBIDDEN).json({success:false})
    }
    const variant = productData.variants.id(variantId)

    if(!variant){
      return res.status(STATUS_CODES.NOT_FOUND).json({success:false,message: ErrorMessages.INVAILD_VARIANT})
    }
    if(variant.stock<=0){
      return res.status(STATUS_CODES.UNAUTHORIZED).json({status:false,message: ErrorMessages.THIS_SIZE_IS_OUT_OF_STOCK})
    }

    let discountedUnitPrice =0
    let discount =0

    if(variant.finalPrice>0){
      discount = variant.price - variant.finalPrice
      discountedUnitPrice = variant.finalPrice
    }else{
      discount = productData.discount || 0
      discountedUnitPrice = Math.round(
      variant.price - (variant.price * discount / 100)
    )
    }

    let cart = await Cart.findOne({ userId })

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{
          productId,
          variantId,
          quantity: 1,
          unitPrice: discountedUnitPrice,
          originalPrice: variant.price,
          discount
        }]
      })
    }else{
      
      const itemIndex = cart.items.findIndex(val=>{
       return val.productId.toString() === productId && val.variantId.toString() === variantId
      })

      if(itemIndex>-1){

        if(cart.items[itemIndex].quantity+1 > variant.stock){
          return res.status(STATUS_CODES.BAD_REQUEST).json({success:false,message: ErrorMessages.STOCK_LIMIT_EXCEEDED})
        }
        cart.items[itemIndex].quantity+=1
      }else {
        cart.items.push({
          productId,
          variantId,
          quantity: 1,
          unitPrice: discountedUnitPrice,
          originalPrice: variant.price,
          discount
        })
      }
    }
    await cart.save()  
    console.log(productId,variantId)
    await Wishlist.updateOne({userId},{$pull:{items:{productId,variantId}}})

    return res.status(StatusCodes.OK).json({success:true})  

  } catch (error) {
    console.error("Server error",error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false})
  }
}


const cartRemove = async (req,res)=>{
  try {

    const  userId = req.session.user

    if(!userId){
      return res.status(StatusCodes.UNAUTHORIZED).json({success:false})
    }
    const {productId,variantId} = req.body
 
    const cart = await Cart.findOne({userId})
    if(!cart){ 
      return res.status(StatusCodes.NOT_FOUND).json({success:false,message: ErrorMessages.CART_NOT_FOUND})
    }

    cart.items = cart.items.filter(val=>{
      return !(val.productId.toString() === productId && val.variantId.toString() ===variantId)
    })

    await cart.save()
    return res.status(StatusCodes.OK).json({success:true,message: ErrorMessages.ITEM_REMOVED_FROM_CART})

  } catch (error) {
    console.error("Server error",error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false})
  }
}

const updateQuantity = async(req,res)=>{
  try {
    const userId = req.session.user
    const {productId,variantId,num} = req.body

    console.log(productId,variantId,num)

    const cart = await Cart.findOne({userId})
    if(!cart){
      return res.status(StatusCodes.BAD_REQUEST).json({success:false})
    }
    const items = cart.items.find(val=>{
      return (val.productId.toString()===productId && val.variantId.toString()===variantId)
    })
    if(!items){
      return res.status(StatusCodes.NOT_FOUND).json({ message: ErrorMessages.ITEM_NOT_FOUND })
    }

    const product = await Product.findOne({_id:productId})
    const discount = product.discount||0
    const variant = product.variants.id(variantId)
    const newQty = items.quantity+num


    if (newQty < 1) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: ErrorMessages.MINIMUM_QUANTITY_IS_1 })
    }
    if (newQty>variant.stock) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: ErrorMessages.STOCK_LIMIT_EXCEEDED })
    }
    const discountedUnitPrice = Math.round(
    variant.price - (variant.price * discount / 100)
  )
    const price = discountedUnitPrice * newQty
    console.log(discountedUnitPrice,discount,price)
    
    items.quantity = newQty

    await cart.save()
    const totals = calculateCartTotal(cart)

    return res.status(STATUS_CODES.OK).json({success:true,
      quantity:items.quantity,
      price,
      unitPrice:discountedUnitPrice,
      discount,
      subTotal: totals.subTotal,
      totalDiscount: totals.totalDiscount,
      grandTotal: totals.grandTotal
    })

  } catch (error) {
    console.error("qty update error",error)
    
  } 
}

export default {addToCart,loadAddToCart,cartRemove,updateQuantity}