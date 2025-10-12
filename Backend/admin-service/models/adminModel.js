const sqlite3 = require('sqlite3').verbose();
const path = require('path');


// Path to the shared SQLite database
const dbPath = path.join(__dirname, '../../shared-db/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Connection error with database', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });

  /**
 * Inserts a new event into the Event table.
 * @param {string} event_name - Name of the event
 * @param {string} event_date - Date of the event (format: YYYY-MM-DD)
 * @param {number} event_tickets - Total number of tickets available
 * @param {string} event_location - Location of the event
 * @returns {Promise<Object>} Resolves with the newly created event object:   
 * @throws {Error} Rejects if there is a database error
 */
    
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

/**
 * Inserts a new ticket for an event into the Ticket table.
 * @param {number} event_id - ID of the event this ticket belongs to
 * @param {boolean} ticket_availability - Availability of the ticket (true = available)
 * @param {number} ticket_price - Price of the ticket
 * @param {string} ticket_type - Type of ticket (e.g., VIP, Regular)
 * @returns {Promise<Object>} Resolves with the newly created ticket object:
 * @throws {Error} Rejects if there is a database error
 */

const createTicket = (event_id, ticket_availability, ticket_price, ticket_type) => 
{
    return new Promise((resolve, reject) => 
    {
        //for inserting into the tickets
        const ticketQuery = `INSERT INTO Ticket (event_id, ticket_availability, ticket_price, ticket_type) VALUES (?, ?, ?, ?)`;


        db.run(ticketQuery, [event_id, ticket_availability, ticket_price, ticket_type], function(err) 
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
   
    module.exports = {createEvent, createTicket, db};