import mongoose from "mongoose";

const aiChatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "New Disease Diagnosis Session",
    },
    // Optional: Keep track of whether this is an active, ongoing diagnosis
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

const AIChatSession = mongoose.model("AIChatSession", aiChatSessionSchema);

export default AIChatSession;
