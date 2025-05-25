const prisma = require('../../prismaClient');

// Create a new share
exports.sharePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  if (!postId || !userId) {
    return res.status(400).json({ error: 'postId (param) and userId (body) are required' });
  }

  try {
    const existing = await prisma.share.findFirst({
      where: {
        postId: parseInt(postId),
        userId: parseInt(userId),
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'User already shared this post' });
    }

    const newShare = await prisma.share.create({
      data: {
        post: { connect: { id: parseInt(postId) } },
        user: { connect: { id: parseInt(userId) } },
      },
    });

    res.status(201).json(newShare);
  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all shares for a user
exports.getUserShares = async (req, res) => {
  const { userId } = req.params;

  try {
    const shares = await prisma.share.findMany({
      where: { userId: parseInt(userId) },
      include: {
        post: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(shares);
  } catch (error) {
    console.error('Error fetching user shares:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Delete a share
exports.deleteShare = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.share.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting share:', error);
    res.status(404).json({ error: 'Share not found' });
  }
};