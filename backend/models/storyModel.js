// src/models/Story.model.js

import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    mediaPublicId: {
      type: String, // Cloudinary public_id for deletion
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "voice"],
      required: true,
    },
    caption: {
      type: String,
      maxlength: 200,
    },
    language: {
      type: String,
      enum: ["en", "hi", "mr", "pa", "te", "bn", "gu"],
      default: "en",
    },
    viewers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true },
);

// MongoDB TTL index — auto deletes after expiresAt
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Story", storySchema);
