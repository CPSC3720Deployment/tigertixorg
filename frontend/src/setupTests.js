import '@testing-library/jest-dom';

// Mock axios globally
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock scrollIntoView to prevent errors in tests
HTMLElement.prototype.scrollIntoView = jest.fn();

// Mock SpeechRecognition
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'en-US';
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
  }
  start() {
    setTimeout(() => {
      this.onresult?.({
        results: [[{ transcript: 'Book 2 tickets' }]],
      });
    }, 50);
  }
  stop() {
    this.onend?.();
  }
}

global.SpeechRecognition = MockSpeechRecognition;
global.webkitSpeechRecognition = MockSpeechRecognition;

// Mock speechSynthesis
class MockSpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.lang = 'en-US';
  }
}
global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
};
