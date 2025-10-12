const adminModel = require('../models/adminModel');
/**
 * Controller function to create a new event.
 * Handles POST /api/admin/events endpoint.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing event details
 * @param {string} req.body.event_name - Name of the event
 * @param {string} req.body.event_date - Date of the event (format: YYYY-MM-DD)
 * @param {number} req.body.event_tickets - Total number of tickets available
 * @param {string} req.body.event_location - Location of the event
 * @param {Object} res - Express response object
 * @returns {Object} - Responds with the newly created event object (status 201) or error (status 500)
 */

async function createEvent(req, res){

    try{
        const {event_name, event_date, event_tickets, event_location } = req.body;

        //validation to make sure each field is inserted
        if(!event_name || !event_date || !event_tickets || !event_location)
        {
            return res.status(400).json({error: 'You have a missing field that is required'});

        }

        //correct types
        if(typeof event_name != 'string')
        {
            return res.status(400).json({error: 'event_name must be a string'});
        }

        if(typeof event_location != 'string')
        {
            return res.status(400).json({error: 'event_location must be a string'});
        }

        //empty string checks
        if(event_name.trim() === '')
        {
            return res.status(400).json({error: 'event_name cannot be empty'});
        }

        if(event_location.trim() === '')
        {
            return res.status(400).json({error: 'event_location cannot be empty'});
        }

        //tickets must be greater than 0
        if(event_tickets <= 0)
        {
            return res.status(400).json({error: "event_tickets must be greater than 0"});
        }

        //check the format of the date
        const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
        if(!dateFormat.test(event_date))
        {
            return res.status(400).json({error: "event_date must be in a YYYY-MM-DD format like 2025-12-31"});
        }

        //check for a valid date
        const parsedDate = new Date(event_date);
        if(isNaN(parsedDate.getTime()))
        {
            return res.status(400).json({error: "event_date is not a valid date"});
        }

        const newEvent = await adminModel.createEvent(event_name, event_date, event_tickets, event_location);    
        //const newTicket = await adminModel.createTicket(newEvent.event_id, true, ticket_price, ticket_type);
        res.status(201).json(newEvent);
    } catch (err) {
        console.error("Failed to create event: ", err.message);
        res.status(500).json({error: "Server error"})
    }
}

module.exports = {createEvent};