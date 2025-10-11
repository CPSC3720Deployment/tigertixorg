const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('tixDB.sql', (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });