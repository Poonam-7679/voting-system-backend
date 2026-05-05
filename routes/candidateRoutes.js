
const express = require('express');
const router = express.Router();
const {
  addCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate
} = require('../controllers/candidateController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', getAllCandidates);
router.get('/:id', getCandidateById);
router.post('/', authMiddleware, adminMiddleware, addCandidate);
router.put('/:id', authMiddleware, adminMiddleware, updateCandidate);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCandidate);

module.exports = router;