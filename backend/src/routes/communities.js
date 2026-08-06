const express = require('express');
const router = express.Router();
const communityService = require('../services/communityService');
const { requireAuth } = require('../middleware/auth');

router.get('/:studentId/communities', requireAuth, async (req, res) => {
  try {
    const communities = await communityService.listCommunities(req.params.studentId);
    res.json(communities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:studentId/communities/mine', requireAuth, async (req, res) => {
  try {
    const communities = await communityService.getMyCommunities(req.params.studentId);
    res.json(communities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:studentId/communities/:communityId/join', requireAuth, async (req, res) => {
  try {
    const result = await communityService.joinCommunity(req.params.studentId, req.params.communityId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:studentId/communities/:communityId/leave', requireAuth, async (req, res) => {
  try {
    const result = await communityService.leaveCommunity(req.params.studentId, req.params.communityId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:studentId/communities/:communityId/feed', requireAuth, async (req, res) => {
  try {
    const feed = await communityService.getCommunityFeed(req.params.communityId, req.params.studentId);
    res.json(feed);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/:studentId/communities/:communityId/discussions', requireAuth, async (req, res) => {
  try {
    const { title, body } = req.body;
    const result = await communityService.createDiscussion(
      req.params.studentId, req.params.communityId, title, body
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:studentId/discussions/:discussionId/comments', requireAuth, async (req, res) => {
  try {
    const comments = await communityService.getComments(req.params.discussionId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:studentId/discussions/:discussionId/comments', requireAuth, async (req, res) => {
  try {
    const { body } = req.body;
    const result = await communityService.createComment(req.params.studentId, req.params.discussionId, body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:studentId/discussions/:discussionId/like', requireAuth, async (req, res) => {
  try {
    const result = await communityService.toggleLike(req.params.studentId, req.params.discussionId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
