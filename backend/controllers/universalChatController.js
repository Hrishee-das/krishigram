import UniversalChatSession from "../models/universalChatSessionModel.js";
import UniversalChatMessage from "../models/universalChatMessageModel.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import FormData from "form-data";
import streamifier from "streamifier";

// Helper to upload buffer to Cloudinary via stream
const uploadToCloudinary = (buffer, resourceType) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const analyzeUniversalQuery = async (req, res, next) => {
  try {
    const { text, sessionId, language } = req.body;
    let currentSessionId = sessionId;

    // 1. If no session ID passed, create a new session
    if (!currentSessionId) {
      if (!req.user) {
        return res.status(401).json({ status: "error", message: "User not authenticated. Please log in again." });
      }
      const newSession = await UniversalChatSession.create({
        user: req.user._id,
      });
      currentSessionId = newSession._id;
    }

    // 2. Upload media to Cloudinary if exists
    let imageUrl = null;
    let audioUrl = null;

    if (req.files && req.files.image) {
      const result = await uploadToCloudinary(req.files.image[0].buffer, "image");
      imageUrl = result.secure_url;
    }

    if (req.files && req.files.voice) {
      const result = await uploadToCloudinary(req.files.voice[0].buffer, "video"); // Cloudinary treats audio as video resource type
      audioUrl = result.secure_url;
    }

    // 3. Prepare FormData to send to Python Backend
    const formData = new FormData();
    if (text) formData.append("text", text);
    if (language) formData.append("language", language);
    
    // Send files to python backend directly using buffers so Python can process it
    if (req.files && req.files.image) {
      formData.append("image", req.files.image[0].buffer, {
        filename: req.files.image[0].originalname,
        contentType: req.files.image[0].mimetype,
      });
    }

    if (req.files && req.files.voice) {
      formData.append("voice", req.files.voice[0].buffer, {
        filename: req.files.voice[0].originalname,
        contentType: req.files.voice[0].mimetype,
      });
    }

    // 4. Forward to Python Backend (Universal Chat port 8001 assumed, or from Env)
    const pythonUrl = `${process.env.UNIVERSAL_AI_URL || "http://localhost:8001"}/api/universal_chat`;
    
    let pythonResponseData = {};
    
    try {
        const pythonResponse = await axios.post(pythonUrl, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });
        pythonResponseData = pythonResponse.data;
    } catch(err) {
        if (err.response && err.response.data) {
           const pythonError = err.response.data;
           const normalizedMessage = pythonError.message || pythonError.error || "Universal AI Validation failed";
           return res.status(err.response.status).json({
              status: "error",
              message: normalizedMessage,
              ...pythonError
           });
        }
        console.error("Error from Universal Python API:", err.message);
        return res.status(500).json({ status: "error", message: "Universal AI Backend failed to respond." });
    }

    // 5. Save the history to MongoDB (using Universal collections)
    if (!req.user) {
        return res.status(401).json({ status: "error", message: "User session lost. Please log in again." });
    }
    const chatMessage = await UniversalChatMessage.create({
      session: currentSessionId,
      user: req.user._id,
      queryText: text || "",
      mediaUrls: {
        image: imageUrl,
        audio: audioUrl,
      },
      language: language || "en",
      aiResponse: pythonResponseData.response?.response || "",
      diseaseDetected: pythonResponseData.query || null, // Storing what the user searched
      ttsFriendly: pythonResponseData.tts_friendly || "",
    });

    // 6. Return response to frontend
    res.status(200).json({
      status: "success",
      session: currentSessionId,
      data: {
        message: chatMessage,
        pythonRaw: pythonResponseData // This contains the audio_base64 string
      },
    });
  } catch (error) {
    console.error("Error in analyzeUniversalQuery:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getUniversalChatSessions = async (req, res, next) => {
  try {
    const sessions = await UniversalChatSession.find({ user: req.user._id })
        .sort("-updatedAt");

    res.status(200).json({
      status: "success",
      results: sessions.length,
      data: {
        sessions,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getUniversalChatHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
        return res.status(400).json({ status: "fail", message: "Please provide a sessionId" });
    }

    const messages = await UniversalChatMessage.find({ 
        session: sessionId,
        user: req.user._id 
    }).sort("createdAt"); // Oldest to newest

    res.status(200).json({
      status: "success",
      results: messages.length,
      data: {
        messages,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
