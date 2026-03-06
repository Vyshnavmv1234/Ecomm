import Cart from "../models/cartSchema.js"
import Wishlist from "../models/wishlistSchema.js"

const loadCartCount = async (req, res, next) => {
  try {
    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user });

      if (cart && cart.items.length > 0) {
        res.locals.cartCount = cart.items.reduce((total, item) => {
          return total + item.quantity;
        }, 0);
      } else {
        res.locals.cartCount = 0;
      }
    } else {
      res.locals.cartCount = 0;
    }

    next();
  } catch (error) {
    res.locals.cartCount = 0;
    next();
  }
};

const loadWishlistCount = async (req, res, next) => {
  try {
    if (req.session.user) {
      const wishlist = await Wishlist.findOne({ userId: req.session.user });
      let count =0

      if (wishlist && wishlist.items.length > 0) {

        res.locals.wishlistCount = wishlist.items.length
        
      } else {
        res.locals.wishlistCount = 0;
      }
    } else {
      res.locals.wishlistCount = 0;
    }

    next();
  } catch (error) {
    res.locals.wishlistCount = 0;
    next();
  }
};

export default {loadCartCount,loadWishlistCount}