const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('tixDB.sql', (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });

    function createEvent(event_name, event_date, event_tickets, event_location){
     const query = 'INSERT INTO Event (event_name, event_date, event_tickets, event_location) VALUES (?, ?, ?, ?)';

     db.run(query, [event_name, event_date, event_tickets, event_location]);

    }

    module.exports = {createEvent};