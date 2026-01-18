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



const adminAuth = (req, res, next) => {
  User.findOne({isAdmin:true})
  .then(data=>{
    if(data){
      next()
    }else{
      res.redirect("/admin/adminLogin")
    }
  })
  .catch(error=>{
    console.log("error in admin MW auth")
    res.status(500).send("ServerError")
  })
}


export {userAuth,adminAuth};
