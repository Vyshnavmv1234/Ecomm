import StatusCodes from '../../utitls/statusCodes.js';
import ErrorMessages from '../../utitls/errorMessages.js';
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
    const limit = 6
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
const loadAddOffer = async (req, res) => {
  try {

    const { title, type, product, discountValue, category, startDate, endDate } = req.body;

    // ---------------- PRODUCT OFFER ----------------
    if (type === "product") {

      const pdt = await Product.findById(product);

      if (!pdt) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: ErrorMessages.PRODUCT_NOT_FOUND });
      }

      if ((pdt.variants[0].price) / 2 < discountValue) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: ErrorMessages.DISCOUNT_VALUE_SHOULD_BE_LESS_THAN_HALF_THE_PRODUCT_VALUE
        });
      }

      const offer = new Offer({
        title,
        type,
        product,
        category,
        discountValue,
        startDate,
        endDate
      });

      await offer.save();

      const pdtDiscount = pdt.discount || 0;

      pdt.variants.forEach(v => {

        const productPrice = v.price - (v.price * pdtDiscount / 100);
        const offerPrice = v.price - discountValue;

        const bestPrice = Math.min(productPrice, offerPrice);

        v.finalPrice = bestPrice;

      });

      pdt.offer = offer._id;

      await pdt.save();
    }


    // ---------------- CATEGORY OFFER ----------------
    if (type === "category") {

      const products = await Product.find({
        category: category,
        isBlocked: false
      });

      let validProducts = [];

      // IMPORTANT: hasValidVariant check
      for (const pdt of products) {

        const hasValidVariant = pdt.variants.some(v =>
          discountValue < (v.price / 2)
        );

        if (hasValidVariant) {
          validProducts.push(pdt);
        }
      }

      if (validProducts.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false,
          message: ErrorMessages.NO_PRODUCTS_IN_THIS_CATEGORY_SATISFY_THE_DISCOUNT_CONDITION
        });
      }

      const offer = new Offer({
        title,
        type,
        category,
        discountValue,
        startDate,
        endDate
      });

      await offer.save();


      for (const pdt of validProducts) {

        const pdtDiscount = pdt.discount || 0;

        pdt.variants.forEach(v => {

          if (discountValue >= v.price / 2) return;

          const productPrice = v.price - (v.price * pdtDiscount / 100);
          const offerPrice = v.price - discountValue;

          const bestPrice = Math.min(productPrice, offerPrice);

          // apply category offer only if it is better
          if (!v.finalPrice || bestPrice < v.finalPrice) {

            v.finalPrice = bestPrice;
            pdt.offer = offer._id;

          }

        });

        await pdt.save();
      }
    }


    return res.status(StatusCodes.OK).json({
      success: true,
      message: ErrorMessages.OFFER_CREATED_SUCCESSFULLY
    });


  } catch (error) {

    console.error(error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ErrorMessages.SERVER_ERROR_WHILE_ADDING_OFFER
    });

  }
};
const toggleOfferStatus = async (req, res) => {
  try {

    const id = req.params.id;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: ErrorMessages.OFFER_NOT_FOUND
      });
    }

    offer.isActive = !offer.isActive;
    await offer.save();


    // ---------------- PRODUCT OFFER ----------------
    if (offer.type === "product") {

      const product = await Product.findById(offer.product);

      if (product) {

        const pdtDiscount = product.discount || 0;

        for (const v of product.variants) {

          const productPrice = v.price - (v.price * pdtDiscount / 100);

          if (offer.isActive && offer.discountValue < v.price / 2) {

            const offerPrice = v.price - offer.discountValue;

            const bestPrice = Math.min(productPrice, offerPrice);

            v.finalPrice = bestPrice;
            product.offer = offer._id;

          } else {

            v.finalPrice = productPrice;
            product.offer = null;

          }

        }

        await product.save();
      }
    }


    // ---------------- CATEGORY OFFER ----------------
    if (offer.type === "category") {

      const products = await Product.find({
        category: offer.category,
        isBlocked: false
      });

      for (const product of products) {

        const pdtDiscount = product.discount || 0;

        // check if product offer exists
        const productOffer = await Offer.findOne({
          product: product._id,
          type: "product",
          isActive: true
        });

        for (const v of product.variants) {

          const productPrice = v.price - (v.price * pdtDiscount / 100);

          if (offer.isActive && offer.discountValue < v.price / 2) {

            const offerPrice = v.price - offer.discountValue;

            const bestPrice = Math.min(productPrice, offerPrice);

            if (!v.finalPrice || bestPrice < v.finalPrice) {
              v.finalPrice = bestPrice;
              product.offer = offer._id;
            }

          } else {

            // restore product offer if exists
            if (productOffer && productOffer.discountValue < v.price / 2) {

              const offerPrice = v.price - productOffer.discountValue;

              const bestPrice = Math.min(productPrice, offerPrice);

              v.finalPrice = bestPrice;
              product.offer = productOffer._id;

            } else {

              v.finalPrice = productPrice;
              product.offer = null;

            }

          }

        }

        await product.save();
      }
    }

    return res.status(StatusCodes.OK).json({
      success: true
    });

  } catch (error) {

    console.log(error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ErrorMessages.SERVER_ERROR
    });

  }
}; 

