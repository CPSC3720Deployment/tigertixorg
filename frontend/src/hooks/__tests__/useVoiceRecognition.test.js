import { renderHook, act } from "@testing-library/react";
import { useVoiceRecognition } from "../useVoiceRecognition";

// Mock the browser SpeechRecognition API
class MockSpeechRecognition {
  start() {
    setTimeout(() => {
      if (this.onresult) {
        this.onresult({
          results: [[{ transcript: "Book 2 tickets for Tiger Football Game" }]],
        });
      }
    }, 50);
  }
  stop() {
    if (this.onend) this.onend?.();
  }
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = "en-US";
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
  }
}

global.SpeechRecognition = MockSpeechRecognition;
global.webkitSpeechRecognition = MockSpeechRecognition;

describe("useVoiceRecognition hook", () => {
  it("should start listening and call onTranscript with speech", async () => {
    const onTranscript = jest.fn();

    const { result } = renderHook(() =>
      useVoiceRecognition({ onTranscript })
    );

    act(() => {
      result.current.startListening();
    });

    expect(result.current.isListening).toBe(true);

    // Wait for the mock to fire the onresult
    await new Promise((r) => setTimeout(r, 60));

    expect(onTranscript).toHaveBeenCalledWith(
      "Book 2 tickets for Tiger Football Game"
    );

    act(() => {
      result.current.stopListening();
    });

    expect(result.current.isListening).toBe(false);
  });
});
