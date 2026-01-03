import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const router = express.Router();

const upload = multer({ dest: "templmg/"});

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "westlane/banners",
    });

    // remove local temp image
    fs.unlinkSync(req.file.path);

    // 👇 render EJS and pass image url
    res.render("user/userHome", {
      bannerImage: result.secure_url,
    });

  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;
