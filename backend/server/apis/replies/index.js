const express = require('express');
const router = express.Router();

const {
    createReply,
    getReplies,
    deleteReply,
    updateReply
  } = require('./controller');

router.post('/:commentId', createReply);    // POST /api/replies/:commentId
router.put('/:id', updateReply);   // PUT /api/replies/:id
router.get('/:commentId', getReplies);      // GET /api/replies/:commentId
router.delete('/:id', deleteReply);         // DELETE /api/replies/:id

module.exports = router;