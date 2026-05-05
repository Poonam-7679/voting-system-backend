
const express = require('express');
const router = express.Router();
const { castVote, getAllVotes, getResults } = require('../controllers/voteController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/cast', authMiddleware, castVote);
router.get('/results', getResults);
router.get('/all', authMiddleware, adminMiddleware, getAllVotes);

module.exports = router;