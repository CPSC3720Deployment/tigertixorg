const express = require('express');
const router = express.Router();
const llmController = require('../controllers/llmController');

router.post('/parse', llmController.parseBooking);
router.post('/confirm', llmController.confirmBooking);

module.exports = router;