import User from "../models/userSchema.js"

const uploadProfile = async (req, res) => {
  try {
    console.log("FILE:", req.file);
    if (!req.file) {
      return res.redirect("/user/account");
    }

    await User.findByIdAndUpdate(
      req.session.user,
      {
        profileImage: req.file.path,        
        profileImageId: req.file.filename   
      }
    );
    res.redirect("/user/userProfile");

  } catch (err) {
    console.log(err);
    res.redirect("/user/pageNotFound");
  }
};

const red = async(req,res)=>{
  try {
    const user = await User.findById(req.session.user);

    res.render("user/userProfile", { user });
     
  } catch (err) {
    console.log(err);
    res.redirect("/user/pageNotFound");
  }
}

export default {uploadProfile,red};
 