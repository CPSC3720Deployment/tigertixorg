const request = require("supertest");
const app = require("../server");  // exports your Express app
const { initializeDatabase } = require("../setup");

beforeAll(async () => {
  await initializeDatabase();
});

describe("Admin Microservice - Event Creation", () => {

  test("creates a valid event successfully", async () => {
    const res = await request(app)
      .post("/api/admin/events")
      .send({
        event_name: "Test Event",
        event_date: "2025-11-21",
        event_tickets: 50,
        event_location: "Test Hall"
      });

    expect(res.status).toBe(201);
    expect(res.body.event_id).toBeDefined();
    expect(res.body.event_name).toBe("Test Event");
  });

  test("returns 400 for missing fields", async () => {
    const res = await request(app)
      .post("/api/admin/events")
      .send({
        event_name: "Bad Event"
        // missing other required fields
      });

    expect(res.status).toBe(400);
  });

  test("rejects invalid date formats", async () => {
    const res = await request(app)
      .post("/api/admin/events")
      .send({
        event_name: "Bad Date",
        event_date: "11-20-2024",
        event_tickets: 10,
        event_location: "Place"
      });

    expect(res.status).toBe(400);
  });

});
