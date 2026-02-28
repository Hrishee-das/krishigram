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
  const filter = {};
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const tutorials = await Tutorial.find(filter)
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

const uploadAudioMulter = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for search audio
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio") || file.mimetype.startsWith("video")) {
      cb(null, true);
    } else {
      cb(new AppError("Only audio/video files are allowed for search", 400), false);
    }
  }
});

export const uploadSearchAudio = uploadAudioMulter.single("audio");

export const searchTutorialsByVoice = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please provide an audio file for search.", 400));
  }

  const { extractKeywordsFromAudio } = await import("../utils/aiService.js");

  // 1. Get Keywords from Gemini
  const keywordsText = await extractKeywordsFromAudio(req.file.buffer, req.file.mimetype);

  if (!keywordsText) {
    return next(new AppError("Could not understand the audio.", 400));
  }

  // 2. Format keywords for MongoDB search
  // E.g., "wheat pests yellow leaves" -> search by regex
  const keywordsArray = keywordsText.split(/\s+/).filter(word => word.length > 2);

  if (keywordsArray.length === 0) {
    return res.status(200).json({ status: "success", data: [] });
  }

  // Create regex pattern to match ANY of the keywords
  const regexPattern = keywordsArray.join('|');

  const tutorials = await Tutorial.find({
    $or: [
      { title: { $regex: regexPattern, $options: 'i' } },
      { description: { $regex: regexPattern, $options: 'i' } }
    ]
  }).populate("tutor", "name nameId");

  res.status(200).json({
    status: "success",
    results: tutorials.length,
    data: tutorials,
  });
});

