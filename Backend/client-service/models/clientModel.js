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

 const getEvents = () => {
     return new Promise((resolve, reject) =>{
        db.all("SELECT * FROM Event", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

};

const getAnEvent = (event_id) => { 
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM Event WHERE event_id = ?", [event_id], (err, row) => {
            if(err) reject(err);
            else resolve(row);
        });  
    });
}

const purchaseTicket = (event_id) => {
    return new Promise((resolve, reject) => {
        db.run("UPDATE Event SET event_tickets = event_tickets-1 WHERE event_id = ?", [event_id], function(err)
        {
            //error handling
            if (err) 
            {   
                reject(err);
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