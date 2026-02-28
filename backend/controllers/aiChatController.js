import AIChatSession from "../models/aiChatSessionModel.js";
import AIChatMessage from "../models/aiChatMessageModel.js";
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
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const analyzeQuery = async (req, res, next) => {
  try {
    const { text, sessionId, language } = req.body;
    let currentSessionId = sessionId;

    // 1. If no session ID passed, create a new session
    if (!currentSessionId) {
      const newSession = await AIChatSession.create({
        user: req.user._id,
      });
      currentSessionId = newSession._id;
    }

    // 2. Upload media to Cloudinary if exists
    let imageUrl = null;
    let audioUrl = null;

    if (req.files && req.files.image) {
      const result = await uploadToCloudinary(
        req.files.image[0].buffer,
        "image",
      );
      imageUrl = result.secure_url;
    }

    if (req.files && req.files.voice) {
      const result = await uploadToCloudinary(
        req.files.voice[0].buffer,
        "video",
      ); // Cloudinary treats audio as video resource type
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

    // 4. Forward to Python Backend
    const pythonUrl = `${process.env.PYTHON_AI_URL}/api/analyze`;

    let pythonResponseData = {};

    try {
      const pythonResponse = await axios.post(pythonUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
      pythonResponseData = pythonResponse.data;
    } catch (err) {
      console.error("Error from Python API:", err.message);
      return res
        .status(500)
        .json({ status: "error", message: "AI Backend failed to respond." });
    }

    // 5. Save the history to MongoDB
    const chatMessage = await AIChatMessage.create({
      session: currentSessionId,
      user: req.user._id,
      queryText: text || "",
      mediaUrls: {
        image: imageUrl,
        audio: audioUrl,
      },
      language: language || "en",
      aiResponse:
        pythonResponseData.report?.response ||
        (pythonResponseData.report?.what_is_this_disease 
          ? `${pythonResponseData.report.what_is_this_disease}\n\nSymptoms: ${pythonResponseData.report.symptoms}`
          : "") ||
        "",
      diseaseDetected: pythonResponseData.report?.disease_name || null,
      confidence: pythonResponseData.confidence || null,
      ttsFriendly: pythonResponseData.tts_friendly || "",
    });

    // 6. Return response to frontend
    res.status(200).json({
      status: "success",
      session: currentSessionId,
      data: {
        message: chatMessage,
        pythonRaw: pythonResponseData,
      },
    });
  } catch (error) {
    console.error("Error in analyzeQuery:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getChatSessions = async (req, res, next) => {
  try {
    const sessions = await AIChatSession.find({ user: req.user._id }).sort(
      "-updatedAt",
    );

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

export const getChatHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res
        .status(400)
        .json({ status: "fail", message: "Please provide a sessionId" });
    }

    const messages = await AIChatMessage.find({
      session: sessionId,
      user: req.user._id,
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

export const getLibraryData = async (req, res, next) => {
  try {
    const { language } = req.query;
    const pythonUrl = `${process.env.PYTHON_AI_URL}/api/library`;
    console.log(`[DEBUG] Fetching library data from: ${pythonUrl}?language=${language || "English"}`);

    const response = await axios.get(pythonUrl, {
      params: { language: language || "English" },
      timeout: 30000 // 30s timeout
    });

    console.log(`[DEBUG] Python library response received. Items: ${response.data.length}`);

    res.status(200).json({
      status: "success",
      data: response.data
    });
  } catch (error) {
    console.error("Error in getLibraryData:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getRecentDetections = async (req, res, next) => {
  try {
    console.log(`[DEBUG] Fetching recent detections for user: ${req.user._id}`);
    const detections = await AIChatMessage.find({
      user: req.user._id,
      diseaseDetected: { $ne: null }
    })
    .sort({ createdAt: -1 })
    .limit(10);
    
    console.log(`[DEBUG] Found ${detections.length} detections.`);

    res.status(200).json({
      status: "success",
      data: detections
    });
  } catch (error) {
    console.error("[ERROR] getRecentDetections:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
};
