import mongoose from "mongoose";

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
    },

    media: {
      type: String,
      required: function () {
        return this.postType === "successStory";
      },
    },

    mediaPublicId: String,

    mediaType: {
      type: String,
      enum: ["image", "video", null],
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

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Index for feed sorting
postSchema.index({ createdAt: -1 });

export default mongoose.model("Post", postSchema);