

// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import "./llm.css";

// /**
//  * LLM Component — The AI chat assistant for event booking.
//  *
//  * @component
//  * @param {Object} props
//  * @param {Array<Object>} props.events - The list of available events, used to update ticket counts.
//  * @param {Function} props.setEvents - Function to update event state in the parent component.
//  *
//  * @returns {JSX.Element} The interactive AI assistant panel.
//  */
// function LLM({ events, setEvents }) {
 
//   const [messages, setMessages] = useState([
//     {
//       role: "ai",
//       text: 'Hello! I can help you book tickets. Try saying "Book 2 tickets for Tiger Football Game" or "Show me events on 2025-11-15".',
//     },
//   ]);

//   const [input, setInput] = useState("");
//   const [proposedBooking, setProposedBooking] = useState(null);
//   const [listening, setListening] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [narratorEnabled, setNarratorEnabled] = useState(false);
//   const messagesEndRef = useRef(null);
//   const recognitionRef = useRef(null);

  
//   /**
//    * Automatically scrolls chat to the most recent message.
//    */
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   /**
//    * Initialize browser speech recognition if available.
//    * Handles speech-to-text input and error.
//    */
//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       console.warn("Speech recognition not supported in this browser.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.lang = "en-US";

//     recognition.onresult = (event) => {
//       const transcript = event.results[0][0].transcript;
//       setInput(transcript);
//       setListening(false);
//     };

//     recognition.onerror = (event) => {
//       console.error("Speech recognition error:", event.error);
//       setListening(false);
//       addMessage("ai", "Sorry, I had trouble hearing you. Please try again.");
//     };

//     recognition.onend = () => {
//       setListening(false);
//     };

//     recognitionRef.current = recognition;
//   });

  
//   /**
//    * Adds a message to the chat history.
//    *
//    * @param {"ai"|"user"} role - Who sent the message.
//    * @param {string} text - The message content.
//    */
//   const addMessage = (role, text) => {
//     setMessages((prev) => [...prev, { role, text }]);
//     if (role === "ai") speakMessage(text);
//   };

//   /**
//    * Reads an AI message aloud if narrator is enabled.
//    *
//    * @param {string} text - Message to be spoken.
//    */
//   const speakMessage = (text) => {
//     if (!narratorEnabled || !window.speechSynthesis) return;
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = "en-US";
//     window.speechSynthesis.speak(utterance);
//   };

//   /**
//    * Toggles microphone listening for speech input.
//    */
//   const toggleListening = () => {
//     if (!recognitionRef.current) {
//       addMessage("ai", "Voice input is not supported in your browser.");
//       return;
//     }

//     if (!listening) {
//       setListening(true);
//       recognitionRef.current.start();
//       addMessage("user", "[Listening...]");
//     } else {
//       recognitionRef.current.stop();
//       setListening(false);
//     }
//   };

//   /**
//    * Sends the user's message to the LLM backend for parsing.
//    *
//    * @async
//    * @param {string} [messageText=input] - Message text to send. Defaults to the current input field value.
//    */
//   const handleSendMessage = async (messageText = input) => {
//     const textToSend = messageText.trim();
//     if (!textToSend) return;

//     if (messageText === input) addMessage("user", textToSend);

//     setInput("");
//     setLoading(true);

//     try {
//       const response = await axios.post("http://localhost:7001/api/llm/parse", {
//         text: textToSend,
//       });
//       const data = response.data;

//       // Handle different intent responses
//       if (data.intent === "book_tickets" && data.message) {
//         addMessage("ai", data.message);
//         setProposedBooking({ event: data.event, tickets: data.tickets });
//       } else if (
//         data.intent === "events_by_name" ||
//         data.intent === "events_by_date"
//       ) {
//         if (data.events && data.events.length > 0) {
//           const eventList = data.events
//             .map(
//               (e) =>
//                 `${e.event_name} on ${e.event_date} at ${e.event_location} (${e.event_tickets} tickets available)`
//             )
//             .join("\n");
//           addMessage("ai", `Here are the events:\n${eventList}`);
//         } else {
//           addMessage("ai", "No events found.");
//         }
//       } else {
//         addMessage("ai", data.message || "How can I help you?");
//       }
//     } catch (err) {
//       console.error(err);
//       addMessage("ai", "Sorry, I encountered an error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * Confirms a proposed booking with the backend.
//    *
//    * @async
//    */
//   const handleConfirm = async () => {
//     if (!proposedBooking) return;

