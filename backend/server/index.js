require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const prisma = require("./prismaClient"); // Your Prisma client instance

const app = express();
app.use(cors());
app.use(express.json());

// --- Middleware for Express routes ---
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user; // Attach user info
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// --- HTTP server & Socket.IO setup ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // TODO: restrict this in production
    methods: ["GET", "POST"],
  },
});

// --- In-memory online users map ---
const onlineUsers = new Map();

// --- Socket.IO authentication middleware ---
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch {
    next(new Error("Authentication error"));
  }
});

// --- Socket.IO event handling ---
io.on("connection", (socket) => {
  const userId = socket.user.id;
  onlineUsers.set(userId, socket.id);
  console.log(`User connected: ${userId}, socket: ${socket.id}`);

  socket.on("join", () => {
    socket.join(`user_${userId}`); // personal room for this user
  });

  socket.on("private_message", async ({ receiverId, content }) => {
    try {
      const savedMessage = await prisma.message.create({
        data: {
          senderId: userId,
          receiverId,
          content,
        },
      });

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("private_message", savedMessage);
      } else {
        // TODO: Push notification to offline user
        console.log(`User ${receiverId} offline - push notification needed`);
      }

      socket.emit("message_sent", savedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  socket.on("message_read", async ({ messageId }) => {
    try {
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { readAt: new Date() },
      });

      const senderSocketId = onlineUsers.get(updatedMessage.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("message_read", {
          messageId,
          readAt: updatedMessage.readAt,
        });
      }
    } catch (err) {
      console.error("Failed to update read status:", err);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    console.log(`User disconnected: ${userId}`);
  });
});

// --- REST API routes ---
// Public routes
app.use("/api/auth", require("./apis/auth"));

// Protected routes
const protectedRoutes = [
  "comments",
  "follow",
  "likes",
  "posts",
  "replies",
  "shares",
  "users",
  "messages",
];

protectedRoutes.forEach((route) => {
  app.use(`/api/${route}`, authenticate, require(`./apis/${route}`));
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});