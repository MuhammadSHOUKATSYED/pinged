const prisma = require("../../prismaClient");

exports.getMessages = async (req, res) => {
  const userId = req.user.id;
  const otherUserId = parseInt(req.params.otherUserId);

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

exports.sendMessage = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId, content } = req.body;

  try {
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

exports.deleteMessage = async (req, res) => {
  const userId = req.user.id;
  const messageId = parseInt(req.params.messageId);

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) return res.status(404).json({ error: "Message not found" });
    if (message.senderId !== userId)
      return res.status(403).json({ error: "Unauthorized to delete message" });

    await prisma.message.delete({
      where: { id: messageId },
    });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
};

// GET /api/messages/chat-users/:userId
exports.getChattedUsers = async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  try {
    const sent = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
    });

    const received = await prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
    });

    const userIds = new Set([
      ...sent.map((m) => m.receiverId),
      ...received.map((m) => m.senderId),
    ]);

    const chatUsers = await prisma.user.findMany({
      where: {
        id: { in: Array.from(userIds) },
      },
      select: {
        id: true,
        name: true,
        bio: true,
        profileImage: true,
      },
    });

    res.json({ users: chatUsers });
  } catch (error) {
    console.error('Error fetching chat users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
