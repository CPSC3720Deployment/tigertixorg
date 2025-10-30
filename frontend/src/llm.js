import React, { useState, useEffect } from "react";
import axios from "axios";
import "./llm.css";

function LLM() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [proposedBooking, setProposedBooking] = useState(null);
  const [listening, setListening] = useState(false);

  // Voice recognition setup
  const recognition = typeof window !== "undefined" && window.SpeechRecognition ? new window.SpeechRecognition() :
                      typeof window !== "undefined" && window.webkitSpeechRecognition ? new window.webkitSpeechRecognition() : null;

  useEffect(() => {
    if (!recognition) return;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  }, [recognition]);

  function toggleListening() {
        if (!recognition) return;

        if (!listening) {
            setListening(true);
            recognition.start();
        } else {
            recognition.stop();
            setListening(false);
        }
    }

  // Send text to LLM
  const askAI = async () => {
    if (!input.trim()) return;

    try {
      const res = await axios.post("http://localhost:7001/api/llm/parse", { text: input });
      setResponse(res.data.message);
      setProposedBooking({ event: res.data.event, tickets: res.data.tickets });
    } catch (err) {
      console.error(err);
      setResponse(err.response?.data?.error || "Error processing request");
    }
  };

  // Confirm booking
  const confirmBooking = async () => {
    if (!proposedBooking) return;

    try {
      const res = await axios.post("http://localhost:7001/api/llm/confirm", proposedBooking);
      setResponse(res.data.message);
      setProposedBooking(null);
      setInput("");
    } catch (err) {
      console.error(err);
      setResponse(err.response?.data?.error || "Error confirming booking");
    }
  };

  return (
    <div className="llm-container">
      <h2>AI Ticket Assistant</h2>

      <div className="llm-input-group">
        <input
          type="text"
          aria-label="Type your ticket request"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="llm-mic-button"
          onClick={toggleListening}
          aria-label={listening ? "Stop listening" : "Start voice input"}
        >
          {listening ? "🛑" : "🎤"}
        </button>
        <button onClick={askAI} aria-label="Ask AI to process ticket request">
          Ask AI
        </button>
      </div>

      {response && (
        <div className="llm-response" aria-live="polite">
          <p>{response}</p>
          {proposedBooking && (
            <button onClick={confirmBooking} aria-label="Confirm booking">
              Confirm Booking
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default LLM;
