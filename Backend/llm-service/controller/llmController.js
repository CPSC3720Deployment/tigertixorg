
const { GoogleGenerativeAI } = require('@google/generative-ai');
const llmModel = require('../model/llmModel');

// Hide API key in production
const apiKey = "AIzaSyBrGzToNCENjJz-maYY3-yu07NhW8_f_7A";
const genAI = new GoogleGenerativeAI(apiKey);
const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.0,
    maxOutputTokens: 500,
  },
});

/**
 * Handles ai requests using natural language, and processes them for ticket booking requests.
 * Interprets user text input using Gemini and extracts structured intent data (JSON).
 * Handles POST /api/llm/parse.
 *
 * @async
 * @function handleLLMRequest
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.text - User input text to interpret
 * @param {Object} res - Express response object
 * @returns {void} Responds with:
 *  - 200 if it works
 *  - 400 if input text is invalid or parsing fails
 *  - 404 if the event is not found
 *  - 500 on server or model errors
 * @throws {Error} If Gemini or database operations fail
 */

async function handleLLMRequest(req, res) {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Input text is required' });
    }

    const prompt = `
You are a ticket-booking assistant.
Extract ONLY valid JSON with these keys:
- "intent": one of ["book_tickets", "events_by_name", "events_by_date"]
- "event": string (if applicable), fix spelling errors and make the first letter of each word of the event is capital if necessary.
- "tickets": integer (if applicable)
- "date": string in YYYY-MM-DD format (if applicable)
Return only the JSON, nothing else.
Input: "${text}"
`;

    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();

    if (!response) {
      return res.status(500).json({ error: 'LLM did not return a response' });
    }

    console.log('LLM Response:', response);

    let parsed;
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return res.status(400).json({ error: 'Could not parse LLM response', raw: response });
    }

    const { intent, event, tickets, date } = parsed;

    switch (intent) {
      case 'book_tickets':
        if (!event || !tickets) {
          return res.status(400).json({ error: 'Missing event or tickets', parsed });
        }

        const eventRow = await llmModel.getEventByName(event);
        if (!eventRow) return res.status(404).json({ error: `Event "${event}" not found` });
        if (eventRow.event_tickets < tickets) {
          return res.status(400).json({ error: `Only ${eventRow.event_tickets} tickets available` });
        }

        return res.status(200).json({
          intent: 'book_tickets',
          event: eventRow.event_name,
          tickets,
          message: `Proposed booking: ${tickets} ticket(s) for "${eventRow.event_name}". Please confirm.`,
        });

      case 'events_by_name':
        if (!event) return res.status(400).json({ error: 'Event name is required' });
        const namedEvent = await llmModel.getEventByName(event);
        if (!namedEvent) return res.status(404).json({ error: `Event "${event}" not found` });

        return res.status(200).json({
          intent: 'events_by_name',
          events: [namedEvent],
        });

      case 'events_by_date':
        if (!date) return res.status(400).json({ error: 'Date is required' });
        const eventsByDate = await llmModel.getEventsByDate(date);
        if (!eventsByDate || eventsByDate.length === 0) {
          return res.status(404).json({ error: `No events found on ${date}` });
        }

        return res.status(200).json({
          intent: 'events_by_date',
          events: eventsByDate,
        });

      default:
        return res.status(400).json({ error: 'Unknown intent', parsed });
    }
  } catch (err) {
    console.error('Error in handleLLMRequest:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/**
 * Confirms a proposed ticket booking by updating the database.
 * Handles POST /api/llm/confirm.
 *
 * @async
 * @function confirmBooking
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.event - Name of the event being booked
 * @param {number} req.body.tickets - Number of tickets to confirm
 * @param {Object} res - Express response object
 * @returns {void} Responds with:
 *  - 201 if booking confirmation is a success
 *  - 400 if input is invalid
 *  - 404 if the event does not exist
 *  - 500 on server error
 * @throws {Error} If the booking or ticket update fails
 */

async function confirmBooking(req, res) {
  try {
    const { event, tickets } = req.body;
    if (!event || !tickets) {
      return res.status(400).json({ error: 'Event and tickets are required' });
    }

    const eventRow = await llmModel.getEventByName(event);
    if (!eventRow) return res.status(404).json({ error: 'Event not found' });

    await llmModel.decrementTickets(eventRow.event_id, tickets);
    const booking = await llmModel.createBooking(eventRow.event_id, tickets);

    res.status(201).json({
      message: `Booking confirmed for ${tickets} ticket(s) to "${event}"`,
      booking,
    });
  } catch (err) {
    console.error('Error in confirmBooking:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

module.exports = { handleLLMRequest, confirmBooking };
