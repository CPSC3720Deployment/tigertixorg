// // llmController.test.js
// const llmController = require('../controller/llmController');

// describe('LLM validation', () => {
//   let req, res;
//   beforeEach(() => {
//     res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
//   });

//   test('empty text returns 400', async () => {
//     req = { body: { text: '' } };
//     await llmController.handleLLMRequest(req, res);
//     expect(res.status).toHaveBeenCalledWith(400);
//   });
// });
