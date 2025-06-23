const express = require('express');
const router = express.Router();

const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require('./controller');

router.post('/follow', followUser);                    // POST /api/follow/follow
router.delete('/unfollow/:userId', unfollowUser);      // POST /api/follow/unfollow/:userId
router.get('/:userId/followers', getFollowers);        // GET /api/follow/:userId/followers
router.get('/:userId/following', getFollowing);        // GET /api/follow/:userId/following

module.exports = router;