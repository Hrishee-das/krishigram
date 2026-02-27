import express from "express";
import { protect } from "../controllers/authController.js";
import { analyzeUniversalQuery, getUniversalChatHistory, getUniversalChatSessions } from "../controllers/universalChatController.js";
import multer from "multer";

const router = express.Router();

// Setup multer for memory storage before uploading to cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// All Universal Chat routes are protected
router.use(protect);

router.post("/analyze", upload.fields([{ name: "image", maxCount: 1 }, { name: "voice", maxCount: 1 }]), analyzeUniversalQuery);
router.get("/sessions", getUniversalChatSessions);
router.get("/history", getUniversalChatHistory);

export default router;
