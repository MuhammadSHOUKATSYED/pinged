const prisma = require('../../prismaClient');

// Create a Post
exports.createPost = async (req, res) => {
  const { content, imageUrl } = req.body;
  const authorId = req.user.id; // Use authenticated user

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        author: { connect: { id: authorId } },
      },
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      include: { 
        author: {
          select: { id: true, name: true, profileImage: true },
        },
        likes: true,
        comments: true,
        shares: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Get post by ID
exports.getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: true,
        likes: { include: { user: true } },
        comments: {
          include: {
            author: true,
            replies: {
              include: { author: true, likes: true },
            },
            likes: true,
          },
        },
        shares: true,
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // From auth middleware
  const { content, imageUrl } = req.body;

  if (!content && imageUrl === undefined) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.authorId !== userId) return res.status(403).json({ error: 'Not authorized' });

    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        ...(content && { content }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.post.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(404).json({ error: 'Post not found or already deleted' });
  }
};
