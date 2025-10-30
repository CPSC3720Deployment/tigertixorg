const { GoogleGenerativeAI } = require('@google/generative-ai');
const llmModel = require('../model/llmModel');

const apiKey = "AIzaSyBrGzToNCENjJz-maYY3-yu07NhW8_f_7A";
const genAI = new GoogleGenerativeAI(apiKey);
const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.0,
    maxOutputTokens: 200,
  },
});

async function parseBooking(req, res) {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Input text is required' });
    }

    const prompt = `
You are a ticket-booking assistant.
Extract ONLY valid JSON with keys "event" (string) and "tickets" (integer).
Example: {"event": "Jazz Night", "tickets": 2}
Input: "${text}"
Return only the JSON, nothing else.
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

    const { event, tickets } = parsed;
    if (!event || !tickets) {
      return res.status(400).json({ error: 'Missing event or tickets', parsed });
    }

    const eventRow = await llmModel.getEventByName(event);
    if (!eventRow) {
      return res.status(404).json({ error: `Event "${event}" not found` });
    }
    
    if (eventRow.event_tickets < tickets) {
      return res.status(400).json({ error: `Only ${eventRow.event_tickets} tickets available` });
    }

    res.status(200).json({
      event: eventRow.event_name,
      tickets,
      message: `Proposed booking: ${tickets} ticket(s) for "${eventRow.event_name}". Please confirm.`,
    });

  } catch (err) {
    console.error('Error in parseBooking:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

async function confirmBooking(req, res) {
  try {
    const { event, tickets } = req.body;
    if (!event || !tickets) {
      return res.status(400).json({ error: 'Event and tickets are required' });
    }

    const eventRow = await llmModel.getEventByName(event);
    if (!eventRow) {
      return res.status(404).json({ error: 'Event not found' });
    }

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

module.exports = { parseBooking, confirmBooking };