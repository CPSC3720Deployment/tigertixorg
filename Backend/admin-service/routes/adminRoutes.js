const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/events', adminController.createEvent);
router.get('/events', adminController.getEvents);
module.exports = router;