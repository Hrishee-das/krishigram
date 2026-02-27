import mongoose from "mongoose";

const aiChatMessageSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIChatSession",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    queryText: { type: String, default: "" },
    mediaUrls: {
      image: { type: String, default: null }, // from Cloudinary
      audio: { type: String, default: null }, // from Cloudinary
    },
    language: { type: String, default: "en" },
    
    // The response details from the Python API
    aiResponse: { type: String, default: "" }, // Markdown or text
    diseaseDetected: { type: String, default: null },
    confidence: { type: Number, default: null },
    ttsFriendly: { type: String, default: "" }, // Simplified text for Text-to-Speech
    
  },
  { timestamps: true }
);

const AIChatMessage = mongoose.model("AIChatMessage", aiChatMessageSchema);

export default AIChatMessage;
