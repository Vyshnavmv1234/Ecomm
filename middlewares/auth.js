import User from "../models/userSchema.js";

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
      // If it's a POST/PATCH/PUT/DELETE OR an AJAX request, return JSON
      if (req.method !== 'GET' || req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
        return res.status(401).json({ 
          success: false, 
          message: "Session expired or unauthorized. Please login again." 
        });
      }
      return res.redirect("/admin/adminLogin")
    }
    
    // Check if admin actually exists (optional but good for safety)
    const admin = await User.findById(req.session.adminData?._id);

    if(!admin || !admin.isAdmin){
      if (req.method !== 'GET' || req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
        return res.status(401).json({ success: false, message: "Admin privileges required." });
      }
      return res.redirect("/admin/adminLogin")
    }
    next()
    
  } catch (error) {
    console.error("error in adminauth mw", error);
    if (req.method !== 'GET' || req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
      return res.status(500).json({ success: false, message: "Authentication server error." });
    }
    return res.redirect("/admin/adminLogin");
  }
}


export {userAuth,adminAuth};
