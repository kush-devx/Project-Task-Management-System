require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const messageRoutes = require("./routes/messageRoutes");
const authRoutes = require("./routes/authRoutes");

const Message = require("./models/Message");

const app = express();

/* ================= DATABASE CONNECTION ================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

/* ================= MIDDLEWARE ================= */

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/messages", messageRoutes);

/* ================= TEST ROUTE ================= */

app.get("/", (req, res) => {
  res.send("🚀 API Running Successfully");
});

/* ================= SOCKET SETUP ================= */

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://ai-powered-project-management-system.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
    console.log(`📂 Joined project: ${projectId}`);
  });

  socket.on("sendMessage", async ({ projectId, message }) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        console.log("No token provided");
        return;
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const savedMessage = await Message.create({
        project: projectId,
        sender: decoded.id,
        content: message,
      });

      const populatedMessage = await savedMessage.populate(
        "sender",
        "name"
      );

      io.to(projectId).emit("receiveMessage", populatedMessage);
    } catch (error) {
      console.error("❌ Message save failed:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

/* ================= GLOBAL ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
});

/* ================= SERVER START ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});