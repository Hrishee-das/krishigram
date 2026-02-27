import { text } from "express";
import Message from "../models/messageModel.js";

export const getMessages = async (req, res, next) => {
  try {
    const { chatRoomId } = req.params;

    if (!chatRoomId) {
      return res.status(400).json({
        success: false,
        message: "ChatRoomId is required",
      });
    }

    const messages = await Message.find({ chatRoomId })
      .populate("user", "name nameId")
      .sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });

  } catch (error) {
    next(error);
  }
};


export const sendMessage = async (req, res, next) => {
  try {
    const { chatRoomId, regionName, district, text } = req.body;

    if (!chatRoomId || !regionName || !district || !text) {
      return res.status(400).json({
        success: false,
        message: "chatRoomId, regionName, district, user and text are required",
      });
    }

    const newMessage = await Message.create({
      chatRoomId,
      regionName,
      district,
      user: req.user._id,
      messageType: "text",
      text,
    });

    res.status(201).json({
      success: true,
      message: "Message saved successfully",
      data: newMessage,
    });

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   🔹 Send File / Image / Audio Message
====================================================== */
export const sendFileMessage = async (req, res, next) => {
  try {
    const { chatRoomId, regionName, district } = req.body;

    if (!chatRoomId || !regionName || !district) {
      return res.status(400).json({
        success: false,
        message: "chatRoomId, regionName and district are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Detect file type automatically
    let messageType = "file";

    if (req.file.mimetype.startsWith("image")) {
      messageType = "image";
    } else if (req.file.mimetype.startsWith("audio")) {
      messageType = "audio";
    }

    const newMessage = await Message.create({
      chatRoomId,
      regionName,
      district,
      user: req.user._id,
      text: text || "", // Optional text with the file
      messageType,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
    });

    res.status(201).json({
      success: true,
      message: "File message sent successfully",
      data: newMessage,
    });

  } catch (error) {
    next(error);
  }
};