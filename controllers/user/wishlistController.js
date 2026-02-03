import cart from "../../models/cartSchema.js"
import User from "../../models/userSchema.js"
import Wishlist from "../../models/wishlistSchema.js"


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
      return res.json({ success: true, action: "added" })
    }
    const index = wishlistData.items.findIndex(val=>{
      return val.productId.toString() === productId && val.variantId.toString() ===variantId
    })
    
    if(index>-1){
      wishlistData.items.splice(index,1)
      await wishlistData.save()
      return res.json({ success: true, action: "removed" })
    }
    wishlistData.items.push({productId,variantId})
    await wishlistData.save()
    return res.json({ success: true, action: "added" })
     
  } catch (error) {

    console.error(error)
    res.status(500).json({ success: false })
  }
}

export default{loadWishlist,postWishlist}