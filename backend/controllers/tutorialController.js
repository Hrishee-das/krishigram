import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import Tutorial from "../models/tutorialModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

/* ---------------- MULTER MEMORY STORAGE ---------------- */

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for tutorials
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video")) {
      cb(null, true);
    } else {
      cb(new AppError("Only videos are allowed for tutorials", 400), false);
    }
  },
});

export const uploadVideo = upload.single("video");

/* ---------------- CREATE TUTORIAL ---------------- */

export const createTutorial = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return next(new AppError("Title and Description are required", 400));
  }

  if (!req.file) {
    return next(new AppError("Tutorial video is required", 400));
  }

  const base64 = req.file.buffer.toString("base64");
  const dataURI = `data:${req.file.mimetype};base64,${base64}`;

  // Upload to Cloudinary
  const uploadResult = await cloudinary.uploader.upload(dataURI, {
    folder: "krishigram/tutorials",
    resource_type: "video",
  });

  const tutorial = await Tutorial.create({
    title,
    description,
    videoUrl: uploadResult.secure_url,
    videoPublicId: uploadResult.public_id,
    tutor: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: tutorial,
  });
});

/* ---------------- GET ALL TUTORIALS ---------------- */

export const getAllTutorials = catchAsync(async (req, res) => {
  const tutorials = await Tutorial.find()
    .populate("tutor", "name nameId")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: tutorials.length,
    data: tutorials,
  });
});

/* ---------------- DELETE TUTORIAL ---------------- */

export const deleteTutorial = catchAsync(async (req, res, next) => {
  const tutorial = await Tutorial.findById(req.params.id);

  if (!tutorial) return next(new AppError("Tutorial not found", 404));

  // Verify ownership
  if (tutorial.tutor.toString() !== req.user.id) {
    return next(new AppError("Not allowed to delete this tutorial", 403));
  }

  if (tutorial.videoPublicId) {
    await cloudinary.uploader.destroy(tutorial.videoPublicId, {
      resource_type: "video",
    });
  }

  await tutorial.deleteOne();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
