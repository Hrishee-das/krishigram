import express from "express";
import { protect, restrictTo } from "../controllers/authController.js";
import * as tutorialController from "../controllers/tutorialController.js";

const router = express.Router();

/* ---------------- TUTORIAL ROUTES ---------------- */

// Require authentication for all tutorial routes
// router.use(protect);

router
  .route("/")
  .get(protect, tutorialController.getAllTutorials)
  .post(
    protect,
    restrictTo("tutor"),
    tutorialController.uploadVideo,
    tutorialController.createTutorial
  );

router
  .route("/:id")
  .delete(protect, restrictTo("tutor"), tutorialController.deleteTutorial);

export default router;
