// src/utils/cloudinary.utils.js
import cloudinary from "../config/cloudinary.js";

// Extract public_id from a Cloudinary URL
const getPublicId = (url) => {
  const parts = url.split("/");
  const filename = parts[parts.length - 1].split(".")[0];
  const folder = parts[parts.length - 2];
  return `${folder}/${filename}`;
};

const deleteFromCloudinary = async (url, resourceType = "image") => {
  try {
    const publicId = getPublicId(url);
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};

export { deleteFromCloudinary };
