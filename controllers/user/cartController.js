import Cart from "../../models/cartSchema.js"
import User from "../../models/userSchema.js"
import Product from "../../models/productSchema.js"
import Wishlist from "../../models/wishlistSchema.js"
import STATUS_CODES from "../../utitls/statusCodes.js"

const loadAddToCart = async(req,res)=>{
  try {

    const userId = req.session.user

    const userData = await User.findById(userId)

    const cart = await Cart.findOne({userId})
    .populate("items.productId")
    
    return res.render("user/cart",{user:userData,cartItems: cart?cart.items:[]})
    
  } catch (error) {
    console.error("Error in loading cart",error)
    return res.redirect("/user/pageNotFound")
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
      return res.status(403).json({success:false})
    }
    const variant = productData.variants.id(variantId)

    if(!variant){
      return res.status(STATUS_CODES.NOT_FOUND).json({success:false,message:"Invaild Variant"})
    }
    if(variant.stock<=0){
      return res.status(STATUS_CODES.UNAUTHORIZED).json({status:false,message:"This Size is Out of stock"})
    }

    let cart = await Cart.findOne({userId})

    if(!cart){  
      cart = new Cart({
        userId,
        items:[{productId,quantity:1,variantId}]  
      })
    }else{
      
      const itemIndex = cart.items.findIndex(val=>{
       return val.productId.toString() === productId && val.variantId.toString() === variantId
      })

      if(itemIndex>-1){

        if(cart.items[itemIndex].quantity+1 > variant.stock){
          return res.status(STATUS_CODES.BAD_REQUEST).json({success:false,message:"Stock Limit exceeded"})
        }
        cart.items[itemIndex].quantity+=1
      }else{
        cart.items.push({productId,quantity:1,variantId})
      }
      
    }
    await cart.save()  
    console.log(productId,variantId)
    await Wishlist.updateOne({userId},{$pull:{items:{productId,variantId}}})

    return res.status(200).json({success:true})  

  } catch (error) {
    console.error("Server error",error)
    return res.status(500).json({success:false})
  }
}


const cartRemove = async (req,res)=>{
  try {

    const  userId = req.session.user

    if(!userId){
      return res.status(401).json({success:false})
    }
    const {productId,variantId} = req.body
 
    const cart = await Cart.findOne({userId})
    if(!cart){ 
      return res.status(404).json({success:false,message:"Cart not found"})
    }

    cart.items = cart.items.filter(val=>{
      return !(val.productId.toString() === productId && val.variantId.toString() ===variantId)
    })

    await cart.save()
    return res.status(200).json({success:true,message:"Item removed from cart"})

  } catch (error) {
    console.error("Server error",error)
    return res.status(500).json({success:false})
  }
}
const updateQuantity = async(req,res)=>{
  try {
    const userId = req.session.user
    const {productId,variantId,num} = req.body

    console.log(productId,variantId,num)

    const cart = await Cart.findOne({userId})
    if(!cart){
      return res.status(400).json({success:false})
    }
    const items = cart.items.find(val=>{
      return (val.productId.toString()===productId && val.variantId.toString()===variantId)
    })
    if(!items){
      return res.status(404).json({ message: "Item not found" })
    }

    const product = await Product.findOne({_id:productId})
    const variant = product.variants.id(variantId)
    const newQty = items.quantity+num
    const price = variant.price*newQty

    if (newQty < 1) {
      return res.status(400).json({ message: "Minimum quantity is 1" })
    }
    if (newQty>variant.stock) {
      return res.status(400).json({ message: "Stock limit exceeded" })
    }
    items.quantity = newQty

    await cart.save()
    return res.status(STATUS_CODES.OK).json({success:true,quantity:items.quantity,price})

  } catch (error) {
    
  } 
}

export default {addToCart,loadAddToCart,cartRemove,updateQuantity}