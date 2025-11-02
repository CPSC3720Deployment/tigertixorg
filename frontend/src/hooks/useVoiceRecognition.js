import { useState, useRef } from "react";

/**
 * Custom hook for browser speech recognition.
 * @param {Object} options
 * @param {(transcript: string) => void} options.onTranscript - callback when speech is recognized
 * @returns {Object} { isListening, startListening, stopListening }
 */
export function useVoiceRecognition({ onTranscript }) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      onTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return { isListening, startListening, stopListening };
}
