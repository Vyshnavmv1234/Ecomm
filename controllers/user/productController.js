import User from "../../models/userSchema.js"
import Product from "../../models/productSchema.js"
import Category from "../../models/categorySchema.js"
import ERROR_MESSAGES from "../../utitls/errorMessages.js"

const productDetail = async(req,res)=>{
  try {

    const userId = req.session.user
    const productId = req.query.id
    req.session.productId = productId

    const userData = await User.findById(userId)
    const productData = await Product.findById(productId)
    return res.render("user/productDetail",{
      user:userData,
      productData
    })
    
  } catch (error) {

    console.error(ERROR_MESSAGES.PRODUCT_LOAD_FAILED,error)
  }
}
const addToCart = async (req,res)=>{
  
}

export default {productDetail,addToCart} 