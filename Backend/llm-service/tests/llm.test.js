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

  test("LLM parse returns booking proposal", async () => {
    const res = await request(app)
      .post("/api/llm/parse")
      .send({ text: "Book me 2 tickets for Test Event" });

    expect(res.status).toBe(200);
    expect(res.body.intent).toBe("book_tickets");
    expect(res.body.event).toBe("Test Event");
    expect(res.body.tickets).toBe(2);
  });

  test("LLM confirm endpoint decrements tickets", async () => {
    const res = await request(app)
      .post("/api/llm/confirm")
      .send({ event: "Test Event", tickets: 2 });

    expect(res.status).toBe(201);
    expect(res.body.booking.status).toBe("confirmed");
  });

});
