/**
 * @description Integration tests for the main App component of TigerTix
 * Tests event fetching, rendering, ticket purchasing, accessibility, and state management
 * 
 * @requires @testing-library/react
 * @requires @testing-library/jest-dom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../App";

/**
 * Mock global fetch API
 * @description Mocks all http requests to prevent actual network calls during testing
 * @global
 */
global.fetch = jest.fn();

/**
 * Mock localStorage to simulate logged-in state
 */
const localStorageMock = {
  getItem: jest.fn(() => 'test-token-123'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

/**
 * Mock llm component to isolate App component testing
 * @description Replaces actual LLM component with simple mock to avoid side effects
 * Path from src/hooks/__tests__/app.test.js to src/llm.js is ../../llm
 */
jest.mock('../../llm', () => {
  return function MockLLM({events, setEvents}) {
    return <div data-testid="mock-llm">LLM Component</div>;
  };
});

/**
 * Mock Login component - auto-login synchronously
 * @description Calls onLogin immediately to bypass authentication in tests
 */
jest.mock('../../login', () => {
  return function MockLogin({ onLogin }) {
    // Call onLogin immediately (synchronously) when rendered
    if (onLogin) {
      onLogin("test-token-123");
    }
    return null; // Don't render anything
  };
});

/**
 * Setup before each test
 * @description Clears all mocks and sets up default fetch response with sample events
 * @postcondition fetch is reset and configured with mock event data
 * 
 * @contract Mock event data structure:
 * {
 *   event_id: number,
 *   event_name: string,
 *   event_date: string (YYYY-MM-DD),
 *   event_location: string,
 *   event_tickets: number
 * }
 */
beforeEach(() => {
  fetch.mockClear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  
  fetch.mockResolvedValue({
    ok: true,
    json: async () => [
      {
        event_id: 1,
        event_name: "Tiger Football Game",
        event_date: "2025-11-15",
        event_location: "Memorial Stadium",
        event_tickets: 100
      },
      {
        event_id: 2,
        event_name: "Jazz Night",
        event_date: "2025-11-20",
        event_location: "Brooks Center",
        event_tickets: 50
      },
      {
        event_id: 3,
        event_name: "Basketball Game",
        event_date: "2025-11-22",
        event_location: "Littlejohn Coliseum",
        event_tickets: 0
      }
    ]
  });
});

/**
 * Cleanup after each test
 * @description Clears all Jest mocks to prevent test interference
 * @postcondition All mocks are reset to initial state
 */
afterEach(() => {
  jest.clearAllMocks();
});

/**
 * Test Suite: App Component Rendering
 * @description Verifies basic rendering of static UI elements
 * @precondition App component imports and dependencies are available
 */
describe("App Component Rendering", () => {
  
  /**
   * @test Renders header with TigerTix title
   * @precondition None
   * @postcondition Header with "TigerTix Event Tickets" is visible
   * @contract UI must display application name in header
   */
  test("Renders header with TigerTix title", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/TigerTix Event Tickets/i)).toBeInTheDocument();
    });
  });

  /**
   * @test Renders footer with copyright text
   * @precondition None
   * @postcondition Footer with "2025 TigerTix" is visible
   * @contract UI must display copyright information
   */
  test("Renders footer with copyright text", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/2025 TigerTix/i)).toBeInTheDocument();
    });
  });

  /**
   * @test Shows loading message initially
   * @precondition Events have not yet been fetched
   * @postcondition "Loading events" message is displayed
   * @contract UI must provide loading feedback before data arrives
   */
  test("Shows loading message initially", async () => {
    // Delay the fetch to catch the loading state
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => []
        }), 100)
      )
    );
    
    render(<App />);
    expect(screen.getByText(/Loading events/i)).toBeInTheDocument();
  });
});

/**
 * Test Suite: App Event Fetching
 * @description Tests interaction with backend API for event data
 * @precondition fetch is mocked with default event data
 */
describe("App Event Fetching", () => {
  
  /**
   * @test Fetches events from backend on mount
   * @precondition Component mounts successfully
   * @postcondition GET request made to correct endpoint
   * @contract Component must fetch events from http://localhost:6001/api/events on mount
   */
  test("Fetches events from backend on mount", async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("http://localhost:6001/api/events");
    });
  });

  /**
   * @test Displays events after successful fetch
   * @precondition fetch returns 3 mock events
   * @postcondition All 3 event names are displayed on screen
   * @contract All fetched events must be rendered in UI
   */
  test("Displays events after successful fetch", async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText("Tiger Football Game")).toBeInTheDocument();
    });
    
    expect(screen.getByText("Jazz Night")).toBeInTheDocument();
    expect(screen.getByText("Basketball Game")).toBeInTheDocument();
  });

  /**
   * @test Displays event details correctly
   * @precondition fetch returns event with date, location, and ticket count
   * @postcondition Event details are rendered with correct labels
   * @contract Each event must display: date, location, and available tickets
   */
  test("Displays event details correctly", async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText("Tiger Football Game")).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Date: 2025-11-15/)).toBeInTheDocument();
    expect(screen.getByText(/Location: Memorial Stadium/)).toBeInTheDocument();
    expect(screen.getByText(/Tickets Available: 100/)).toBeInTheDocument();
  });

  /**
   * @test Handles fetch error gracefully
   * @precondition fetch rejects with network error
   * @postcondition Error is logged, app doesn't crash
   * @contract App must handle fetch failures without breaking UI
   */
  test("Handles fetch error gracefully", async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    fetch.mockRejectedValueOnce(new Error("Network error"));
    
    render(<App />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    consoleErrorSpy.mockRestore();
  });
});

