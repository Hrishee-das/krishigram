// src/routes/story.routes.js

import express from "express";
const router = express.Router();

import {
  createStory,
  getFeedStories,
  getMyStories,
  viewStory,
  getStoryViewers,
  deleteStory,
} from "../controllers/storyController.js";
import { protect } from "../controllers/authController.js";
import upload from "../middleware/upload.js";

router.post("/", protect, upload.single("media"), createStory);
router.get("/feed", protect, getFeedStories);
router.get("/my", protect, getMyStories);
router.post("/:id/view", protect, viewStory);
router.get("/:id/viewers", protect, getStoryViewers);
router.delete("/:id", protect, deleteStory);

export default router;
