import User from "../../models/userSchema.js"
import Product from "../../models/productSchema.js"
import Category from "../../models/categorySchema.js"
import ERROR_MESSAGES from "../../utitls/errorMessages.js"
import STATUS_CODES from "../../utitls/statusCodes.js"
import category from "../../models/categorySchema.js"

const productDetail = async(req,res)=>{
  try {

    const userId = req.session.user
    const productId = req.query.id
    req.session.productId = productId
    const catData = await Category.find({isBlocked:false})

    const unblockedIds = []
    for(let val of catData){
      unblockedIds.push(val._id)
    }

    const productData = await Product.findOne({_id:productId,category:{$in:unblockedIds},isBlocked:false})
    console.log(productData)
    if(!productData){
      return res.redirect("/user/productList?blockedCategory=true")
    }
    const similarProduct = await Product.find({category:productData.category,_id:{$ne:productId},isBlocked:false})
    const userData = await User.findById(userId)
  
    return res.render("user/productDetail",{
      user:userData,
      productData,
      similarProduct
    })
    
  } catch (error) {
    console.error(ERROR_MESSAGES.PRODUCT_LOAD_FAILED,error)
    res.redirect("/user/pageNotFound")
  }
}

const addToCart = async (req,res)=>{
  try {

    const product = await Product.findById(req.session.productId)

    if(!product || product.quantity<1 || product.isBlocked){
      return res.status(STATUS_CODES.BAD_REQUEST)
    }
    
  } catch (error) {
    
  }
}

export default {productDetail,addToCart} 