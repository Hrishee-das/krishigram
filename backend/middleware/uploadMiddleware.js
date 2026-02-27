import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const cloudinaryStorage = {
  _handleFile(req, file, cb) {
    let resourceType = "image";
    if (file.mimetype.startsWith("video")) resourceType = "video";
    if (file.mimetype.startsWith("audio")) resourceType = "video";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "message-uploads",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return cb(error);

        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
          mimetype: file.mimetype,
        });
      }
    );

    file.stream.pipe(uploadStream);
  },

  _removeFile(req, file, cb) {
    if (file.filename) {
      cloudinary.uploader
        .destroy(file.filename, { resource_type: "video" })
        .then(() => cb(null))
        .catch(cb);
    } else {
      cb(null);
    }
  },
};

const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export default upload;