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
    db.all("SELECT * FROM Event", [], (err, rows) => {
            if (err) {
                console.error(err.message);
                return;
            }
            rows.forEach((row) => {
                console.log(row.name); 
            });
        });

};

 module.exports = { getEvents };