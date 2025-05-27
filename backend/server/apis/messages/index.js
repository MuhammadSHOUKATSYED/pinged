const express = require("express");
const router = express.Router();

const {

getMessages, 
sendMessage, 
deleteMessage 

} = require("./controller");

// GET messages with another user
router.get("/:otherUserId", getMessages);

// POST send message
router.post("/", sendMessage);

// DELETE a specific message by ID
router.delete("/:messageId", deleteMessage);

module.exports = router;