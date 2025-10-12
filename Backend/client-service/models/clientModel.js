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

/**
 * Retrieves all events from the database.
 * @function
 * @returns {Promise<Array<Object>>} Resolves with an array of event objects
 * @throws {Error} If the database query fails
 */

 const getEvents = () => {
     return new Promise((resolve, reject) =>{
        db.all("SELECT * FROM Event", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

};

/**
 * Retrieves a single event by its ID.
 * @param {number} event_id - ID of the event to fetch
 * @returns {Promise<Object>} Resolves with the event object if found, otherwise null
 * @throws {Error} If the database query fails
 */

const getAnEvent = (event_id) => { 
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM Event WHERE event_id = ?", [event_id], (err, row) => {
            if(err) reject(err);
            else resolve(row);
        });  
    });
}

/**
 * Purchases a ticket for a specific event by decrementing the available ticket count.
 * @param {number} event_id - ID of the event for which to purchase a ticket
 * @returns {Promise<Object>} Resolves with a success message and event ID
 * @throws {Error} If no tickets are available or the database update fails
 */

const purchaseTicket = (event_id) => {
    return new Promise((resolve, reject) => {
        db.run("UPDATE Event SET event_tickets = event_tickets-1 WHERE event_id = ? AND event_tickets > 0", [event_id], function(err)
        {
            //error handling
            if (err) 
            {   
                reject(err);
                return;
            }

            if(this.changes == 0)
            {
                reject(new Error("No more tickets are available"));
                return;
            }

            resolve(
            {
                message: 'Successfully purchased ticket',
                event_id: event_id
            });                  
        });
    });
}

 module.exports = { getEvents, getAnEvent, purchaseTicket};