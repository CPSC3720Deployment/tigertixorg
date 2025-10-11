const clientModel = require('../models/clientModel');

async function getEvents(req, res) {

    try {
        const events = await clientModel.getEvents();
        req.staus(201).json(events);
    } catch (err) {
        console.error("Failed to get event: ", err.message);
        res.status(500).json({ error: err.message });
    }


}

async function getAnEvent(req, res){
        try{
            const event_id = req.params.event_id;
            const event = await clientModel.getAnEvent(event_id);

            if(!event){
                return res.staus(404).json({error: "Event not found"});
            }
            res.status(200).json(event)
        } catch(err){
            console.error("problem getting event:", err.message);
            res.status(500).json({error: "Server error"})
        }
    }

    async function purchaseTicket(req,res){
        try{
            const event_tickets = req.params.event_id;
            res.status(200).json(event_tickets);
        } catch(err){
            console.error("failed to purchase ticket: ", err.message);
            res.status(500).json({error: "Server error"})
        }
    }

module.exports = {getEvents, getAnEvent, purchaseTicket};

