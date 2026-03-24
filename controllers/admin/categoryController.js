import StatusCodes from '../../utitls/statusCodes.js';
import ErrorMessages from '../../utitls/errorMessages.js';
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
    const search = req.query.search || ""

    const userData = await User.find({isAdmin:true})
    req.session.adminName = userData[0].name

    const categoryData = await Category.find({$or:[{name:{$regex:search,$options:"i"}}]})
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit)

    const totalCategories = await Category.countDocuments({$or:[{name:{$regex:search,$options:"i"}}]})
    const totalPages = Math.ceil(totalCategories/limit)

    res.render("admin/categoryManagement",{
      admin:req.session.adminName,
      categoryData,
      currentPage: page,
      totalPages,
      totalCategories,
      search
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

const postAddCategory = async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED })
    }

    let name = req.body.categoryName

    if (!name || !name.trim()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: ErrorMessages.CATEGORY_NAME_REQUIRED })
    }

    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: ErrorMessages.CATEGORY_IMAGE_REQUIRED })
    }

    name = name.trim()

    const existingCategory = await Category.findOne({ name })
      .collation({ locale: "en", strength: 2 })

    if (existingCategory) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: ErrorMessages.CATEGORY_ALREADY_EXISTS })
    }

    const newCategory = new Category({
      name,
      image: req.file.path // ✅ Cloudinary URL
    })

    await newCategory.save()

    return res.status(StatusCodes.CREATED).json({
      message: ErrorMessages.CATEGORY_ADDED_SUCCESSFULLY
    })
    
  } catch (error) {
    console.error("Category create failed:", error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_SERVER_ERROR })
  }
}

const loadEditCategory = async (req,res)=>{
  try {

    if(req.session.admin){

      const categoryId = req.query.id
      const findCategory = await Category.findById(categoryId)
      
      if(findCategory){
        res.render("admin/editCategory",{admin:req.session.adminName,categoryData:findCategory})
      }
    }
    
  } catch (error) {

    console.error(ERROR_MESSAGES.CATEGORY_LOAD_FAILED,error)
    res.redirect("/admin/pageNotFound")
  }
}

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { categoryName } = req.body

    const category = await Category.findById(id)
    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: ErrorMessages.CATEGORY_NOT_FOUND })
    }

    const updateData = {}

    if (categoryName?.trim() && categoryName.trim() !== category.name) {
      const exists = await Category.findOne({
        name: { $regex: `^${categoryName.trim()}$`, $options: "i" }
      })

      if (exists && exists._id.toString() !== id) {
        return res.status(StatusCodes.CONFLICT).json({
          success: false,
          message: ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS
        })
      }

      updateData.name = categoryName.trim()
    }

    if (req.file) {
      updateData.image = req.file.path
    }

    if (!Object.keys(updateData).length) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: ErrorMessages.NOTHING_TO_UPDATE })
    }

    await Category.findByIdAndUpdate(id, { $set: updateData })

    res.status(StatusCodes.OK).json({ success: true, message: ErrorMessages.CATEGORY_UPDATED_SUCCESSFULLY })

  } catch (err) {
    console.error("Update category failed:", err)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: ErrorMessages.INTERNAL_SERVER_ERROR })
  }
}

const blockCategory = async (req,res)=>{

  try {

    const categoryId = req.params.id

    const findCategory = await Category.findById({_id:categoryId})

    if(findCategory){
    
    await Category.updateOne({_id:categoryId},{$set:{isBlocked:true}})
    res.status(StatusCodes.OK).json({ success: true})
  }
    
  } catch (error) {

    console.error(ERROR_MESSAGES.CATEGORY_BLOCK_FAILED)
    res.status(StatusCodes.BAD_REQUEST).json({ success: false})
  }
}

const unblockCategory = async (req,res)=>{

  try {

    const categoryId = req.params.id

    const findCategory = await Category.findById({_id:categoryId})

    if(findCategory){
    
    await Category.updateOne({_id:categoryId},{$set:{isBlocked:false}})
    res.status(StatusCodes.OK).json({ success: true})
  }
    
  } catch (error) {

    console.error(ERROR_MESSAGES.CATEGORY_BLOCK_FAILED)
    res.status(StatusCodes.BAD_REQUEST).json({ success: false})
  }

}

export default {loadCategoryInfo,loadaddCategory,updateCategory,postAddCategory,loadEditCategory,blockCategory,unblockCategory}