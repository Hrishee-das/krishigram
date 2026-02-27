// src/middleware/upload.middleware.js
import multer from "multer";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

// ─── Custom Cloudinary v2 Storage Engine ─────────────────────
const cloudinaryStorage = {
  _handleFile(req, file, cb) {
    // Determine resource type
    let resourceType = "image";
    if (file.mimetype.startsWith("video")) resourceType = "video";
    if (file.mimetype.startsWith("audio")) resourceType = "video"; // Cloudinary uses 'video' for audio

    // Transformations based on type
    const transformation =
      resourceType === "image"
        ? [
            {
              width: 1080,
              crop: "limit",
              quality: "auto",
              fetch_format: "auto",
            },
          ]
        : [{ quality: "auto" }];

    // Open a Cloudinary upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "farmer-stories",
        resource_type: resourceType,
        transformation,
      },
      (error, result) => {
        if (error) return cb(error);

        // Pass result to req.file
        cb(null, {
          path: result.secure_url, // Cloudinary URL
          filename: result.public_id, // Cloudinary public_id
          size: result.bytes,
          mimetype: file.mimetype,
        });
      },
    );

    // // Pipe the file buffer stream into Cloudinary
    // const readableStream = new Readable();
    // readableStream.push(null); // will be replaced below

    file.stream.pipe(uploadStream);
  },

  _removeFile(req, file, cb) {
    // Called when upload fails — cleanup Cloudinary
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

// ─── File Filter ──────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "audio/mpeg",
    "audio/wav",
    "audio/m4a",
    "audio/mp4",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

// ─── Export Multer with Custom Storage ───────────────────────
const upload = multer({
  storage: cloudinaryStorage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export default upload;