const editOffer = async (req, res) => {
  try {

    const { title, product, category, discountValue, startDate, endDate } = req.body;

    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: ErrorMessages.OFFER_NOT_FOUND
      });
    }

    if (offer.type === "category") {

      const products = await Product.find({
        category: category,
        isBlocked: false
      });

      let validProductExists = false;

      for (const pdt of products) {

        const hasValidVariant = pdt.variants.some(v =>
          v.price > discountValue * 2
        );

        if (hasValidVariant) {
          validProductExists = true;
          break;
        }
      }

      if (!validProductExists) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false,
          message: ErrorMessages.NO_PRODUCTS_IN_THIS_CATEGORY_SATISFY_THE_DISCOUNT_CONDITION
        });
      }
    }

    offer.title = title;
    offer.product = product;
    offer.category = category;
    offer.discountValue = discountValue;
    offer.startDate = startDate;
    offer.endDate = endDate;

    await offer.save();


    if (offer.type === "product") {

      const pdt = await Product.findById(product);

      if (pdt) {

        if ((pdt.variants[0].price) / 2 < discountValue) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: ErrorMessages.DISCOUNT_VALUE_SHOULD_BE_LESS_THAN_HALF_THE_PRODUCT_VALUE
        });
      }

        const pdtDiscount = pdt.discount || 0;
        let applied = false;

        pdt.variants.forEach(v => {

          const productPrice = v.price - (v.price * pdtDiscount / 100);

          if (offer.isActive && v.price > offer.discountValue * 2) {

            const offerPrice = v.price - offer.discountValue;

            v.finalPrice = Math.min(productPrice, offerPrice);

            applied = true;

          } else {

            v.finalPrice = productPrice;

          }

        });

        pdt.offer = applied ? offer._id : null;

        await pdt.save();
      }
    }


    if (offer.type === "category") {

      const products = await Product.find({
        category: offer.category,
        isBlocked: false
      });

      for (const pdt of products) {

        const pdtDiscount = pdt.discount || 0;
        let applied = false;

        pdt.variants.forEach(v => {

          const productPrice = v.price - (v.price * pdtDiscount / 100);

          if (offer.isActive && v.price > offer.discountValue * 2) {

            const offerPrice = v.price - offer.discountValue;

            v.finalPrice = Math.min(productPrice, offerPrice);

            applied = true;

          } else {

            v.finalPrice = productPrice;

          }

        });

        pdt.offer = applied ? offer._id : null;

        await pdt.save();
      }
    }

    return res.status(StatusCodes.OK).json({ success: true,
      message: ErrorMessages.OFFER_UPDATED_SUCCESSFULLY
    });

  } catch (err) {

    console.log(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ErrorMessages.SERVER_ERROR
    });
  }
};

export default {loadOffer,loadAddOffer,toggleOfferStatus,editOffer}