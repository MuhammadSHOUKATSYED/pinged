const express = require('express');
const router = express.Router();

const {
  likePost,
  unlikePost,
  getPostLikes,
  
} = require('./controller');

// POST (Create Like)
router.post('/post/:postId', likePost);

// GET (Read Likes)
router.get('/post/:postId', getPostLikes);

// DELETE (Unlike)
router.delete('/post/:postId', unlikePost);

module.exports = router;