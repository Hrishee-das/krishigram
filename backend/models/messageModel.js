import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatRoomId: { type: String, required: true },
    // regionName: { type: String, required: true },
    // district: { type: String, required: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    messageType: { type: String, enum: ["text", "image", "audio", "file"], default: "text" },

    text: { type: String },

    fileUrl: { type: String },
    fileName: { type: String },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;