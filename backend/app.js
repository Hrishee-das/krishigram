import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

// import postRouter from "./routes/postRoutes.js";

import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/errorController.js";
import userRouter from "./routes/userRoutes.js";

// import aiChatRoutes from "./routes/aiChatRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";

const app = express();
app.set("trust proxy", 1);

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Logging (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [""];

    const isLocalNetwork =
      /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))/.test(origin);

    if (!origin || whitelist.indexOf(origin) !== -1 || isLocalNetwork) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
};

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.options(/.*/, cors(corsOptions));

// Body parser
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1", userRouter);
app.use("/api/v1/chat", chatRoutes);
// app.use("/api/v1/posts", postRouter);
// app.use("/api/v1/aichat", aiChatRoutes);
app.use("/api/v1/stories", storyRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("Community Chat Backend Running");
});

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error Handlers
app.use(errorHandler); // chat error middleware
app.use(globalErrorHandler);

export default app;
