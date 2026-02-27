import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Server } from "socket.io";

// Load environment variables
dotenv.config({ path: "./config.env" });

import app from "./app.js";
// import chatSocket from "./sockets/chatSockets.js";

// Database Connection
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log("DB connection successful!!");
});

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// Initialize socket logic
// chatSocket(io);

// Port
const PORT = process.env.PORT || 3000;

// Start server (single clean listener)
server.listen(PORT, () => {
  if (process.env.NODE_ENV === "production") {
    console.log(`🚀 Server running in PRODUCTION on port ${PORT}`);
  } else {
    console.log(
      `🚀 Server running in DEVELOPMENT at http://127.0.0.1:${PORT}/`,
    );
  }
});
