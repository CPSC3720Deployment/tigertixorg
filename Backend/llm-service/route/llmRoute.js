/**
 * @file llmRoute.js
 * @description Defines API routes for the LLM microservice.
 * Handles AI-powered requests for parsing natural language booking commands
 * and confirming ticket bookings.
 */

const express = require('express');
const router = express.Router();
const llmController = require('../controller/llmController');

router.post('/parse', llmController.handleLLMRequest);
router.post('/confirm', llmController.confirmBooking);

module.exports = router;