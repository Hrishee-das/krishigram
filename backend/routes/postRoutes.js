import express from "express";
import { protect } from "../controllers/authController.js";
import * as postController from "../controllers/postController.js";

const router = express.Router();

/* ---------------- BASE ROUTE ---------------- */

// GET  -> all posts (optional filter ?type=post or ?type=successStory)
// POST -> create post or success story

router
  .route("/")
  .get(postController.getAllPosts)
  .post(protect, postController.uploadMedia, postController.createPost);

/* ---------------- INTERACTIONS ---------------- */

router.patch("/:id/like", protect, postController.likePost);

router.patch("/:id/unlike", protect, postController.unlikePost);

router.post("/:id/comment", protect, postController.addComment);

/* ---------------- DELETE ---------------- */

router.delete("/:id", protect, postController.deletePost);

export default router;
