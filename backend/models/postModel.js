import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Text comment
    text: {
      type: String,
      default: null,
      trim: true,
    },

    // Audio comment
    audio: {
      type: String, // Cloudinary URL
      default: null,
    },

    audioPublicId: {
      type: String,
      default: null,
    },

    commentType: {
      type: String,
      enum: ["text", "audio"],
      required: true,
    },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    postType: {
      type: String,
      enum: ["post", "successStory"],
      required: true,
    },

    title: {
      type: String,
      required: [true, "Post must have a title"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Post must have a description"],
      trim: true,
    },

    location: {
      type: String,
      trim: true,
      default: null,
    },

    // Image / Video / Audio
    media: {
      type: String,
      default: null,
      required: function () {
        return this.postType === "successStory";
      },
    },

    mediaPublicId: {
      type: String,
      default: null,
    },

    mediaType: {
      type: String,
      enum: ["image", "video", "audio"],
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [commentSchema],
  },
  { timestamps: true }
);

// Index for faster feed sorting
postSchema.index({ createdAt: -1 });

export default mongoose.model("Post", postSchema);