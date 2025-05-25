const prisma = require('../../prismaClient');

// --- Post Likes ---

exports.likePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    // Check if already liked
    const existing = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: parseInt(postId),
          userId: parseInt(userId),
        },
      },
    });
    if (existing) {
      return res.status(409).json({ error: 'Post already liked by this user' });
    }

    // Create like
    await prisma.postLike.create({
      data: {
        postId: parseInt(postId),
        userId: parseInt(userId),
      },
    });

    res.status(201).json({ message: 'Post liked' });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.unlikePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    await prisma.postLike.delete({
      where: {
        postId_userId: {
          postId: parseInt(postId),
          userId: parseInt(userId),
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') { // Record not found
      return res.status(404).json({ error: 'Like not found for this user' });
    }
    console.error('Error unliking post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPostLikes = async (req, res) => {
  const { postId } = req.params;

  try {
    const likes = await prisma.postLike.findMany({
      where: { postId: parseInt(postId) },
      include: {
        user: {
          select: { id: true, name: true, email: true }, // adjust as needed
        },
      },
    });

    res.json({
      count: likes.length,
      users: likes.map(like => like.user),
    });
  } catch (error) {
    console.error('Error getting post likes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Comment Likes ---

exports.likeComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    const existing = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: parseInt(commentId),
          userId: parseInt(userId),
        },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Comment already liked by this user' });
    }

    await prisma.commentLike.create({
      data: {
        commentId: parseInt(commentId),
        userId: parseInt(userId),
      },
    });

    res.status(201).json({ message: 'Comment liked' });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.unlikeComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    await prisma.commentLike.delete({
      where: {
        commentId_userId: {
          commentId: parseInt(commentId),
          userId: parseInt(userId),
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Like not found for this user' });
    }
    console.error('Error unliking comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCommentLikes = async (req, res) => {
  const { commentId } = req.params;

  try {
    const likes = await prisma.commentLike.findMany({
      where: { commentId: parseInt(commentId) },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({
      count: likes.length,
      users: likes.map(like => like.user),
    });
  } catch (error) {
    console.error('Error getting comment likes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Reply Likes ---

exports.likeReply = async (req, res) => {
  const { replyId } = req.params;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    const existing = await prisma.replyLike.findUnique({
      where: {
        replyId_userId: {
          replyId: parseInt(replyId),
          userId: parseInt(userId),
        },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Reply already liked by this user' });
    }

    await prisma.replyLike.create({
      data: {
        replyId: parseInt(replyId),
        userId: parseInt(userId),
      },
    });

    res.status(201).json({ message: 'Reply liked' });
  } catch (error) {
    console.error('Error liking reply:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.unlikeReply = async (req, res) => {
  const { replyId } = req.params;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    await prisma.replyLike.delete({
      where: {
        replyId_userId: {
          replyId: parseInt(replyId),
          userId: parseInt(userId),
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Like not found for this user' });
    }
    console.error('Error unliking reply:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getReplyLikes = async (req, res) => {
  const { replyId } = req.params;

  try {
    const likes = await prisma.replyLike.findMany({
      where: { replyId: parseInt(replyId) },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({
      count: likes.length,
      users: likes.map(like => like.user),
    });
  } catch (error) {
    console.error('Error getting reply likes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};