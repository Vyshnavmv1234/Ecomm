import User from "../../models/userSchema.js"

const customerInfo = async (req,res)=>{
  try {

    if(req.session.admin){

    const page = parseInt(req.query.page || 1)
    const limit = 6
    const search = req.query.search || ""

    const userData = await User.find({isAdmin:false,
      $or:[{name:{$regex:search,$options:"i"}},{email:{$regex:search,$options:"i"}}]
    })
    .limit(limit) 
    .skip((page-1)*limit)
    .sort({_id:-1})

    const count = await User.countDocuments({isAdmin:false,
      $or:[
        {name:{$regex:search,$options:"i"}},
        {email:{$regex:search,$options:"i"}}]})
        
    const totalPages = Math.ceil(count/limit)

    res.render("admin/customerManagement",{
      data:userData,
      admin:req.session.adminData.name,
      totalPages,
      currentPage:page,
      search
    })
  }else{
    res.redirect("/admin/adminLogin")
  }
    
  } catch (error) {
    
    console.log("Error loading User details")
    res.redirect("/admin/pageNotFound")
  }
}

const customerBlock = async(req,res)=>{
  try {
 
    const blockedUserId = req.params.id 
    const findUser = await User.findById({_id:blockedUserId})
    
    if(findUser){
      await User.updateOne({_id:blockedUserId},{$set:{isBlocked:true}})
      
      res.json({success:true})
    }
    
  } catch (error) { 
    console.log("blocking error")
    res.redirect("/admin/error")
  }
}

const customerUnBlock = async(req,res)=>{
  try {

    const unblockedUserId = req.params.id 
    const findUser = await User.findById({_id:unblockedUserId})
    
    if(findUser){
      await User.updateOne({_id:unblockedUserId},{$set:{isBlocked:false}})
      
      res.json({success:true})
    }
    
  } catch (error) { 
    console.log("unblocking error")
    res.redirect("/admin/error")
  }
}
export default {customerInfo,customerBlock,customerUnBlock}