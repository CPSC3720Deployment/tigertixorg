const express = require('express');
const router = express.Router();
const llmController = require('../controller/llmController');

router.post('/parse', llmController.parseBooking);
router.post('/confirm', llmController.confirmBooking);

module.exports = router;