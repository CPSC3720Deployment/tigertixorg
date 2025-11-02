/**
 * @description Unit tests for the custom `useVoiceRecognition` React hook.
 * Validates voice recognition behavior including listening state,
 * transcript handling, and integration with the SpeechRecognition API.
 */

import { renderHook, act } from "@testing-library/react";
import { useVoiceRecognition } from "../useVoiceRecognition";

/**
 * @class MockSpeechRecognition
 * @description Mock implementation of the browser SpeechRecognition API for testing.
 * Simulates speech recognition behavior and triggers events asynchronously.
 */
class MockSpeechRecognition {
  /**
   * Initializes mock SpeechRecognition instance with default values and callbacks.
   * @constructor
   */
  constructor() {
    /** @type {boolean} */
    this.continuous = false;
    /** @type {boolean} */
    this.interimResults = false;
    /** @type {string} */
    this.lang = "en-US";
    /** @type {((event: SpeechRecognitionEvent) => void) | null} */
    this.onresult = null;
    /** @type {((event: SpeechRecognitionErrorEvent) => void) | null} */
    this.onerror = null;
    /** @type {(() => void) | null} */
    this.onend = null;
  }

  /**
   * Starts the mock recognition process and simulates a speech result.
   * @returns {void}
   */
  start() {
    setTimeout(() => {
      if (this.onresult) {
        this.onresult({
          results: [[{ transcript: "Book 2 tickets for Tiger Football Game" }]],
        });
      }
    }, 50);
  }

  /**
   * Stops the recognition process and calls `onend` if defined.
   * @returns {void}
   */
  stop() {
    if (this.onend) this.onend?.();
  }
}

/**
 * Sets the global mock SpeechRecognition API for use in tests.
 * @type {MockSpeechRecognition}
 */
global.SpeechRecognition = MockSpeechRecognition;
global.webkitSpeechRecognition = MockSpeechRecognition;

/**
 * @testSuite useVoiceRecognition hook
 * Tests functionality of custom speech recognition hook.
 */
describe("useVoiceRecognition hook", () => {
  /**
   * @test
   * @description Ensures the hook starts listening, receives a transcript,
   * calls the onTranscript callback, and stops listening correctly.
   * @returns {Promise<void>}
   */
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
