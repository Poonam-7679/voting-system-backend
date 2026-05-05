const Vote = require('../models/Vote');
const User = require('../models/User');
const Candidate = require('../models/Candidate');

// Cast a vote
exports.castVote = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const userId = req.user.userId;
    
    // Check if user already voted
    const user = await User.findById(userId);
    if (user.hasVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }
    
    // Check if candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    // Create vote record
    const vote = new Vote({
      user: userId,
      candidate: candidateId
    });
    
    // Update candidate vote count
    candidate.votes += 1;
    
    // Update user hasVoted status
    user.hasVoted = true;
    
    await Promise.all([vote.save(), candidate.save(), user.save()]);
    
    res.status(201).json({ message: 'Vote cast successfully', vote });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already voted' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get all votes (admin only)
exports.getAllVotes = async (req, res) => {
  try {
    const votes = await Vote.find()
      .populate('user', 'name email')
      .populate('candidate', 'name party');
    res.json(votes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vote results
exports.getResults = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort('-votes');
    const totalVotes = await Vote.countDocuments();
    
    const results = candidates.map(candidate => ({
      _id: candidate._id,
      name: candidate.name,
      party: candidate.party,
      symbol: candidate.symbol,
      votes: candidate.votes,
      percentage: totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(2) : 0
    }));
    
    res.json({
      totalVotes,
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};