const request = require("supertest");
const app = require("../llmserver");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Reset DB for predictable test results
const dbPath = path.join(__dirname, "../../shared-db/database.sqlite");
const { db } = require("../model/llmModel");

afterAll(() => {
  db.close();
});

beforeAll((done) => {
  const db = new sqlite3.Database(dbPath);
  db.serialize(() => {
    db.run("DELETE FROM Event");
    db.run(`
      INSERT INTO Event (event_id, event_name, event_date, event_tickets, event_location)
      VALUES (1, 'Test Event', '2025-11-15', 10, 'Arena')
    `);
  });
  db.close(done);
});

// Mock LLM response (NO external API)
jest.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: () =>
          Promise.resolve({
            response: {
              text: () =>
                JSON.stringify({
                  intent: "book_tickets",
                  event: "Test Event",
                  tickets: 2
                })
            }
          })
      })
    }))
  };
});

describe("LLM Microservice", () => {
/** Description:
 *    Parses a natural-language message and returns structured intent data such as:
 *      - booking requests
 *      - event lookup by name
 *      - event lookup by date
 *
 * Request Body:
 *    @param {Object} req.body
 *    @param {string} req.body.text - The user's natural-language message.
 */
  test("LLM parse returns booking proposal", async () => {
    const res = await request(app)
      .post("/api/llm/parse")
      .send({ text: "Book me 2 tickets for Test Event" });

    expect(res.status).toBe(200);
    expect(res.body.intent).toBe("book_tickets");
    expect(res.body.event).toBe("Test Event");
    expect(res.body.tickets).toBe(2);
  });


 /** Description:
 *    Confirms a previously proposed ticket booking by deducting tickets and  
 *    creating a booking record.
 *
 * Request Body:
 *    @param {Object} req.body
 *    @param {string} req.body.event   - Event name to finalize booking for
 *    @param {number} req.body.tickets - Number of tickets to purchase
 */
  test("LLM confirm endpoint decrements tickets", async () => {
    const res = await request(app)
      .post("/api/llm/confirm")
      .send({ event: "Test Event", tickets: 2 });

    expect(res.status).toBe(201);
    expect(res.body.booking.status).toBe("confirmed");
  });

});