//     setLoading(true);
//     addMessage("user", "Yes, confirm booking");

//     try {
//       const response = await axios.post(
//         "http://localhost:7001/api/llm/confirm",
//         proposedBooking
//       );
//       addMessage("ai", response.data.message || "Booking confirmed!");

//       // Update event ticket counts in parent state
//       if (setEvents) {
//         setEvents((prevEvents) =>
//           prevEvents.map((ev) =>
//             ev.event_name === proposedBooking.event
//               ? {
//                   ...ev,
//                   event_tickets: Math.max(
//                     0,
//                     ev.event_tickets - proposedBooking.tickets
//                   ),
//                 }
//               : ev
//           )
//         );
//       }

//       setProposedBooking(null);
//     } catch (err) {
//       console.error("Booking confirmation error:", err);
//       addMessage(
//         "ai",
//         err.response?.data?.error ||
//           "Failed to confirm booking. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * Handles Enter key submission in the input field.
//    *
//    * @param {KeyboardEvent} e - The keyboard event.
//    */
//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };


//   return (
//     <>
//       {/* Floating button to open or close chat */}
//       <button
//         className={`chatbot-toggle ${isOpen ? "open" : ""}`}
//         onClick={() => setIsOpen(!isOpen)}
//         aria-label="Toggle AI assistant"
//       >
//         {isOpen ? "×" : "AI"}
//       </button>

//       <div className={`chatbot-panel ${isOpen ? "open" : ""}`}>
//         <div className="chatbot-header">
//           <h3>AI Ticket Assistant</h3>

//           {/* Narrator feature toggle */}
//           <div className="narrator-toggle">
//             <label>
//               <input
//                 type="checkbox"
//                 checked={narratorEnabled}
//                 onChange={() => setNarratorEnabled(!narratorEnabled)}
//               />
//               Narrator
//             </label>
//           </div>

//           <button
//             className="close-btn"
//             onClick={() => setIsOpen(false)}
//             aria-label="Close chat"
//           >
//             ×
//           </button>
//         </div>

//         {/* Chat message display area */}
//         <div className="chat-messages">
//           {messages.map((msg, idx) => (
//             <div key={idx} className={`chat-message ${msg.role}`}>
//               <div className="message-content">{msg.text}</div>
//             </div>
//           ))}
//           {loading && (
//             <div className="chat-message ai">
//               <div className="message-content typing">Processing...</div>
//             </div>
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input controls */}
//         <div className="chat-input-container">
//           {proposedBooking && (
//             <button
//               className="confirm-btn"
//               onClick={handleConfirm}
//               disabled={loading}
//               aria-label="Confirm booking"
//             >
//               Confirm Booking
//             </button>
//           )}

//           <div className="input-row">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Type your message..."
//               disabled={loading}
//               aria-label="Chat message input"
//             />
//             <button
//               className={`voice-btn ${listening ? "listening" : ""}`}
//               onClick={toggleListening}
//               disabled={loading}
//               aria-label={listening ? "Stop listening" : "Start voice input"}
//             >
//               {listening ? "Stop" : "Voice"}
//             </button>
//             <button
//               className="send-btn"
//               onClick={() => handleSendMessage()}
//               disabled={loading || !input.trim()}
//               aria-label="Send message"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default LLM;


// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import "./llm.css";

/**
 * LLM Component — The AI chat assistant for event booking.
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.events - The list of available events, used to update ticket counts.
 * @param {Function} props.setEvents - Function to update event state in the parent component.
 *
 * @returns {JSX.Element} The interactive AI assistant panel.
 */
