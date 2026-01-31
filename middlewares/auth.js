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
      return res.redirect("/admin/adminLogin")
    }
    const admin = await User.findOne({isAdmin:true})
    console.log(admin)

    if(!admin){
      return res.redirect("/admin/adminLogin")
    }
    next()
    
  } catch (error) {
    console.log("error in adminauth mw", error);
    return res.redirect("/admin/adminLogin");
  }
}


export {userAuth,adminAuth};
