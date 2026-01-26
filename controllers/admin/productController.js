import Product from "../../models/productSchema.js"
import Category from "../../models/categorySchema.js"
import cloudinary from "../../config/cloudinary.js"
import STATUS_CODES from "../../utitls/statusCodes.js"
import ERROR_MESSAGES from "../../utitls/errorMessages.js"

const loadProducts = async(req,res)=>{
  try {

    if(req.session.admin){
      let page = parseInt(req.query.page)||1
      let limit = 6
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

      const {pName,price,description,discount,category,pTitle} = req.body

      if(!pName || !price || !description || !category || !pTitle){
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success:false,
          message:"All fields must be filled"
        })
      }
      if(!req.files || req.files.length<3){
        return res.status(STATUS_CODES.BAD_REQUEST).json({
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
      return res.status(STATUS_CODES.CREATED).json({ success: true,message: "Product added successfully"});

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
      console.log(findProduct)
      
      if(findProduct){
        return res.render("admin/editProduct",{admin:req.session.adminData.name,product:findProduct})
      }
      
    }
    
  } catch (error) {
    console.error("error in loading edit products",error)
  }
}

const postEditProduct = async (req, res) => {

  try {
    if (!req.session.admin) {
      return res.redirect("/admin/loadLogin");
    }

    const productId = req.params.id;
    const NAME = req.body?.name;
    const DESCRIPTION = req.body?.description;
    const DISCOUNT = req.body?.discount;
    const PRICE = req.body?.price;
    const TITLE = req.body?.title;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (req.files && req.files.length > 0) {
      for (let img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      product.images = req.files.map(file => ({
        url: file.path,
        public_id: file.filename
      }));
    }

    if (NAME) product.name = NAME;
    if (DESCRIPTION) product.description = DESCRIPTION;
    if (DISCOUNT) product.discount = DISCOUNT;
    if (PRICE) product.price = PRICE;
    if (TITLE) product.title = TITLE;

    await product.save();

    return res.json({ success: true });

  } catch (error) {
    console.error("error in editing products", error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.PRODUCT_UPDATE_FAILED
    });
  }
};



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