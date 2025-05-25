const express = require('express');
const router = express.Router();

const {
  sharePost,
  getUserShares,
  deleteShare
} = require('./controller');

router.post('/:postId', sharePost);        // POST /api/shares/:postId
router.get('/:userId', getUserShares);     // GET /api/shares/:userId
router.delete('/:id', deleteShare);         // DELETE /api/shares/:id

module.exports = router;