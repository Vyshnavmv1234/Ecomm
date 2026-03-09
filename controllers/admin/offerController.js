import User from "../../models/userSchema.js"
import Product from "../../models/productSchema.js"
import Offer from "../../models/offerSchema.js"
import STATUS_CODES from "../../utitls/statusCodes.js"
import Category from "../../models/categorySchema.js"

const loadOffer = async (req,res)=>{
  try {

    const type = req.query.type || "product";
    const search = req.query.search || ""
    const page = parseInt(req.query.page) || 1
    const limit = 1
    const skip = (page - 1) * limit

    const admin = await User.findOne({isAdmin:true})
    const products = await Product.find({isBlocked:false})
    const categories = await Category.find({isBlocked:false});

    let match = { type }

    if(search){
      match.title = { $regex: search, $options: "i" }
    }

    const offers = await Offer.find(match)
    .populate("product")
    .populate("category")
    .skip(skip)
    .limit(limit)
  
    const totalOffers = await Offer.countDocuments(match)
    const totalPages = Math.ceil(totalOffers / limit)

    return res.render('admin/offer',{
      admin:admin.name,
      products,
      offers,
      categories,
      offerType:type,
      currentPage:page,
      totalPages,
      search
    })
    
  } catch (error) {
    console.log(error)
  }
}
const loadAddOffer = async (req,res)=>{
  try {
    
    const {title,type,product,discountValue,category,startDate,endDate} = req.body

    const offers =  new Offer({
      title,
      type,
      product,
      category,
      discountValue,
      startDate,
      endDate
    })
    await offers.save(); 

    if(type === "product"){

      const pdt = await Product.findById(product);

      const pdtDiscount = pdt.discount || 0;

      pdt.variants.forEach(v=>{

        const productPrice = v.price - (v.price * pdtDiscount / 100);
        const offerPrice = v.price - discountValue;
        
        const bestPrice = Math.min(productPrice, offerPrice);

        v.finalPrice = v.finalPrice
          ? Math.min(v.finalPrice, bestPrice)
          : bestPrice;
        });

      pdt.offer = offers._id;

      await pdt.save();
    }

    if(type === "category"){

      const products = await Product.find({ category: category,isBlocked:false });

      for(const pdt of products){

        const pdtDiscount = pdt.discount || 0;

        pdt.variants.forEach(v=>{

          const productPrice = v.price - (v.price * pdtDiscount / 100);
          const offerPrice = v.price - discountValue;

          const bestPrice = Math.min(productPrice, offerPrice);

          v.finalPrice = v.finalPrice
            ? Math.min(v.finalPrice, bestPrice)
            : bestPrice;
        });

        pdt.offer = offers._id;

        await pdt.save();
      }
    }

    return res.status(200).json({
      success:true
    });
    
  } catch (error) {
    
  }
}
const toggleOfferStatus = async (req,res)=>{
  try{

    const id = req.params.id;

    const offer = await Offer.findById(id);

    if(!offer){
      return res.status(404).json({
        success:false,
        message:"Offer not found"
      });
    }

    offer.isActive = !offer.isActive;
    await offer.save();


    if(offer.type === "product"){

      const product = await Product.findById(offer.product);

      if(product){

        const pdtDiscount = product.discount || 0;

        product.variants.forEach(v=>{

          if(offer.isActive){

            const productPrice = v.price - (v.price * pdtDiscount / 100);

            const offerPrice = v.price - offer.discountValue;

            v.finalPrice = Math.min(productPrice,offerPrice);

            product.offer = offer._id;

          }else{

            v.finalPrice = v.price - (v.price * pdtDiscount / 100);
            product.offer = null;
          }

        });

        await product.save();
      }
    }


    if(offer.type === "category"){

      const products =
        await Product.find({
          category:offer.category,
          isBlocked:false
        });

      for(const product of products){
 
        const pdtDiscount = product.discount || 0;

        product.variants.forEach(v=>{

          if(offer.isActive){

            const productPrice = v.price - (v.price * pdtDiscount / 100);

            const offerPrice = v.price - offer.discountValue;

            v.finalPrice = Math.min(productPrice,offerPrice);

            product.offer = offer._id;

          }else{

            v.finalPrice = v.price - (v.price * pdtDiscount / 100);
            product.offer = null;
          }

        });

        await product.save();
      }
    }

    return res.status(200).json({
      success:true
    });

  }catch(error){

    console.log(error);

    res.status(500).json({
      success:false,
      message:"Server error"
    });
  }
};

const editOffer = async (req, res) => {
  try {

    const { title, product, category, discountType, discountValue, startDate, endDate } = req.body;

    await Offer.findByIdAndUpdate(
      req.params.id,
      {
        title,
        product,
        category,
        discountType,
        discountValue,
        startDate,
        endDate
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Offer updated successfully"
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

export default {loadOffer,loadAddOffer,toggleOfferStatus,editOffer}