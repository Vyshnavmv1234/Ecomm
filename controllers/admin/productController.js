import StatusCodes from '../../utitls/statusCodes.js';
import ErrorMessages from '../../utitls/errorMessages.js';
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

      products.forEach(p=>{
        p.totalStock = p.variants.reduce((sum,v)=>sum+v.stock,0)
      })

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

      if(!variants || variants.length==0){
        return res.status(STATUS_CODES.BAD_REQUEST).json({success:false,error: ErrorMessages.AT_LEAST_ONE_VARIANT_IS_REQUIRED})
      }

      if(!pName || !description || !category || !pTitle){
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success:false,
          message: ErrorMessages.ALL_FIELDS_MUST_BE_FILLED
        })
      }
      if(!req.files || req.files.length<3){
        return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: ErrorMessages.MINIMUM_3_IMAGES_REQUIRED
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
      return res.status(STATUS_CODES.CREATED).json({ success: true,message: ErrorMessages.PRODUCT_ADDED_SUCCESSFULLY});

    }else{
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success:false,
        message: ErrorMessages.UNAUTHORIZED_ADMIN_ACCESS
      });
    }
    
  } catch (error) {
     console.error("error in adding products",error)
     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
       success:false,
       message: error.message || "Internal server error"
     })
  }
}

const loadEditProduct = async (req,res)=>{
  try {

    if(req.session.admin){

      const productId = req.params.id
      const findProduct = await Product.findById(productId).populate("category")
      
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
    const { name, description, discount, title, category } = req.body;

    const variants = JSON.parse(req.body.variants || "[]");
    const removedImages = JSON.parse(req.body.removedImages || "[]"); 
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: ErrorMessages.PRODUCT_NOT_FOUND });
    }

    if (removedImages.length > 0) {

      const imagesToDelete = product.images.filter(img =>
        removedImages.includes(img._id.toString())
      );

      for (let img of imagesToDelete) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      product.images = product.images.filter(
        img => !removedImages.includes(img._id.toString())
      );
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
    if (category) product.category = category;

    if (variants.length) {

      const updatedIds = variants
        .filter(v => v._id)
        .map(v => v._id.toString());

      product.variants =
        product.variants.filter(v =>
          updatedIds.includes(v._id.toString())
        );

      variants.forEach(updatedVariant => {

        if (updatedVariant._id) {

          const existing =
            product.variants.id(updatedVariant._id);

          if (existing) {
            existing.size = updatedVariant.size;
            existing.price = updatedVariant.price;
            existing.stock = updatedVariant.stock;
          }

        } else {

          product.variants.push(updatedVariant);
        }
      });
    }

    if (product.images.length < 3) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorMessages.MINIMUM_3_IMAGES_ARE_REQUIRED
      });
    }

    await product.save();

    return res.status(StatusCodes.OK).json({ success: true });

  } catch (error) {
    console.error("error in editing products", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ErrorMessages.FAILED_TO_UPDATE_PRODUCT
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
      return res.status(StatusCodes.OK).json({ success: true})
    }else{
      return res.json({error: ErrorMessages.PRODUCT_NOT_FOUND})
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
      return res.status(StatusCodes.OK).json({ success: true})
    }else{
      return res.json({error: ErrorMessages.PRODUCT_NOT_FOUND})
    }
    }
    
  } catch (error) {
    console.error("error in blocking products",error)
  }
}

export default {loadProducts,loadAddProducts,loadEditProduct,postAddProducts,postEditProduct,blockProduct,unblockProduct}