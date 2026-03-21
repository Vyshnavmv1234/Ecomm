import User from "../models/userSchema.js";
import StatusCodes from '../utitls/statusCodes.js';
import ErrorMessages from '../utitls/errorMessages.js';

const userAuth = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect("/user/login");
    }

    const user = await User.findById(req.session.user);

    if (!user) {
      delete req.session.user; 
      return res.redirect("/user/login");
    }

    if (user.isBlocked) {
      delete req.session.user;   
      return res.redirect("/user/login");
    }

    req.user = user;
    next();

  } catch (error) {
    console.log("error in auth mw", error);
    return res.redirect("/user/login");
  }
};


const adminAuth = async (req, res, next) => {
  try {
    if(!req.session.admin){
      if (req.method !== 'GET' || req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ 
          success: false, 
          message: ErrorMessages.SESSION_EXPIRED_OR_UNAUTHORIZED_PLEASE_LOGIN_AGAIN 
        });
      }
      return res.redirect("/admin/adminLogin")
    }
    
    const admin = await User.findById(req.session.adminData?._id);

    if(!admin || !admin.isAdmin){
      if (req.method !== 'GET' || req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: ErrorMessages.ADMIN_PRIVILEGES_REQUIRED });
      }
      return res.redirect("/admin/adminLogin")
    }
    next()
    
  } catch (error) {
    console.error("error in adminauth mw", error);
    if (req.method !== 'GET' || req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: ErrorMessages.AUTHENTICATION_SERVER_ERROR });
    }
    return res.redirect("/admin/adminLogin");
  }
}

const checkBlockedUser = async (req, res, next) => {
  try {
    if (req.session.user) {
      const user = await User.findById(req.session.user);
      if (!user || user.isBlocked) {
        delete req.session.user;
        return res.redirect("/user/login?error=Your account has been blocked");
      }
      req.user = user;
    }
    next();
  } catch (error) {
    console.error("Error in checkBlockedUser middleware:", error);
    next();
  }
};


export {userAuth,adminAuth, checkBlockedUser};
