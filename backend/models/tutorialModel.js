import mongoose from "mongoose";

const tutorialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tutorial must have a title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Tutorial must have a description"],
      trim: true,
    },
    videoUrl: {
      type: String,
      required: [true, "Tutorial must have a video"],
    },
    videoPublicId: {
      type: String,
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for getting latest tutorials
tutorialSchema.index({ createdAt: -1 });

export default mongoose.model("Tutorial", tutorialSchema);