function LLM({ events, setEvents }) {
  const LLM_API = process.env.REACT_APP_LLM_API; // <-- Use deployed LLM service

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: 'Hello! I can help you book tickets. Try saying "Book 2 tickets for Tiger Football Game" or "Show me events on 2025-11-15".',
    },
  ]);

  const [input, setInput] = useState("");
  const [proposedBooking, setProposedBooking] = useState(null);
  const [listening, setListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [narratorEnabled, setNarratorEnabled] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  /**
   * Automatically scrolls chat to the most recent message.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Initialize browser speech recognition if available.
   * Handles speech-to-text input and error.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
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
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      addMessage("ai", "Sorry, I had trouble hearing you. Please try again.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  });

  /**
   * Adds a message to the chat history.
   *
   * @param {"ai"|"user"} role - Who sent the message.
   * @param {string} text - The message content.
   */
  const addMessage = (role, text) => {
    setMessages((prev) => [...prev, { role, text }]);
    if (role === "ai") speakMessage(text);
  };

  /**
   * Reads an AI message aloud if narrator is enabled.
   *
   * @param {string} text - Message to be spoken.
   */
  const speakMessage = (text) => {
    if (!narratorEnabled || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  /**
   * Toggles microphone listening for speech input.
   */
  const toggleListening = () => {
    if (!recognitionRef.current) {
      addMessage("ai", "Voice input is not supported in your browser.");
      return;
    }

    if (!listening) {
      setListening(true);
      recognitionRef.current.start();
      addMessage("user", "[Listening...]");
    } else {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  /**
   * Sends the user's message to the LLM backend for parsing.
   *
   * @async
   * @param {string} [messageText=input] - Message text to send. Defaults to the current input field value.
   */
  const handleSendMessage = async (messageText = input) => {
    const textToSend = messageText.trim();
    if (!textToSend) return;

    if (messageText === input) addMessage("user", textToSend);

    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(`${LLM_API}/llm/parse`, {
        text: textToSend,
      });
      const data = response.data;

      // Handle different intent responses
      if (data.intent === "book_tickets" && data.message) {
        addMessage("ai", data.message);
        setProposedBooking({ event: data.event, tickets: data.tickets });
      } else if (
        data.intent === "events_by_name" ||
        data.intent === "events_by_date"
      ) {
        if (data.events && data.events.length > 0) {
          const eventList = data.events
            .map(
              (e) =>
                `${e.event_name} on ${e.event_date} at ${e.event_location} (${e.event_tickets} tickets available)`
            )
            .join("\n");
          addMessage("ai", `Here are the events:\n${eventList}`);
        } else {
          addMessage("ai", "No events found.");
        }
      } else {
        addMessage("ai", data.message || "How can I help you?");
      }
    } catch (err) {
      console.error(err);
      addMessage("ai", "Sorry, I encountered an error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Confirms a proposed booking with the backend.
   *
   * @async
   */
  const handleConfirm = async () => {
    if (!proposedBooking) return;

    setLoading(true);
    addMessage("user", "Yes, confirm booking");

    try {
      const response = await axios.post(
        `${LLM_API}/llm/confirm`,
        proposedBooking
      );
      addMessage("ai", response.data.message || "Booking confirmed!");

      // Update event ticket counts in parent state
      if (setEvents) {
        setEvents((prevEvents) =>
          prevEvents.map((ev) =>
            ev.event_name === proposedBooking.event
              ? {
                  ...ev,
                  event_tickets: Math.max(
                    0,
                    ev.event_tickets - proposedBooking.tickets
                  ),
                }
              : ev
          )
        );
      }

      setProposedBooking(null);
    } catch (err) {
      console.error("Booking confirmation error:", err);
      addMessage(
        "ai",
        err.response?.data?.error ||
          "Failed to confirm booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Enter key submission in the input field.
   *
   * @param {KeyboardEvent} e - The keyboard event.
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating button to open or close chat */}
      <button
        className={`chatbot-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI assistant"
      >
        {isOpen ? "×" : "AI"}
      </button>

      <div className={`chatbot-panel ${isOpen ? "open" : ""}`}>
        <div className="chatbot-header">
          <h3>AI Ticket Assistant</h3>

          {/* Narrator feature toggle */}
          <div className="narrator-toggle">
            <label>
              <input
                type="checkbox"
                checked={narratorEnabled}
                onChange={() => setNarratorEnabled(!narratorEnabled)}
              />
              Narrator
            </label>
          </div>

          <button
            className="close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        {/* Chat message display area */}
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

        {/* Input controls */}
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
