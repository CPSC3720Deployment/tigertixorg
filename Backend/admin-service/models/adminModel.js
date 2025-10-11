const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../shared-db/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Connection error with database', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });

const createEvent = (event_name, event_date, event_tickets, event_location) => 
{
    return new Promise((resolve, reject) => 
    {
        //for inserting into the event
        const eventQuery = ` INSERT INTO Event (event_name, event_date, event_tickets, event_location) VALUES (?, ?, ?, ?)`;

        db.run(eventQuery, [event_name, event_date, event_tickets, event_location], function(err) 
        {
            //error handling
            if (err) 
            {   
                reject(err);
                return;
            }
            //for getting the new id of the current event
            // const event_id = this.lastID; 
        resolve(
        {
            event_id: this.lastID,
            event_name: event_name,
            event_date: event_date,
            event_tickets: event_tickets,
            event_location: event_location
            });                  
        });
    });       
};


const createTicket = (event_id, ticket_availability, ticket_price, ticket_type) => 
{
    return new Promise((resolve, reject) => 
    {
        //for inserting into the tickets
        const ticketQuery = `INSERT INTO Ticket (event_id, ticket_availability, ticket_price, ticket_type) VALUES (?, ?, ?, ?)`;


        db.run(tickettQuery, [event_id, ticket_availability, ticket_price, ticket_price], function(err) 
        {
            //error handling
            if (err) 
            {   
                reject(err);
                return;
            }
            //for getting the new id of the current event
            // const event_id = this.lastID; 
        resolve(
        {
            ticket_id: this.lastID,
            event_id: event_id,
            ticket_price: ticket_price,
            ticket_type: ticket_type,
            ticket_availability: ticket_availability
            });                  
        });
    });       
};

       
    module.exports = {createEvent, createTicket};