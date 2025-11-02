/**
 * Database Concurrency Test for Ticket Booking
 * Ensures that simultaneous booking attempts cannot oversell tickets.
 */

const llmModel = require("../model/llmModel");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../../shared-db/database.sqlite");

describe("Database Concurrency Protection", () => {

  beforeAll((done) => {
    const db = new sqlite3.Database(dbPath);
    // Reset table + insert controlled test event
    db.serialize(() => {
      db.run("DELETE FROM Event", []);
      db.run(
        `INSERT INTO Event (event_id, event_name, event_date, event_location, event_tickets)
         VALUES (1, 'Concurrency Test Event', '2025-11-15', 'Test Hall', 5)`
      );
    });
    db.close(done);
  });

  test("should prevent overselling when two users book at the same time", async () => {
    const eventId = 1;

    // Two users each try to buy 4 tickets (only 5 exist total)
    const booking1 = llmModel.decrementTickets(eventId, 4);
    const booking2 = llmModel.decrementTickets(eventId, 4);

    let results = await Promise.allSettled([booking1, booking2]);

    const successCount = results.filter(r => r.status === "fulfilled").length;
    const failCount = results.filter(r => r.status === "rejected").length;

    expect(successCount).toBe(1);
    expect(failCount).toBe(1);

    // Check DB final state to ensure no oversell happened
    const db = new sqlite3.Database(dbPath);

    const finalTickets = await new Promise((resolve, reject) => {
      db.get("SELECT event_tickets FROM Event WHERE event_id = ?", [eventId], (err, row) => {
        if (err) reject(err);
        else resolve(row.event_tickets);
      });
    });

    db.close();

    // One successful booking of 4 tickets should leave 1 remaining
    expect(finalTickets).toBe(1);
  });

});
