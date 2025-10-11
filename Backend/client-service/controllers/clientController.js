const clientModel = require('../models/clientModel');

async function getEvents(req, res) {

    try {
        const events = await clientModel.getEvents();
        res.status(200).json(events);
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
                return res.status(404).json({error: "Event not found"});
            }
            res.status(200).json(event)
        } catch(err){
            console.error("problem getting event:", err.message);
            res.status(500).json({error: "Server error"})
        }
    }

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

