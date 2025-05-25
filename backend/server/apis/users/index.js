const express = require('express');
const router = express.Router();
const {authorizeAdmin} = require("../../middleware/middleware");

const {
  createUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers, // Add this
} = require('./controller');

// New route to get all users
router.get('/', authorizeAdmin, getAllUsers);            // GET /api/users
router.post('/', authorizeAdmin, createUser);            // POST /api/users
router.get('/:id', getUserProfile);      // GET /api/users/:id
router.put('/:id', updateUserProfile);   // PUT /api/users/:id
router.delete('/:id', deleteUser);       // DELETE /api/users/:id

module.exports = router;