/**
 * Test Suite: App Event Cards
 * @description Tests rendering and structure of individual event cards
 * @precondition Events have been fetched and rendered
 */
describe("App Event Cards", () => {
  
  /**
   * @test Renders correct number of event cards
   * @precondition 3 events returned from API
   * @postcondition Exactly 3 article elements rendered
   * @contract Number of event cards must match number of fetched events
   */
  test("Renders correct number of event cards", async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText("Tiger Football Game")).toBeInTheDocument();
    });
    
    const eventCards = screen.getAllByRole("article");
    expect(eventCards).toHaveLength(3);
  });

  /**
   * @test Each event card has required information
   * @precondition Event cards are rendered
   * @postcondition Each card contains date, location, and ticket labels
   * @contract Event cards must use semantic article tags and display all info
   */
  test("Each event card has required information", async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText("Tiger Football Game")).toBeInTheDocument();
    });
    
    const cards = screen.getAllByRole("article");
    const firstCard = cards[0];
    
    expect(firstCard).toHaveTextContent("Date:");
    expect(firstCard).toHaveTextContent("Location:");
    expect(firstCard).toHaveTextContent("Tickets Available:");
  });
});

/**
 * Test Suite: App Ticket Purchase
 * @description Tests ticket purchasing functionality and state updates
 * @precondition Events are displayed with varying ticket availability
 */
describe("App Ticket Purchase", () => {
  
  /**
   * @test Buy button is enabled when tickets available
   * @precondition Event has tickets_available > 0
   * @postcondition Buy button is enabled and clickable
   * @contract Button must be enabled only when tickets are available
   */
  test("Buy button is enabled when tickets available", async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText("Tiger Football Game")).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole("button");
    const buyButton = buttons.find(btn => 
      btn.textContent === "Buy Ticket" && 
      btn.getAttribute("aria-label")?.includes("Tiger Football Game")
    );
    
    expect(buyButton).toBeTruthy();
    expect(buyButton).not.toBeDisabled();
  });

  /**
   * @test Buy button is disabled when sold out
   * @precondition Event has tickets_available === 0
   * @postcondition Button shows sold out and is disabled
   * @contract Sold out events must have disabled buttons with clear text
   */
  test("Buy button is disabled when sold out", async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText("Basketball Game")).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole("button");
    const soldOutButton = buttons.find(btn => 
      btn.textContent === "Sold Out" && 
      btn.getAttribute("aria-label")?.includes("Basketball Game")
    );
    
    expect(soldOutButton).toBeTruthy();
    expect(soldOutButton).toBeDisabled();
  });

  /**
   * @test Clicking buy button makes POST request
   * @precondition Buy button is clicked
   * @postcondition POST request sent to /api/events/:id/purchase
   * @contract Purchase must send POST to correct endpoint with event ID
   * 
   * @contract Expected request format:
   * POST http://localhost:6001/api/events/1/purchase
   * method: "POST"
   */
  test("Clicking buy button makes POST request", async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText("Tiger Football Game")).toBeInTheDocument();
    });
    
    // Clear previous fetch calls
    fetch.mockClear();
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Ticket purchased" })
    });
    
    const buttons = screen.getAllByRole("button");
    const buyButton = buttons.find(btn => 
      btn.textContent === "Buy Ticket" && 
      btn.getAttribute("aria-label")?.includes("Tiger Football Game")
    );
    
    fireEvent.click(buyButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:6001/api/events/1/purchase",
        expect.objectContaining({
          method: "POST"
        })
      );
    });
    
    alertMock.mockRestore();
  });

  /**
   * @test Ticket count decrements after successful purchase
   * @precondition Event has 100 tickets, purchase succeeds
   * @postcondition UI shows 99 tickets remaining
   * @contract Ticket count must decrement by 1 immediately after purchase
   * @contract Prevents showing stale data before refetch
   */
  test("Ticket count decrements after successful purchase", async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Tickets Available: 100/)).toBeInTheDocument();
    });
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Ticket purchased" })
    });
    
    const buttons = screen.getAllByRole("button");
    const buyButton = buttons.find(btn => 
      btn.textContent === "Buy Ticket" && 
      btn.getAttribute("aria-label")?.includes("Tiger Football Game")
    );
    
    fireEvent.click(buyButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Tickets Available: 99/)).toBeInTheDocument();
    });
    
    alertMock.mockRestore();
  });

  /**
   * @test Shows success alert after purchase
   * @precondition Purchase request succeeds
   * @postcondition Alert displays "Ticket purchased successfully!"
   * @contract User must receive confirmation feedback via alert
   */
  test("Shows success alert after purchase", async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText("Tiger Football Game")).toBeInTheDocument();
    });
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Success" })
    });
    
    const buttons = screen.getAllByRole("button");
    const buyButton = buttons.find(btn => 
      btn.textContent === "Buy Ticket" && 
      btn.getAttribute("aria-label")?.includes("Tiger Football Game")
    );
    
    fireEvent.click(buyButton);
    
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Ticket purchased successfully!");
    });
    
    alertMock.mockRestore();
  });

  /**
   * @test Shows error alert on purchase failure
   * @precondition Purchase request fails (ok: false)
   * @postcondition Alert displays "Failed to purchase ticket"
   * @contract User must be notified of purchase failures
   * @contract Error handling prevents silent failures
   */
  test("Shows error alert on purchase failure", async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText("Tiger Football Game")).toBeInTheDocument();
    });
    
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Not enough tickets" })
    });
    
    const buttons = screen.getAllByRole("button");
    const buyButton = buttons.find(btn => 
      btn.textContent === "Buy Ticket" && 
      btn.getAttribute("aria-label")?.includes("Tiger Football Game")
    );
    
    fireEvent.click(buyButton);
    
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Failed to purchase ticket");
    });
    
    alertMock.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});

