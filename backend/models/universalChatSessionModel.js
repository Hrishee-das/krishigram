import mongoose from "mongoose";

const universalChatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A chat session must belong to a user"],
    },
    title: {
      type: String,
      default: "New Universal Conversation",
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

const UniversalChatSession = mongoose.model("UniversalChatSession", universalChatSessionSchema);

export default UniversalChatSession;
