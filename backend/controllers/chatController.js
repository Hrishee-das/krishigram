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
    const { chatRoomId, text } = req.body;

    if (!chatRoomId) {
      return res.status(400).json({
        success: false,
        message: "chatRoomId is required",
      });
    }

    const attachments = [];
    if (req.files) {
      const processFiles = (fileArray, type) => {
        if (fileArray) {
          fileArray.forEach((file) => {
            attachments.push({
              fileUrl: file.path || `/uploads/${file.filename}`,
              fileName: file.originalname,
              fileType: type,
            });
          });
        }
      };

      processFiles(req.files.image, "image");
      processFiles(req.files.audio, "audio");
      processFiles(req.files.file, "file");
    }

    if (!text && attachments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message text or attachments are required",
      });
    }

    let messageType = "text";
    if (attachments.length > 0) {
      if (text) {
        messageType = "mixed";
      } else if (attachments.length === 1) {
        messageType = attachments[0].fileType;
      } else {
        const types = new Set(attachments.map((a) => a.fileType));
        messageType = types.size === 1 ? [...types][0] : "mixed";
      }
    }

    const newMessage = await Message.create({
      chatRoomId,
      user: req.user._id,
      messageType,
      text,
      attachments,
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
   Note: This logic is now handled in `sendMessage`, but kept for backward compatibility if needed.
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
      attachments: [{
        fileUrl: req.file.path || `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        fileType: messageType
      }]
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