import User from "../models/userSchema.js"

const uploadProfile = async (req, res) => {
  try {

    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success:false,
        message:"Please select an image"
      });
    }

    await User.findByIdAndUpdate(
      req.session.user,
      {
        profileImage: req.file.path,
        profileImageId: req.file.filename
      }
    );

    return res.json({
      success:true,
      message:"Profile image updated successfully"
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success:false,
      message:"Something went wrong"
    });

  }
};

const red = async (req,res)=>{
  try {

    const user = await User.findById(req.session.user);

    res.render("user/userProfile",{ user });

  } catch (err) {

    console.log(err);
    res.redirect("/user/pageNotFound");

  }
}

export default { uploadProfile, red };