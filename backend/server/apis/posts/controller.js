const prisma = require('../../prismaClient');

// Create a Post
exports.createPost = async (req, res) => {
  const { content, imageUrl, authorId } = req.body;

  if (!content || !authorId) {
    return res.status(400).json({ error: 'content and authorId are required' });
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
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        likes: true,
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
  const { content, imageUrl } = req.body;

  if (!content && imageUrl === undefined) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  try {
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
    res.status(404).json({ error: 'Post not found or update failed' });
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
