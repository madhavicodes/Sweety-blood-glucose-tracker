const express = require('express');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/daily', (req, res) => {
  res.status(501).json({ message: 'Daily report scheduled for Day 2' });
});

router.get('/month-to-date', (req, res) => {
  res.status(501).json({ message: 'Month-to-date report scheduled for Day 2' });
});

router.get('/monthly', (req, res) => {
  res.status(501).json({ message: 'Monthly report scheduled for Day 2' });
});

module.exports = router;
