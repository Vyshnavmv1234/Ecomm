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
        return res.json({ success: false, message: "Product not found" });
      }

      if ((pdt.variants[0].price) / 2 < discountValue) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: "Discount value should be less than half the product value"
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
        return res.json({
          success: false,
          message: "No products in this category satisfy the discount condition"
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


    return res.status(200).json({
      success: true,
      message: "Offer created successfully"
    });


  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error while adding offer"
    });

  }
};
const toggleOfferStatus = async (req, res) => {
  try {

    const id = req.params.id;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found"
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

    return res.status(200).json({
      success: true
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
}; 

const editOffer = async (req, res) => {
  try {

    const { title, product, category, discountValue, startDate, endDate } = req.body;

    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found"
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
        return res.json({
          success: false,
          message: "No products in this category satisfy the discount condition"
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
          message: "Discount value should be less than half the product value"
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

    return res.json({
      success: true,
      message: "Offer updated successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export default {loadOffer,loadAddOffer,toggleOfferStatus,editOffer}