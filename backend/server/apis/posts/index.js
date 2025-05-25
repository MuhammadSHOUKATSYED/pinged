const express = require('express');
const router = express.Router();

const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,       
  deletePost,
} = require('./controller');

router.post('/', createPost);           // POST /api/posts
router.get('/', getAllPosts);           // GET /api/posts
router.get('/:id', getPostById);        // GET /api/posts/:id
router.put('/:id', updatePost);         // PUT /api/posts/:id
router.delete('/:id', deletePost);      // DELETE /api/posts/:id

module.exports = router;