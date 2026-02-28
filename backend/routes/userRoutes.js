import express from "express";
import authController from "../controllers/authController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/me", authController.protect, authController.getMe);
router.patch("/updateMe", authController.protect, upload.single("image"), authController.updateMe);
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

export default router;
