const prisma = require('../../prismaClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the .env file');
}

// ---------------------------
// Admin-only: Create User
// ---------------------------
exports.createUser = async (req, res) => {
  const { name, email, password, bio, role, profileImage } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        bio,
        role: role || 'user',
        profileImage,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage },
      token,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---------------------------
// Get User Profile by ID
// ---------------------------
exports.getUserProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        posts: true,
        comments: true,
        replies: true,
        shares: true,
        followers: true,
        following: true,
        likes: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---------------------------
// Update User Profile by ID
// ---------------------------
exports.updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const { name, email, bio, password, profileImage } = req.body;

  if (!name && !email && !bio && !password && !profileImage) {
    return res.status(400).json({ error: 'At least one field is required to update' });
  }

  try {
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== parseInt(id)) {
        return res.status(409).json({ error: 'Email already in use by another user' });
      }
    }

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(bio && { bio }),
        ...(profileImage && { profileImage }),
        ...(hashedPassword && { password: hashedPassword }),
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(404).json({ error: 'User not found or update failed' });
  }
};

// ---------------------------
// Admin-only: Get All Users
// ---------------------------
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        profileImage: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---------------------------
// Delete User by ID
// ---------------------------
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(404).json({ error: 'User not found' });
  }
};
