import express from "express";
import { protect } from "../controllers/authController.js";
import {
  analyzeQuery,
  getChatHistory,
  getChatSessions,
} from "../controllers/aiChatController.js";
import multer from "multer";

const router = express.Router();

// Setup multer for memory storage before uploading to cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// All AI Chat routes are protected
router.use(protect);

router.post(
  "/analyze",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "voice", maxCount: 1 },
  ]),
  analyzeQuery,
);
router.get("/sessions", getChatSessions);
router.get("/history", getChatHistory);

export default router;
