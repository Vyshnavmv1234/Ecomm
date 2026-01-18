import Category from "../../models/categorySchema.js"
import User from "../../models/userSchema.js"
import ERROR_MESSAGES from "../../utitls/errorMessages.js"
import STATUS_CODES from "../../utitls/statusCodes.js"


const loadCategoryInfo = async (req,res)=>{
  try {

    if(!req.session.admin){
      return res.redirect("/admin/adminLogin")
    }
    const page = parseInt(req.query.page)||1
    const limit = 4
    const skip = (page-1)*limit

    const userData = await User.find({isAdmin:true})
    req.session.adminName = userData[0].name

    const categoryData = await Category.find({})
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit)

    const totalCategories = await Category.countDocuments()
    const totalPages = Math.ceil(totalCategories/limit)

    res.render("admin/categoryManagement",{
      admin:req.session.adminName,
      categoryData,
      currentPage: page,
      totalPages,
      totalCategories
    })
    
  } catch (error) {

    console.error(ERROR_MESSAGES.CATEGORY_LOAD_FAILED,error)
    res.redirect("/admin/pageNotFound")
  } 
}

const loadaddCategory = async (req,res)=>{
  try {

    if(!req.session.admin){
      return res.redirect("/admin/adminLogin")
    }
    res.render("admin/addCategory",{admin:req.session.adminName})
    
  } catch (error) {

    console.error(ERROR_MESSAGES.CATEGORY_LOAD_FAILED,error)
    res.redirect("/admin/pageNotFound")
  }
}

const postAddCategory = async(req,res)=>{
  try {

    const name = req.body.search

    if(!req.session.admin){
    return res.redirect("/admin/adminLogin")
    }
    
    const existingCategory = await Category.findOne({name})
    if(existingCategory){
      return res.status(STATUS_CODES.BAD_REQUEST).json({error:ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS})
    }
    const newCategory = new Category({
      name
    })
    await newCategory.save()
    res.json({message:"Category added successfully"})
    
  } catch (error) {

    console.error(ERROR_MESSAGES.CATEGORY_CREATE_FAILED,error)
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({error:ERROR_MESSAGES.INTERNAL_ERROR})
  }
}

const loadEditCategory = async (req,res)=>{
  try {

    if(req.session.admin){
      res.render("admin/editCategory",{admin:req.session.adminName})
    }
    
  } catch (error) {

    console.error(ERROR_MESSAGES.CATEGORY_LOAD_FAILED,error)
    res.redirect("/admin/pageNotFound")
  }
}
const blockCategory = async (req,res)=>{

  try {

    const categoryId = req.params.id

    const findCategory = await Category.findById({_id:categoryId})

    if(findCategory){
    
    await Category.updateOne({_id:categoryId},{$set:{isBlocked:true}})
    res.json({success:true})
  }
    
  } catch (error) {

    console.error(ERROR_MESSAGES.CATEGORY_BLOCK_FAILED)
    res.json({success:false})
  }

}
const unblockCategory = async (req,res)=>{

  try {

    const categoryId = req.params.id

    const findCategory = await Category.findById({_id:categoryId})

    if(findCategory){
    
    await Category.updateOne({_id:categoryId},{$set:{isBlocked:false}})
    res.json({success:true})
  }
    
  } catch (error) {

    console.error(ERROR_MESSAGES.CATEGORY_BLOCK_FAILED)
    res.json({success:false})
  }

}

export default {loadCategoryInfo,loadaddCategory,postAddCategory,loadEditCategory,blockCategory,unblockCategory}