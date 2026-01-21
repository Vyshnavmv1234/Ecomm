import Product from "../../models/productSchema.js"
import Category from "../../models/categorySchema.js"
import STATUS_CODES from "../../utitls/statusCodes.js"
import ERROR_MESSAGES from "../../utitls/errorMessages.js"

const loadProducts = async(req,res)=>{
  try {

    if(req.session.admin){
      let page = parseInt(req.query.page)||1
      let limit = 3
      let skip = (page-1)*limit
      let search = req.query.search || ""

      let products = await Product.find({name:{$regex:search,$options:"i"}})
      .sort({createdAt:-1})
      .skip(skip)
      .limit(limit)
      .populate("category")

      let totalProducts = await Product.countDocuments({name:{$regex:search,$options:"i"}})
      let totalPages = Math.ceil(totalProducts/limit)
      return res.render("admin/productManagement",{
        admin:req.session.adminData.name,
        products,
        limit,
        totalPages,
        currentPage:page,
        search
      })

    }
    
  } catch (error) {
    console.error("error in loading products",error)
    
  }
}
const loadAddProducts = async (req,res)=>{
  try {

    if(req.session.admin){

      const category = await Category.find({isBlocked:false})
      return res.render("admin/addProduct",{admin:req.session.adminData.name,category})
    }else{
      return res.redirect("/admin/pageNotFound")
    }
    
  } catch (error) {
    console.error("error in loading add products",error)
  }
}
const postAddProducts = async(req,res)=>{
  try {
    if(req.session.admin){
      console.log("hi")

      const {pName,price,description,discount,category,pTitle} = req.body

      if(!pName || !price || !description || !discount || !category || !pTitle){
        return res.json({
          success:false,
          message:"All fields must be filled"
        })
      }
      if(!req.files || req.files.length<3){
        return res.json({
        success: false,
        message: "Minimum 3 images required"
        })
      }

      const images = req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    }));
      
      const newProduct = new Product({
       name:pName,
       description,
       price,
       discount: discount||0,
       category,
       title:pTitle,
       images
      })
      
      await newProduct.save()
      return res.json({ success: true });

    }else{
      return res.redirect("/admin/pageNotFound")
    }
    
  } catch (error) {
     console.error("error in adding products",error)
  }
}

const loadEditProduct = async (req,res)=>{
  try {

    if(req.session.admin){

      const productId = req.params.id
      const findProduct = await Product.findById(productId)
      
      if(findProduct){
        return res.render("admin/editProduct",{admin:req.session.adminData.name,product:findProduct})
      }
      
    }
    
  } catch (error) {
    console.error("error in loading edit products",error)
  }
}
const postEditProduct = async(req,res)=>{
  try {

    if(req.session.admin){

      const productId = req.params.id
      const NAME = req.body.name
      const DESCRIPTION = req.body.description

      const findProduct = await Product.findById(productId)
      console.log(findProduct)

      if(findProduct){

        await Product.updateOne({_id:productId},{$set:{name:NAME,description:DESCRIPTION}})
        return res.json({success:true})
      }


    }else{
      return res.redirect("/admin/loadLogin")
    }
    
  } catch (error) {
    console.error("error in editing products",error)
  }
}

const blockProduct = async (req,res)=>{
  try {

    if(req.session.admin){
      const productId = req.params.id
      const findProduct = Product.findById(productId)

    if(findProduct){
      await Product.updateOne({_id:productId},{$set:{isBlocked:true}})
      return res.json({success:true})
    }else{
      return res.json({error:"Product not found"})
    }
    }
    
  } catch (error) {
    console.error("error in blocking products",error)
  }
}
const unblockProduct = async (req,res)=>{
  try {

    if(req.session.admin){
      const productId = req.params.id
      const findProduct = Product.findById(productId)

    if(findProduct){
      await Product.updateOne({_id:productId},{$set:{isBlocked:false}})
      return res.json({success:true})
    }else{
      return res.json({error:"Product not found"})
    }
    }
    
  } catch (error) {
    console.error("error in blocking products",error)
  }
}

export default {loadProducts,loadAddProducts,loadEditProduct,postAddProducts,postEditProduct,blockProduct,unblockProduct}