const clientModel = require('../models/clientModel');

/**
 * Fetches all events from the database.
 * Handles GET /api/events.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void} Responds with 200 and array of events on success, or 500 with error message on failure
 * @throws {Error} If the database query fails
 */

async function getEvents(req, res) {
    try {
        const events = await clientModel.getEvents();
        res.status(200).json(events);
    } catch (err) {
        console.error("Failed to get event: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

/**
 * Fetches a single event by ID.
 * Handles GET /api/events/:event_id.
 * @param {Object} req - Express request object
 * @param {number} req.params.event_id - ID of the event to fetch
 * @param {Object} res - Express response object
 * @returns {void} Responds with 200 and event object if found, 404 if not found, or 500 on error
 * @throws {Error} If the database query fails
 */

async function getAnEvent(req, res){
        try{
            const event_id = req.params.event_id;
            const event = await clientModel.getAnEvent(event_id);

            if(!event){
                return res.status(404).json({error: "Event not found"});
            }
            res.status(200).json(event)
        } catch(err){
            console.error("problem getting event:", err.message);
            res.status(500).json({error: "Server error"})
        }
    }

/**
 * Purchases a ticket for a specific event.
 * Handles POST /api/events/:id/purchase.
 * @param {Object} req - Express request object
 * @param {number} req.params.id - ID of the event to purchase a ticket for
 * @param {Object} res - Express response object
 * @returns {void} Responds with 200 and purchase result on success, or 500 on failure
 * @throws {Error} If the database update fails
 */

    async function purchaseTicket(req,res){
        try{
            const event_id = parseInt(req.params.id);
            console.log('Ticket is being purchased for event: ', event_id);
            
            const result = await clientModel.purchaseTicket(event_id);

            console.log('your transaction was successful:', result);

            res.status(200).json(result);

        } catch(err){
            console.error("failed to purchase ticket: ", err.message);
            res.status(500).json({error: "Server error"})
        }
    }

module.exports = {getEvents, getAnEvent, purchaseTicket};

