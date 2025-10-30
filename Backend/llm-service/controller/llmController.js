// llmController.js
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const bookingModel = require('../model/llmModel.js');
// require('dotenv').config();

// // Initialize Gemini model
// const apiKey = "AIzaSyBrGzToNCENjJz-maYY3-yu07NhW8_f_7A" //process.env.GEMINI_API_KEY;
// // if (!apiKey) {
// //   console.error('GEMINI_API_KEY is missing in .env');
// //   process.exit(1);
// // }

// const genAI = new GoogleGenerativeAI(apiKey);
// const geminiModel = genAI.getGenerativeModel({
//   model: 'gemini‑2.5‑flash',          // or whatever version you select
//   generationConfig: {
//     temperature: 0.0,               // deterministic for parsing
//     maxOutputTokens: 100,
//   },
// });

// async function parseBooking(req, res) {
//   try {
//     const { text } = req.body;
//     if (!text || text.trim() === '') {
//       return res.status(400).json({ error: 'Input text is required' });
//     }

//     // Prompt the model to extract event and tickets
//     const prompt = `
// You are a ticket‑booking assistant.  
// A user wants to book tickets.  
// Extract **only** JSON with the keys "event" (string) and "tickets" (integer).  
// Example: { "event": "Jazz Night", "tickets": 2 }  
// Input: "${text}"
// `;
//     const result = await geminiModel.generateContent({
//       contents: [{ role: 'user', parts: [{ text: prompt }] }],
//     });
//     const response = result.response.text?.();
//     if (!response) {
//       return res.status(500).json({ error: 'LLM did not return a response' });
//     }

//     let parsed;
//     try {
//       parsed = JSON.parse(response);
//     } catch (e) {
//       return res.status(400).json({ error: 'Could not parse LLM response as JSON', raw: response });
//     }

//     const { event, tickets } = parsed;
//     if (!event || typeof event !== 'string' || !tickets || typeof tickets !== 'number') {
//       return res.status(400).json({ error: 'Parsed result missing required fields', parsed });
//     }

//     // Check event and availability
//     const eventRow = await bookingModel.getEventByName(event);
//     if (!eventRow) {
//       return res.status(404).json({ error: `Event "${event}" not found` });
//     }
//     if (eventRow.tickets_available < tickets) {
//       return res.status(400).json({ error: `Only ${eventRow.tickets_available} tickets available for "${eventRow.event_name}"` });
//     }

//     res.status(200).json({
//       event: eventRow.event_name,
//       tickets,
//       message: `Proposed booking: ${tickets} ticket(s) for "${eventRow.event_name}". Please confirm when ready.`,
//     });

//   } catch (err) {
//     console.error('Error in parseBooking:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// }

// async function confirmBooking(req, res) {
//   try {
//     const { event, tickets } = req.body;
//     if (!event || typeof event !== 'string' || !tickets || typeof tickets !== 'number') {
//       return res.status(400).json({ error: 'Event (string) and tickets (number) are required' });
//     }

//     const bookingResult = await bookingModel.bookTicketsTransaction(event, tickets);
//     if (!bookingResult.success) {
//       return res.status(400).json({ error: bookingResult.message });
//     }

//     res.status(201).json({
//       message: `Booking confirmed for ${tickets} ticket(s) to "${event}"`,
//       booking: bookingResult.booking,
//     });
//   } catch (err) {
//     console.error('Error in confirmBooking:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// }

// module.exports = {
//   parseBooking,
//   confirmBooking,
// };

const llmModel = require('../model/llmModel');
const axios = require('axios');

/**
 * Handles event-related booking requests powered by the LLM microservice.
 * Takes user intent (like “book 2 tickets for Coldplay”) and performs the appropriate DB updates.
 * Handles POST /api/llm/book
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void} Responds with 200 and booking confirmation on success, or 500 with error message on failure
 */
async function processLLMBooking(req, res) {
    try {
        const { message} = req.body;

        if (!message) {
            return res.status(400).json({ error: "Missing required fields: message." });
        }

        console.log("Processing LLM request:", message);

        // Send user message to Gemini or OpenAI model microservice
        const llmResponse = await axios.post('http://localhost:8085/api/llm/interpret', { message });
        const parsed = llmResponse.data;

        if (!parsed || !parsed.event || !parsed.tickets) {
            return res.status(400).json({ error: "LLM could not interpret booking request properly." });
        }

        console.log("LLM interpreted:", parsed);

        // Find event by name
        const eventRow = await llmModel.getEventByName(parsed.event);
        if (!eventRow) {
            return res.status(404).json({ error: "Event not found." });
        }

        // Update ticket count
        await llmModel.decrementTickets(eventRow.event_id, parsed.tickets);

        // Create a booking record
        const booking = await llmModel.createBooking(eventRow.event_id, parsed.tickets);

        console.log("Booking successful:", booking);

        res.status(200).json({
            message: "Booking confirmed!",
            event: eventRow.event_name,
            tickets: parsed.tickets,
            booking
        });

    } catch (err) {
        console.error("Failed to process LLM booking:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { processLLMBooking };
