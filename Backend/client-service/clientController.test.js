// // clientController.test.js
// const clientController = require('../controllers/clientController');
// const clientModel = require('../models/clientModel');
// jest.mock('../models/clientModel');

// describe('clientController tests', () => {
//   let res;
//   beforeEach(() => {
//     res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
//   });

//   test('getEvents returns 200', async () => {
//     clientModel.getEvents.mockResolvedValue([{ event_id:1 }]);
//     await clientController.getEvents({}, res);
//     expect(res.status).toHaveBeenCalledWith(200);
//   });
// });
