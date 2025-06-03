const prisma = require('../../prismaClient');

// --- Like a Post ---
exports.likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: userId missing' });
  }

  try {
    const existing = await prisma.like.findFirst({
      where: {
        userId: userId,
        postId: parseInt(postId),
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Post already liked' });
    }

    await prisma.like.create({
      data: {
        userId: userId,
        postId: parseInt(postId),
      },
    });

    res.status(201).json({ message: 'Post liked' });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Unlike a Post ---
exports.unlikePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: userId missing' });
  }

  try {
    await prisma.like.deleteMany({
      where: {
        userId: userId,
        postId: parseInt(postId),
      },
    });

    // Send JSON instead of 204 no content
    res.status(200).json({ success: true, message: 'Post unliked' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// --- Get Likes for a Post ---
exports.getPostLikes = async (req, res) => {
  const { postId } = req.params;

  try {
    const likes = await prisma.like.findMany({
      where: { postId: parseInt(postId) },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({
      count: likes.length,
      users: likes.map((like) => like.user),
    });
  } catch (error) {
    console.error('Error getting post likes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
