const express = require('express');
const router = express.Router();

const {
  likePost,
  unlikePost,
  getPostLikes,

  likeComment,
  unlikeComment,
  getCommentLikes,

  likeReply,
  unlikeReply,
  getReplyLikes,
} = require('./controller');

// POST (Create Like)
router.post('/post/:postId', likePost);
router.post('/comment/:commentId', likeComment);
router.post('/reply/:replyId', likeReply);

// GET (Read Likes)
router.get('/post/:postId', getPostLikes);
router.get('/comment/:commentId', getCommentLikes);
router.get('/reply/:replyId', getReplyLikes);

// DELETE (Unlike)
router.delete('/post/:postId', unlikePost);
router.delete('/comment/:commentId', unlikeComment);
router.delete('/reply/:replyId', unlikeReply);

module.exports = router;