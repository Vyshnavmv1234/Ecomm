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
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ success: false, message: "Session expired. Please login again." });
      }
      return res.redirect("/admin/adminLogin")
    }
    const admin = await User.findOne({isAdmin:true})

    if(!admin){
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ success: false, message: "Admin account not found." });
      }
      return res.redirect("/admin/adminLogin")
    }
    next()
    
  } catch (error) {
    console.log("error in adminauth mw", error);
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ success: false, message: "Authentication error." });
    }
    return res.redirect("/admin/adminLogin");
  }
}


export {userAuth,adminAuth};
