import multer from "multer";
import type { RequestHandler } from "express";
import { MulterError } from "multer";
import { AppError } from "./errorHandler.js";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGES_PER_REQUEST = 20;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new AppError(400, "Only image files are allowed", "INVALID_FILE_TYPE"));
      return;
    }

    callback(null, true);
  },
});

export const uploadSingleImage = upload.single("image");
export const uploadMultipleImages = upload.array("images", MAX_IMAGES_PER_REQUEST);

export function handleMulterUpload(middleware: RequestHandler): RequestHandler {
  return (req, res, next) => {
    middleware(req, res, (error) => {
      if (error instanceof MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          next(new AppError(400, "Image file is too large", "FILE_TOO_LARGE"));
          return;
        }

        if (error.code === "LIMIT_FILE_COUNT") {
          next(new AppError(400, "Too many images in request", "TOO_MANY_IMAGES"));
          return;
        }

        next(new AppError(400, error.message, "UPLOAD_ERROR"));
        return;
      }

      next(error);
    });
  };
}
