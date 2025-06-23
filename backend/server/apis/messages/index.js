const express = require("express");
const router = express.Router();

const {
  getMessages,
  sendMessage,
  deleteMessage,
  getChattedUsers
} = require("./controller");

// GET messages with another user
router.get("/:otherUserId", getMessages);

// POST send message
router.post("/", sendMessage);

// DELETE a specific message by ID
router.delete("/:messageId", deleteMessage);

// ✅ GET all users the logged-in user has chatted with
router.get("/chat-users/:userId", getChattedUsers);

module.exports = router;
