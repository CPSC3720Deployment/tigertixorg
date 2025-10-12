/**
 * @file adminRoutes.js
 * @description Defines API routes for the Admin microservice.
 * Handles requests related to event creation and management.
 * @returns {void} Sends HTTP response with status 201 and new event object on success,
 * or 500 with error message on failure.
 */ 

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/events', adminController.createEvent);

module.exports = router;