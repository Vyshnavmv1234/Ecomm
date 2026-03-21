import StatusCodes from '../utitls/statusCodes.js';
import ErrorMessages from '../utitls/errorMessages.js';
import User from "../models/userSchema.js"

const uploadProfile = async (req, res) => {
  try {

    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success:false,
        message: ErrorMessages.PLEASE_SELECT_AN_IMAGE
      });
    }

    await User.findByIdAndUpdate(
      req.session.user,
      {
        profileImage: req.file.path,
        profileImageId: req.file.filename
      }
    );

    return res.status(StatusCodes.OK).json({ success: true,
      message: ErrorMessages.PROFILE_IMAGE_UPDATED_SUCCESSFULLY
    });

  } catch (err) {

    console.log(err);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success:false,
      message: ErrorMessages.SOMETHING_WENT_WRONG
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