const prisma = require('../../prismaClient');

exports.followUser = async (req, res) => {
  const { followerId, followingId } = req.body;

  if (!followerId || !followingId) {
    return res.status(400).json({ error: 'Both followerId and followingId are required' });
  }

  if (followerId === followingId) {
    return res.status(400).json({ error: 'You cannot follow yourself' });
  }

  try {
    // Check if follow relationship already exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: parseInt(followerId),
          followingId: parseInt(followingId),
        },
      },
    });

    if (existingFollow) {
      return res.status(409).json({ error: 'Already following this user' });
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId: parseInt(followerId),
        followingId: parseInt(followingId),
      },
    });

    res.status(201).json({ message: 'Followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.unfollowUser = async (req, res) => {
  const { followerId, followingId } = req.body;

  if (!followerId || !followingId) {
    return res.status(400).json({ error: 'Both followerId and followingId are required' });
  }

  try {
    // Check if follow relationship exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: parseInt(followerId),
          followingId: parseInt(followingId),
        },
      },
    });

    if (!existingFollow) {
      return res.status(404).json({ error: 'Follow relationship not found' });
    }

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: parseInt(followerId),
          followingId: parseInt(followingId),
        },
      },
    });

    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getFollowers = async (req, res) => {
  const { userId } = req.params;

  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: parseInt(userId) },
      include: {
        follower: {
          select: { id: true, name: true, email: true, bio: true },
        },
      },
    });

    // Return only follower user data
    res.json({ followers: followers.map(f => f.follower) });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getFollowing = async (req, res) => {
  const { userId } = req.params;

  try {
    const following = await prisma.follow.findMany({
      where: { followerId: parseInt(userId) },
      include: {
        following: {
          select: { id: true, name: true, email: true, bio: true },
        },
      },
    });

    // Return only following user data
    res.json({ following: following.map(f => f.following) });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};