import Product from "../../models/productSchema.js"
import Category from "../../models/categorySchema.js"
import cloudinary from "../../config/cloudinary.js"
import STATUS_CODES from "../../utitls/statusCodes.js"
import ERROR_MESSAGES from "../../utitls/errorMessages.js"
import { json } from "express"

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

      const {pName,description,discount,category,pTitle} = req.body
      const variants = JSON.parse(req.body.variants)
      console.log(variants)

      if(!variants || variants.length==0){
        return res.status(STATUS_CODES.BAD_REQUEST).json({success:false,error: "At least one variant is required"})
      }

      if(!pName || !description || !category || !pTitle){
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
       variants,
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
    const { name, description, discount, title } = req.body;
    const variants = JSON.parse(req.body.variants || "[]");

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path,
        public_id: file.filename
      }));

      product.images.push(...newImages);
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (discount) product.discount = discount;
    if (title) product.title = title;
    if (variants.length) product.variants = variants;

    if (product.images.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Minimum 3 images are required"
      });
    }

    await product.save();
    return res.json({ success: true });

  } catch (error) {
    console.error("error in editing products", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product"
    });
  }
};


const removeProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false });
    }

    const image = product.images.find(
      img => img._id.toString() === imageId
    );

    if (!image) {
      return res.status(404).json({ success: false });
    }

    // delete from cloudinary
    await cloudinary.uploader.destroy(image.public_id);

    await Product.findByIdAndUpdate(productId, {
      $pull: { images: { _id: imageId } }
    });

    return res.json({ success: true });

  } catch (error) {
    console.error("remove image error", error);
    return res.status(500).json({ success: false });
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

export default {loadProducts,loadAddProducts,loadEditProduct,postAddProducts,postEditProduct,blockProduct,unblockProduct,removeProductImage}