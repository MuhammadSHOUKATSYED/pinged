const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient'); // Make sure this path is correct
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // decoded.id
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user; // ✅ full user including role
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

function authorizeAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
}

module.exports = { authenticate, authorizeAdmin };
