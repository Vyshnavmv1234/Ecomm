import StatusCodes from '../utitls/statusCodes.js';
import ErrorMessages from '../utitls/errorMessages.js';
import multer from "multer";

export const multerErrorHandler = (err, req, res, next) => {

  if (err instanceof multer.MulterError) {

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorMessages.FILE_SIZE_TOO_LARGE
      });
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: err.message
    });
  }

  next(err);
};