const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Get event details by name
function getEventByName(eventName) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM events WHERE event_name = ?',
            [eventName],
            (err, row) => {
                if (err) return reject(err);
                resolve(row); // null if not found
            }
        );
    });
}

// Book tickets safely using a transaction
function bookTicketsTransaction(eventName, tickets) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            db.get(
                'SELECT tickets_available FROM events WHERE event_name = ?',
                [eventName],
                (err, row) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }

                    if (!row) {
                        db.run('ROLLBACK');
                        return resolve({ success: false, message: `Event "${eventName}" not found` });
                    }

                    if (row.tickets_available < tickets) {
                        db.run('ROLLBACK');
                        return resolve({ success: false, message: `Not enough tickets available` });
                    }

                    const newTickets = row.tickets_available - tickets;

                    db.run(
                        'UPDATE events SET tickets_available = ? WHERE event_name = ?',
                        [newTickets, eventName],
                        function(err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return reject(err);
                            }

                            db.run('COMMIT');
                            resolve({ 
                                success: true, 
                                booking: { event: eventName, tickets } 
                            });
                        }
                    );
                }
            );
        });
    });
}

module.exports = { getEventByName, bookTicketsTransaction };

// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');

// // Path to shared SQLite database
// const dbPath = path.join(__dirname, '../../shared-db/database.sqlite');
// const db = new sqlite3.Database(dbPath, (err) => {
//     if (err) {
//         console.error('Connection error with database', err.message);
//     } else {
//         console.log('Connected to SQLite database (LLM Model).');
//     }
// });

// /**
//  * Finds an event by name.
//  * @param {string} event_name - The event name to search for
//  * @returns {Promise<Object>} - Resolves with event row or null if not found
//  */
// function getEventByName(event_name) {
//     return new Promise((resolve, reject) => {
//         const sql = `SELECT * FROM Event WHERE event_name = ?`;
//         db.get(sql, [event_name], (err, row) => {
//             if (err) {
//                 reject(err);
//                 return;
//             }
//             resolve(row || null);
//         });
//     });
// }

// /**
//  * Decrements available tickets for an event.
//  * @param {number} event_id - The ID of the event
//  * @param {number} tickets - The number of tickets to subtract
//  * @returns {Promise<void>} - Resolves when update is done
//  */
// function decrementTickets(event_id, tickets) {
//     return new Promise((resolve, reject) => {
//         const sql = `
//             UPDATE Event 
//             SET event_tickets = event_tickets - ? 
//             WHERE event_id = ? AND event_tickets >= ?;
//         `;
//         db.run(sql, [tickets, event_id, tickets], function (err) {
//             if (err) {
//                 reject(err);
//                 return;
//             }

//             if (this.changes === 0) {
//                 reject(new Error("Not enough tickets available or event not found."));
//                 return;
//             }

//             resolve();
//         });
//     });
// }

// /**
//  * Creates a new booking record (simulated, since you don’t have a Booking table yet).
//  * @param {number} event_id - ID of the event being booked
//  * @param {number} user_id - ID of the user booking the tickets
//  * @param {number} tickets - Number of tickets booked
//  * @returns {Promise<Object>} - Booking confirmation object
//  */
// function createBooking(event_id, user_id, tickets) {
//     return new Promise((resolve) => {
//         // This is a simulated booking until you make a Booking table
//         resolve({
//             booking_id: Math.floor(Math.random() * 100000),
//             event_id,
//             user_id,
//             tickets,
//             status: "confirmed"
//         });
//     });
// }

// module.exports = {
//     getEventByName,
//     decrementTickets,
//     createBooking
// };
