const express = require('express');
const router = express.Router();

const {
  createComment,
  getComments,
  updateComment,
  deleteComment
} = require('./controller');

router.post('/', createComment);                   // POST /api/comments
router.get('/post/:postId', getComments);          // GET /api/comments/post/:postId
router.put('/:id', updateComment);                 // PUT /api/comments/:id
router.delete('/:id', deleteComment);              // DELETE /api/comments/:id

module.exports = router;
