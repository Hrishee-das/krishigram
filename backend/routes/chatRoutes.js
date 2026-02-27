import express from "express";
import { getMessages, sendMessage } from "../controllers/chatController.js";
import { protect } from "../controllers/authController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/:chatRoomId", protect, getMessages);
router.post(
    "/",
    protect,
    upload.fields([
        { name: "image", maxCount: 5 },
        { name: "audio", maxCount: 5 },
        { name: "file", maxCount: 5 },
    ]),
    sendMessage
);
// router.post("/", protect, sendMessage);

export default router;