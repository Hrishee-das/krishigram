import Message from "../models/messageModel.js";

const chatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join region room
    socket.on("joinRoom", (chatRoomId) => {
      if (!chatRoomId) return;

      socket.join(chatRoomId);
      console.log(`Socket ${socket.id} joined room ${chatRoomId}`);
    });

    // Handle sending message
    socket.on("sendMessage", async (data) => {
      try {
        const {
          chatRoomId,
          regionName,
          district,
          userId,
          userName,
          text,
        } = data;

        if (
          !chatRoomId ||
          !userId ||
          !text
        ) {
          return;
        }

        const newMessage = new Message({
          chatRoomId,
          user: userId,
          text,
        });

        const savedMessage = await newMessage.save();

        // Populate the user reference before emitting so frontend gets the name back
        await savedMessage.populate("user", "name _id");

        io.to(chatRoomId).emit("receiveMessage", savedMessage);
      } catch (error) {
        console.error("Socket message error:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export default chatSocket;