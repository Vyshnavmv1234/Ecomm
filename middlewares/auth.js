import User from "../models/userSchema.js"

const userAuth = (req, res, next) => {

  if (req.session.user) {

    User.findById(req.session.user)
    .then(data=>{

      if(data && !data.isBlocked){
        next()
      }else{

        res.redirect("/user/login")
      }
    })
    .catch(err=>{
      console.log("error in auth mw")
      res.status(500).send("Internal server occured") 
    })
  }else{
   return res.redirect("/user/login") 
  }
}

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
