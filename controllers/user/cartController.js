import Cart from "../../models/cartSchema.js"
import User from "../../models/userSchema.js"
import Product from "../../models/productSchema.js"

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
      return res.status(401).json({success:false})
    }
    const productId = req.body.productId
    const variantId = req.body.variantId
    const userId = req.session.user
    const productData = await Product.findById(productId)
    
    if(productData.isBlocked === true){
      return res.status(403).json({success:false})
    }

    let cart = await Cart.findOne({userId})

    if(!cart){  
      cart = new Cart({
        userId,
        items:[{productId,quantity:1,variantId}]  
      })
    }else{
      cart.items.push({productId,quantity:1,variantId})
    }
    await cart.save()  

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

export default {addToCart,loadAddToCart,cartRemove}