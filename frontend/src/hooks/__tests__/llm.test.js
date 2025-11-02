import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LLM from "../../llm";

// Mock axios properly
const axios = require('axios');
jest.mock('axios');

// Setup default axios responses
beforeEach(() => {
  axios.post.mockResolvedValue({
    data: {
      intent: "query",
      message: "How can I help you?"
    }
  });
});

// Mock SpeechRecognition
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = "en-US";
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    MockSpeechRecognition.instance = this;
  }

  start() {
    setTimeout(() => {
      if (this.onresult) {
        this.onresult({
          results: [[{ transcript: "Book 2 tickets for Tiger Football Game" }]]
        });
      }
    }, 100);
  }

  stop() {
    if (this.onend) {
      this.onend();
    }
  }
}

// Mock speechSynthesis
const mockSpeak = jest.fn();
const mockCancel = jest.fn();

global.speechSynthesis = {
  speak: mockSpeak,
  cancel: mockCancel
};

// Setup mocks before tests
beforeAll(() => {
  global.SpeechRecognition = MockSpeechRecognition;
  global.webkitSpeechRecognition = MockSpeechRecognition;
});

// Reset mocks before each test
beforeEach(() => {
  mockSpeak.mockClear();
  mockCancel.mockClear();
  MockSpeechRecognition.instance = null;
  
  // Reset axios mock
  axios.post.mockClear();
  axios.post.mockResolvedValue({
    data: {
      intent: "query",
      message: "How can I help you?"
    }
  });
});

describe("LLM Chatbot Component", () => {
  
  test("Renders chatbot toggle button", () => {
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    expect(toggleButton).toBeInTheDocument();
  });

  test("Opens chatbot panel when toggle clicked", () => {
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    fireEvent.click(toggleButton);
    
    expect(screen.getByText(/AI Ticket Assistant/i)).toBeInTheDocument();
  });

  test("Displays initial greeting message", () => {
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    fireEvent.click(toggleButton);
    
    expect(screen.getByText(/Hello! I can help you book tickets/i)).toBeInTheDocument();
  });

  test("Input field is present and accepts text", () => {
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    fireEvent.click(toggleButton);
    
    const input = screen.getByPlaceholderText(/Type your message/i);
    expect(input).toBeInTheDocument();
    
    fireEvent.change(input, { target: { value: "Test message" } });
    expect(input.value).toBe("Test message");
  });

  test("Send button is disabled when input is empty", () => {
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    fireEvent.click(toggleButton);
    
    const sendButton = screen.getByRole("button", { name: /send message/i });
    expect(sendButton).toBeDisabled();
  });

  test("Send button is enabled when input has text", () => {
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    fireEvent.click(toggleButton);
    
    const input = screen.getByPlaceholderText(/Type your message/i);
    fireEvent.change(input, { target: { value: "Test message" } });
    
    const sendButton = screen.getByRole("button", { name: /send message/i });
    expect(sendButton).not.toBeDisabled();
  });
});

describe("LLM Voice Recognition", () => {
  
  test("Voice button toggles listening state", () => {
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    fireEvent.click(toggleButton);
    
    const voiceButton = screen.getByRole("button", { name: /start voice input/i });
    expect(voiceButton).toBeInTheDocument();
    expect(voiceButton).toHaveTextContent("Voice");
    
    fireEvent.click(voiceButton);
    expect(voiceButton).toHaveTextContent("Stop");
    
    fireEvent.click(voiceButton);
    expect(voiceButton).toHaveTextContent("Voice");
  });

  test("Speech recognition updates input field", async () => {
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    fireEvent.click(toggleButton);
    
    const voiceButton = screen.getByRole("button", { name: /start voice input/i });
    fireEvent.click(voiceButton);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Type your message/i);
      expect(input.value).toBe("Book 2 tickets for Tiger Football Game");
    }, { timeout: 3000 });
  });

  test("Shows listening message when voice starts", async () => {
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    fireEvent.click(toggleButton);
    
    const voiceButton = screen.getByRole("button", { name: /start voice input/i });
    fireEvent.click(voiceButton);
    
    await waitFor(() => {
      expect(screen.getByText(/\[Listening...\]/i)).toBeInTheDocument();
    });
  });

  test("Handles speech recognition errors gracefully", async () => {
    class ErrorMockRecognition {
      constructor() {
        this.continuous = false;
        this.interimResults = false;
        this.lang = "en-US";
        this.onresult = null;
        this.onerror = null;
        this.onend = null;
      }
      
      start() {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror({ error: "network" });
          }
        }, 50);
      }
      
      stop() {
        if (this.onend) {
          this.onend();
        }
      }
    }
    
    const originalMock = global.SpeechRecognition;
    global.SpeechRecognition = ErrorMockRecognition;
    global.webkitSpeechRecognition = ErrorMockRecognition;
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    fireEvent.click(toggleButton);
    
    const voiceButton = screen.getByRole("button", { name: /start voice input/i });
    fireEvent.click(voiceButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Sorry, I had trouble hearing you/i)).toBeInTheDocument();
    }, { timeout: 1000 });
    
    global.SpeechRecognition = originalMock;
    global.webkitSpeechRecognition = originalMock;
    consoleErrorSpy.mockRestore();
  });
});

describe("LLM Narrator Feature", () => {
  
  test("Narrator toggle is present", () => {
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    fireEvent.click(toggleButton);
    
    const narratorCheckbox = screen.getByLabelText(/Narrator/i);
    expect(narratorCheckbox).toBeInTheDocument();
    expect(narratorCheckbox).not.toBeChecked();
  });

  test("Narrator can be enabled", () => {
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    fireEvent.click(toggleButton);
    
    const narratorCheckbox = screen.getByLabelText(/Narrator/i);
    fireEvent.click(narratorCheckbox);
    
    expect(narratorCheckbox).toBeChecked();
  });

  test("AI messages are spoken when narrator is enabled", async () => {
    mockSpeak.mockClear();
    
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    fireEvent.click(toggleButton);
    
    const narratorCheckbox = screen.getByLabelText(/Narrator/i);
    fireEvent.click(narratorCheckbox);
    
    mockSpeak.mockClear();
    
    const input = screen.getByPlaceholderText(/Type your message/i);
    fireEvent.change(input, { target: { value: "Show me events" } });
    
    const sendButton = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  test("AI messages are NOT spoken when narrator is disabled", async () => {
    mockSpeak.mockClear();
    
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    fireEvent.click(toggleButton);
    
    const narratorCheckbox = screen.getByLabelText(/Narrator/i);
    expect(narratorCheckbox).not.toBeChecked();
    
    mockSpeak.mockClear();
    
    const input = screen.getByPlaceholderText(/Type your message/i);
    fireEvent.change(input, { target: { value: "Show me events" } });
    
    const sendButton = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(sendButton);
    
    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText(/How can I help you/i)).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Speak should NOT be called for new messages when narrator is off
    expect(mockSpeak).not.toHaveBeenCalled();
  });
});

describe("LLM Booking Confirmation", () => {
  
  test("Confirm button appears after booking proposal", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        intent: "book_tickets",
        message: "I can book 2 tickets for Tiger Football Game. Confirm?",
        event: "Tiger Football Game",
        tickets: 2
      }
    });
    
    render(<LLM events={[]} setEvents={() => {}} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle ai assistant/i });
    fireEvent.click(toggleButton);
    
    const input = screen.getByPlaceholderText(/Type your message/i);
    fireEvent.change(input, { target: { value: "Book 2 tickets" } });
    
    const sendButton = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /confirm booking/i })).toBeInTheDocument();
    });
  });
});