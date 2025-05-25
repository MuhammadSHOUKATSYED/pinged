const prisma = require('../../prismaClient');

exports.createComment = async (req, res) => {
  const { postId, authorId, content } = req.body;

  if (!postId || !authorId || !content) {
    return res.status(400).json({ error: 'postId, authorId, and content are required' });
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        postId,
        authorId,
        content,
      },
    });
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const postComments = await prisma.comment.findMany({
      where: { postId: parseInt(postId) },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true, bio: true },
        },
        likes: true,
        replies: true,
      },
    });
    res.json(postComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required to update the comment' });
  }

  try {
    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};