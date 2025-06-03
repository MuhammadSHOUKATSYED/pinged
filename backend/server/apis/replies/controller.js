const prisma = require('../../prismaClient');

// Create a reply
exports.createReply = async (req, res) => {
  const { commentId } = req.params;
  const { authorId, content } = req.body;

  if (!authorId || !content) {
    return res.status(400).json({ error: 'authorId and content are required' });
  }

  try {
    const newReply = await prisma.reply.create({
      data: {
        content,
        author: { connect: { id: parseInt(authorId) } },
        comment: { connect: { id: parseInt(commentId) } },
      },
    });
    res.status(201).json(newReply);
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all replies for a specific comment
exports.getReplies = async (req, res) => {
  const { commentId } = req.params;

  try {
    const replies = await prisma.reply.findMany({
      where: { commentId: parseInt(commentId) },
      include: {
        author: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(replies);
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a reply
exports.updateReply = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required to update the reply' });
  }

  try {
    const updatedReply = await prisma.reply.update({
      where: { id: parseInt(id) },
      data: { content },
    });
    res.json(updatedReply);
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(404).json({ error: 'Reply not found' });
  }
};

// Delete a reply
exports.deleteReply = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.reply.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(404).json({ error: 'Reply not found or already deleted' });
  }
};