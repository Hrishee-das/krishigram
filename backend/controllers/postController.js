import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import Post from "../models/postModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

/* ---------------- MULTER MEMORY STORAGE ---------------- */

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/mpeg",
      "audio/mpeg",
      "audio/wav",
      "audio/mp3",
      "audio/x-m4a",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Only images, videos and audio files are allowed",
          400
        ),
        false
      );
    }
  },
});

export const uploadMedia = upload.single("media");
export const uploadCommentAudio = upload.single("audio");

/* ---------------- CREATE POST / SUCCESS STORY ---------------- */

export const createPost = catchAsync(async (req, res, next) => {
  const { title, description, location, postType } = req.body;

  if (!title || !description || !postType) {
    return next(
      new AppError("Title, Description and postType required", 400)
    );
  }

  if (!["post", "successStory"].includes(postType)) {
    return next(new AppError("Invalid postType", 400));
  }

  let mediaUrl = null;
  let publicId = null;
  let mediaType = null;

  // Success Story must include media
  if (postType === "successStory" && !req.file) {
    return next(
      new AppError(
        "Success Story must include image, video or audio",
        400
      )
    );
  }

  if (req.file) {
    const base64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder:
        postType === "successStory"
          ? "krishigram/success-stories"
          : "krishigram/posts",
      resource_type: "auto",
    });

    mediaUrl = uploadResult.secure_url;
    publicId = uploadResult.public_id;

    // Detect correct media type
    if (req.file.mimetype.startsWith("image")) {
      mediaType = "image";
    } else if (req.file.mimetype.startsWith("video")) {
      mediaType = "video";
    } else if (req.file.mimetype.startsWith("audio")) {
      mediaType = "audio";
    }
  }

  const post = await Post.create({
    title,
    description,
    location,
    postType,
    media: mediaUrl,
    mediaPublicId: publicId,
    mediaType,
    user: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: post,
  });
});

/* ---------------- GET ALL (OPTIONAL FILTER) ---------------- */

export const getAllPosts = catchAsync(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.type) {
    filter.postType = req.query.type;
  }

  // Filter by a specific user's posts (e.g. for the profile tab)
  if (req.query.user) {
    filter.user = req.query.user;
  }

  const posts = await Post.find(filter)
    .populate("user", "name nameId profilePic")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: "success",
    results: posts.length,
    data: posts,
  });
});

/* ---------------- LIKE ---------------- */

export const likePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) return next(new AppError("Post not found", 404));

  if (post.likes.includes(req.user.id)) {
    return next(new AppError("Already liked", 400));
  }

  post.likes.push(req.user.id);
  await post.save();

  res.status(200).json({
    status: "success",
    likesCount: post.likes.length,
  });
});

/* ---------------- UNLIKE ---------------- */

export const unlikePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) return next(new AppError("Post not found", 404));

  post.likes = post.likes.filter(
    (id) => id.toString() !== req.user.id
  );

  await post.save();

  res.status(200).json({
    status: "success",
    likesCount: post.likes.length,
  });
});

/* ---------------- ADD COMMENT (TEXT + AUDIO) ---------------- */

export const addComment = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) return next(new AppError("Post not found", 404));

  let commentData = {
    user: req.user.id,
  };

  // If audio comment
  if (req.file) {
    const base64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: "krishigram/comment-audio",
      resource_type: "auto",
    });

    commentData.commentType = "audio";
    commentData.audio = uploadResult.secure_url;
    commentData.audioPublicId = uploadResult.public_id;
  } else {
    if (!req.body.text) {
      return next(new AppError("Comment text required", 400));
    }

    commentData.commentType = "text";
    commentData.text = req.body.text;
  }

  post.comments.push(commentData);
  await post.save();

  res.status(200).json({
    status: "success",
    comments: post.comments,
  });
});

/* ---------------- DELETE POST ---------------- */

export const deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) return next(new AppError("Post not found", 404));

  if (post.user.toString() !== req.user.id) {
    return next(new AppError("Not allowed", 403));
  }

  if (post.mediaPublicId) {
    await cloudinary.uploader.destroy(post.mediaPublicId, {
      resource_type:
        post.mediaType === "image" ? "image" : "video",
    });
  }

  await post.deleteOne();

  res.status(204).json({
    status: "success",
    data: null,
  });
});