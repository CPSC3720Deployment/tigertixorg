// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');

// jest.mock('../models/adminModel'); // Must mock before requiring controller
// const adminModel = require('../models/adminModel');

// const adminController = require('../controllers/adminController');

// describe("adminController with test database", () => {
//   let db;
//   let req, res;

//   beforeAll((done) => {
//     // ✅ Create a separate test database
//     const testDbPath = path.join(__dirname, 'test.sqlite');
//     db = new sqlite3.Database(testDbPath, (err) => {
//       if (err) return done(err);

//       // ✅ Build schema for tests (copy from your .sql file)
//       db.exec(`
//         CREATE TABLE IF NOT EXISTS Event (
//           event_id INTEGER PRIMARY KEY AUTOINCREMENT,
//           event_name TEXT,
//           event_date TEXT,
//           event_tickets INTEGER,
//           event_location TEXT
//         );
//       `, done);
//     });
//   });

//   beforeEach(() => {
//     req = {
//       body: {
//         event_name: "Test Event",
//         event_date: "2025-12-01",
//         event_tickets: 100,
//         event_location: "Test Stadium"
//       }
//     };

//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };

//     // ✅ Replace adminModel.createEvent with version that uses the test DB
//     adminModel.createEvent.mockImplementation((name, date, tickets, loc) => {
//       return new Promise((resolve, reject) => {
//         db.run(
//           `INSERT INTO Event (event_name, event_date, event_tickets, event_location)
//            VALUES (?, ?, ?, ?)`,
//           [name, date, tickets, loc],
//           function (err) {
//             if (err) return reject(err);
//             resolve({
//               event_id: this.lastID,
//               event_name: name,
//               event_date: date,
//               event_tickets: tickets,
//               event_location: loc
//             });
//           }
//         );
//       });
//     });
//   });

//   afterAll((done) => {
//     db.close(done);
//   });

//   test("creates an event successfully", async () => {
//     await adminController.createEvent(req, res);

//     expect(res.status).toHaveBeenCalledWith(201);
//     expect(res.json).toHaveBeenCalledWith(
//       expect.objectContaining({
//         event_name: "Test Event",
//         event_tickets: 100
//       })
//     );
//   });

//   test("returns 400 for invalid event_date", async () => {
//     req.body.event_date = "not-a-date";

//     await adminController.createEvent(req, res);

//     expect(res.status).toHaveBeenCalledWith(400);
//   });
// });