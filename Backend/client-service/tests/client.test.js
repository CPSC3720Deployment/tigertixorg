const request = require("supertest");
const app = require("../server");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../../shared-db/database.sqlite");


beforeAll((done) => {
  const db = new sqlite3.Database(dbPath);
  db.serialize(() => {
    db.run("DELETE FROM Event");
    db.run(`
      INSERT INTO Event (event_id, event_name, event_date, event_tickets, event_location)
      VALUES (1, 'Client Test Event', '2025-12-12', 2, 'Test Arena')
    `);
  });
  db.close(done);
});

describe("Client Microservice", () => {
  /**
 * Handles GET /api/events
 * Fetches all events from the shared database.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * @returns {Array<Object>} - On success (200): Array of event objects.
 *                            Each event contains:
 *                            - event_id {number}
 *                            - event_name {string}
 *                            - event_date {string}
 *                            - event_location {string}
 *                            - event_tickets {number}
 */
  test("GET /api/events returns all events", async () => {
    const res = await request(app).get("/api/events");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].event_name).toBe("Client Test Event");
  });

//Test for a function that is not being used. If the functio is to be used in the future,
//this test should be uncommented.
//   test("GET /api/events/:id returns single event", async () => {
//     const res = await request(app).get("/api/events/1");

//     expect(res.status).toBe(200);
//     expect(res.body.event_id).toBe(1);
//   });


/**
 * Handles POST /api/events/:id/purchase
 * Purchases a single ticket for the specified event.
 *
 * @param {Object} req - Express request object
 * @param {number} req.params.id - ID of the event to purchase a ticket for
 * @param {Object} res - Express response object
 *
 * @returns {Object} - On success (200): Confirmation message.
 *                     On failure (500): Error message when event is sold out.
 */
  test("POST /api/events/:id/purchase buys a ticket", async () => {
    const res = await request(app).post("/api/events/1/purchase");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Successfully purchased ticket");
  });

  test("sold-out event returns error", async () => {
    // 2 tickets total -> already purchased 1 -> this buys second:
    await request(app).post("/api/events/1/purchase");

    // now event has 0 -> next attempt should fail
    const resFail = await request(app).post("/api/events/1/purchase");

    expect(resFail.status).toBe(500);
    expect(resFail.body.error).toBe("Server error");
  });

});
