import StatusCodes from '../../utitls/statusCodes.js';
import ErrorMessages from '../../utitls/errorMessages.js';
import cart from "../../models/cartSchema.js"
import User from "../../models/userSchema.js"
import Wishlist from "../../models/wishlistSchema.js"
import STATUS_CODES from "../../utitls/statusCodes.js"


const loadWishlist = async (req,res)=>{
  try {
    
    const userId = req.session.user
    const userData = await User.findById(userId)
    const wishlistData = await Wishlist.findOne({userId})
    .populate("items.productId")


    return res.render("user/wishlist",{user:userData,wishlist:wishlistData?wishlistData.items:[]})
    
  } catch (error) {
    
  }
}
const postWishlist = async (req,res)=>{
  try {
    
    const userId = req.session.user
    const {productId,variantId} = req.body

    let wishlistData = await Wishlist.findOne({userId})

    if(!wishlistData){

      wishlistData = new Wishlist({
        userId,
        items:[{productId,variantId}]
      })

      await wishlistData.save()
      return res.status(StatusCodes.OK).json({ success: true,
         action: "added",
         wishlistCount: wishlistData.items.length })
    }
    const index = wishlistData.items.findIndex(val=>{
      return val.productId.toString() === productId && val.variantId.toString() ===variantId
    })
    
    if(index>-1){
      wishlistData.items.splice(index,1)
      await wishlistData.save()
      return res.status(StatusCodes.OK).json({ success: true,
        action: "removed",
        wishlistCount: wishlistData.items.length
       })
    }   
    wishlistData.items.push({productId,variantId})
    await wishlistData.save()
    return res.status(StatusCodes.OK).json({ success: true, action: "added",wishlistCount: wishlistData.items.length })
     
  } catch (error) {

    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false })
  }
}
const deleteWishlist = async (req,res)=>{
  try {
    const userId = req.session.user
    const {productId,variantId} = req.body
    const wishlistData = await Wishlist.findOne({userId})

    console.log(wishlistData)
    
    if(!wishlistData){
      return res.status(STATUS_CODES.BAD_REQUEST).json({success:false})
    }
    wishlistData.items = wishlistData.items.filter(val=>{
      return !(val.productId.toString() === productId && val.variantId.toString() === variantId)
    })
    wishlistData.save()

    return res.status(STATUS_CODES.OK).json({success:true})
    
  } catch (error) {
    console.error("Error while removing product",error)
    return res.redirect("/user/pageNotFou")
  }
}

export default{loadWishlist,postWishlist,deleteWishlist}