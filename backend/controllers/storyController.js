import Story from "../models/storyModel.js";
import User from "../models/userModel.js";
import { deleteFromCloudinary } from "../utils/cloudinary.utils.js";

// ─── Create Story ───────────────────────────────────────────
const createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Media file is required" });
    }

    const { caption, language } = req.body;

    // Determine media type from mimetype
    let mediaType = "image";
    if (req.file.mimetype.startsWith("video")) mediaType = "video";
    if (req.file.mimetype.startsWith("audio")) mediaType = "voice";

    const story = await Story.create({
      author: req.user._id,
      mediaUrl: req.file.path, // Cloudinary URL
      mediaPublicId: req.file.filename, // Cloudinary public_id
      mediaType,
      caption,
      language: language || "en",
    });

    await story.populate("author", "name profilePic");

    res.status(201).json({ success: true, data: story });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── Get Feed Stories ────────────────────────────────────────
const getFeedStories = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("following");
    const following = currentUser.following || [];

    const stories = await Story.find({
      author: { $in: [...following, req.user._id] },
      expiresAt: { $gt: new Date() },
    })
      .populate("author", "name profilePic")
      .sort({ createdAt: -1 });

    // Group stories by author
    const groupedMap = {};
    stories.forEach((story) => {
      const authorId = story.author._id.toString();
      if (!groupedMap[authorId]) {
        groupedMap[authorId] = {
          author: story.author,
          stories: [],
        };
      }
      groupedMap[authorId].stories.push(story);
    });

    res.status(200).json({
      success: true,
      data: Object.values(groupedMap),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── Get My Stories ──────────────────────────────────────────
const getMyStories = async (req, res) => {
  try {
    const stories = await Story.find({
      author: req.user._id,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: stories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── View Story ──────────────────────────────────────────────
const viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story)
      return res.status(404).json({ success: false, error: "Story not found" });

    const alreadyViewed = story.viewers.some(
      (v) => v.user.toString() === req.user._id.toString(),
    );

    if (!alreadyViewed) {
      story.viewers.push({ user: req.user._id });
      await story.save();
    }

    res.status(200).json({ success: true, message: "Story viewed" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── Get Story Viewers ───────────────────────────────────────
const getStoryViewers = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate(
      "viewers.user",
      "name profilePic",
    );

    if (!story)
      return res.status(404).json({ success: false, error: "Story not found" });

    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    res.status(200).json({ success: true, data: story.viewers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── Delete Story ────────────────────────────────────────────
// In deleteStory controller — replace the delete block with this:
const deleteStory = async (req, res) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!story)
      return res
        .status(404)
        .json({ success: false, error: "Story not found or unauthorized" });

    // ✅ Use stored publicId directly — no URL parsing needed
    const resourceType = story.mediaType === "image" ? "image" : "video";
    await deleteFromCloudinary(story.mediaPublicId, resourceType);

    await story.deleteOne();

    res.status(200).json({ success: true, message: "Story deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export {
  createStory,
  getFeedStories,
  getMyStories,
  viewStory,
  getStoryViewers,
  deleteStory,
};
