require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const initSocket = require("./socketServer");

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
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

const server = http.createServer(app);
const io = initSocket(server);

// --- REST API routes ---
// Public routes
app.use("/api/auth", require("./apis/auth"));

// Protected routes
const protectedRoutes = [
  "comments",
  "follow",
  "likes",
  "posts",
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