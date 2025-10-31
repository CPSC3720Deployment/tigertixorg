import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./llm.css";

function LLM() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I can help you book tickets. Try saying "Book 2 tickets for Tiger Football Game" or "Show me events on 2025-11-15".' }
  ]);
  const [input, setInput] = useState("");
  const [proposedBooking, setProposedBooking] = useState(null);
  const [listening, setListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice recognition setup
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      handleSendMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      addMessage('ai', 'Sorry, I had trouble hearing you. Please try again.', false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Text-to-speech (disabled for errors)
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const addMessage = (role, text, shouldSpeak = true) => {
    setMessages((prev) => [...prev, { role, text }]);
    if (role === "ai" && shouldSpeak) {
      speak(text);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      addMessage("ai", "Voice input is not supported in your browser.", false);
      return;
    }

    if (!listening) {
      setListening(true);
      recognitionRef.current.start();
      addMessage("user", "[Listening...]", false);
    } else {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const handleSendMessage = async (messageText = input) => {
    const textToSend = messageText.trim();
    if (!textToSend) return;

    if (messageText === input) {
      addMessage("user", textToSend, false);
    }

    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:7001/api/llm/chat", { text: textToSend });
      const data = response.data;

      if (data.intent === "book_tickets" && data.message) {
        addMessage("ai", data.message);
        setProposedBooking({ event: data.event, tickets: data.tickets });
      } else if (data.intent === "events_by_name" || data.intent === "events_by_date") {
        if (data.events && data.events.length > 0) {
          const eventList = data.events
            .map(
              (e) =>
                `${e.event_name} on ${e.event_date} at ${e.event_location} (${e.event_tickets} tickets available)`
            )
            .join("\n");
          addMessage("ai", `Here are the events:\n${eventList}`);
        } else {
          addMessage("ai", "No events found.", false);
        }
      } else {
        addMessage("ai", data.message || "How can I help you?");
      }
    } catch (err) {
      console.error(err);
      addMessage("ai", "Sorry, I encountered an error. Please try again.", false);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!proposedBooking) return;

    setLoading(true);
    addMessage("user", "Yes, confirm booking", false);

    try {
      const response = await axios.post("http://localhost:7001/api/llm/confirm", proposedBooking);
      const data = response.data;

      addMessage("ai", data.message || "Booking confirmed!");
      setProposedBooking(null);
    } catch (err) {
      console.error(err);
      addMessage("ai", err.response?.data?.error || "Failed to confirm booking. Please try again.", false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        className={`chatbot-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI assistant"
      >
        {isOpen ? "×" : "AI"}
      </button>

      {/* Chatbot Panel */}
      <div className={`chatbot-panel ${isOpen ? "open" : ""}`}>
        <div className="chatbot-header">
          <h3>AI Ticket Assistant</h3>
          <button
            className="close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              <div className="message-content">{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-message ai">
              <div className="message-content typing">Processing...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          {proposedBooking && (
            <button
              className="confirm-btn"
              onClick={handleConfirm}
              disabled={loading}
              aria-label="Confirm booking"
            >
              Confirm Booking
            </button>
          )}

          <div className="input-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
              aria-label="Chat message input"
            />
            <button
              className={`voice-btn ${listening ? "listening" : ""}`}
              onClick={toggleListening}
              disabled={loading}
              aria-label={listening ? "Stop listening" : "Start voice input"}
            >
              {listening ? "Stop" : "Voice"}
            </button>
            <button
              className="send-btn"
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default LLM;