describe("App Accessibility", () => {
  
  /**
   * @test Buy buttons have proper ARIA labels
   * @precondition Button is rendered for available event
   * @postcondition Button has descriptive aria-label including event name
   * @contract Buttons must have ARIA labels for screen reader users
   * @contract Format: "Buy ticket for [Event Name]"
   */
  test("Buy buttons have proper ARIA labels", async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText("Tiger Football Game")).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole("button");
    const buyButton = buttons.find(btn => 
      btn.getAttribute("aria-label") === "Buy ticket for Tiger Football Game"
    );
    
    expect(buyButton).toBeTruthy();
  });

  /**
   * @test Sold out buttons have proper ARIA labels
   * @precondition Button is rendered for sold-out event
   * @postcondition Button has informative aria-label about unavailability
   * @contract Disabled buttons must explain why they're disabled
   * @contract Format: No more tickets available for event name
   */
  test("Sold out buttons have proper ARIA labels", async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText("Basketball Game")).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole("button");
    const soldOutButton = buttons.find(btn => 
      btn.getAttribute("aria-label") === "No more tickets available for Basketball Game"
    );
    
    expect(soldOutButton).toBeTruthy();
  });

  /**
   * @test Main content is within proper semantic structure
   * @precondition App renders HTML structure
   * @postcondition Main content wrapped in main landmark with class
   * @contract App must use semantic HTML5 landmarks for navigation
   * @contract Main content must be identifiable by screen readers
   */
  test("Main content is within proper semantic structure", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
    
    const main = screen.getByRole('main');
    expect(main).toHaveClass("App-main");
  });
});

/**
 * Test Suite: App State Management
 * @description Tests React state initialization and updates
 * @precondition App component uses useState for events
 */
describe("App State Management", () => {
  
  /**
   * @test Events state initializes as empty array
   * @precondition Component mounts, fetch hasn't resolved
   * @postcondition Loading message displayed (events.length === 0)
   * @contract State must initialize empty to prevent undefined errors
   */
  test("Events state initializes as empty array", async () => {
    // Delay the fetch to catch the loading state
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => []
        }), 100)
      )
    );
    
    render(<App />);
    expect(screen.getByText(/Loading events/i)).toBeInTheDocument();
  });

  /**
   * @test Events state updates after fetch
   * @precondition Fetch resolves with event data
   * @postcondition Loading message removed, events displayed
   * @contract State must update when fetch promise resolves
   * @contract UI must reflect current state
   */
  test("Events state updates after fetch", async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading events/i)).not.toBeInTheDocument();
    });
    
    expect(screen.getByText("Tiger Football Game")).toBeInTheDocument();
  });
});

/**
 * Test Suite: App LLM Component Integration
 * @description Tests integration with LLM chatbot component
 * @precondition LLM component is mocked to avoid side effects
 */
describe("App LLM Component Integration", () => {
  
  /**
   * @test LLM component is rendered
   * @precondition App mounts and includes LLM component
   * @postcondition Mock LLM div is present in DOM
   * @contract App must render LLM component for booking assistance
   * @contract LLM receives events and setEvents props (verified by no errors)
   */
  test("LLM component is rendered", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-llm")).toBeInTheDocument();
    });
  });
});