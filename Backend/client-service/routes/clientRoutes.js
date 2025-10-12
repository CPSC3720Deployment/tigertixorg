/**
 * @file clientRoutes.js
 * @description Defines API routes for the Client microservice.
 * Handles requests related to fetching events and purchasing tickets.
 */

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.get('/events', clientController.getEvents);
//router.get('/events', clientController.getAnEvent)
router.post('/events/:id/purchase', clientController.purchaseTicket);
module.exports = router;