import express from "express";
import { getMessages, sendMessage } from "../controllers/chatController.js";
import { protect } from "../controllers/authController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/:chatRoomId", protect, getMessages);
router.post("/", protect, upload.single("file"), sendMessage);  
// router.post("/", protect, sendMessage);

export default router;