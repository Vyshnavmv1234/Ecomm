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
      return res.status(401).json({ error: "Unauthorized" })
    }

    let name = req.body.categoryName

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name required" })
    }

    if (!req.file) {
      return res.status(400).json({ error: "Category image required" })
    }

    name = name.trim()

    const existingCategory = await Category.findOne({ name })
      .collation({ locale: "en", strength: 2 })

    if (existingCategory) {
      return res.status(409).json({ error: "Category already exists" })
    }

    const newCategory = new Category({
      name,
      image: req.file.path // ✅ Cloudinary URL
    })

    await newCategory.save()

    return res.status(201).json({
      message: "Category added successfully"
    })

  } catch (error) {
    console.error("Category create failed:", error)
    return res.status(500).json({ error: "Internal server error" })
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
      return res.status(404).json({ success: false, message: "Category not found" })
    }
    console.log(category)

    const updateData = {}

    // ✅ Name update (only if changed)
    if (categoryName?.trim() && categoryName.trim() !== category.name) {
      const exists = await Category.findOne({
        name: { $regex: `^${categoryName.trim()}$`, $options: "i" }
      })

      if (exists && exists._id.toString() !== id) {
        return res.status(409).json({
          success: false,
          message: ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS
        })
      }

      updateData.name = categoryName.trim()
    }

    // ✅ Image update
    if (req.file) {
      updateData.image = req.file.path
    }

    // 🚫 Nothing changed
    if (!Object.keys(updateData).length) {
      return res.status(400).json({ success: false, message: "Nothing to update" })
    }

    await Category.findByIdAndUpdate(id, { $set: updateData })

    res.json({ success: true, message: "Category updated successfully" })

  } catch (err) {
    console.error("Update category failed:", err)
    res.status(500).json({ success: false, message: "Internal server error" })
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

export default {loadCategoryInfo,loadaddCategory,updateCategory,postAddCategory,loadEditCategory,blockCategory,unblockCategory}