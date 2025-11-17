/**
 * @description Unit and integration tests for the Login component.
 * Covers rendering, form validation, registration, login, error handling,
 * and accessibility using Jest and React Testing Library.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../../login";

/**
 * @module global.fetch
 * Mocked fetch API for simulating HTTP requests.
 */
global.fetch = jest.fn();

/**
 * Mock alert function to prevent actual alerts during tests.
 * @type {jest.Mock}
 */
global.alert = jest.fn();

/**
 * Resets all mocks before each test.
 * Sets up default fetch responses.
 * @returns {void}
 */
beforeEach(() => {
  fetch.mockClear();
  global.alert.mockClear();
  
  // Default mock response
  fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ 
      message: "Success",
      token: "mock-jwt-token-12345"
    })
  });
});

/**
 * @testSuite Login Component Rendering
 * Tests initial render state and UI elements.
 */
describe("Login Component Rendering", () => {
  
  test("Renders login form by default", () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    expect(screen.getByText("Log In")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email or Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  test("Shows 'Don't have an account?' text on login screen", () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  test("All form inputs have proper aria-labels for accessibility", () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    expect(screen.getByLabelText("Email or Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  test("Password field has type='password'", () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    const passwordInput = screen.getByPlaceholderText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});

/**
 * @testSuite Toggle Between Login and Register
 * Tests switching between login and registration forms.
 */
describe("Toggle Between Login and Register", () => {
  
  test("Switches to registration form when 'Register' is clicked", () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    const registerLink = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerLink);
    
    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  test("Switches back to login form when 'Log In' is clicked", () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    // Switch to register
    const registerLink = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerLink);
    
    // Switch back to login
    const loginLink = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginLink);
    
    expect(screen.getByText("Log In")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Username")).not.toBeInTheDocument();
  });

  test("Clears form when switching between login and register", () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    // Type in login form
    const identifierInput = screen.getByPlaceholderText("Email or Username");
    fireEvent.change(identifierInput, { target: { value: "testuser" } });
    
    // Switch to register
    const registerLink = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerLink);
    
    // Check all fields are empty
    expect(screen.getByPlaceholderText("Username").value).toBe("");
    expect(screen.getByPlaceholderText("Email").value).toBe("");
    expect(screen.getByPlaceholderText("Password").value).toBe("");
  });

  test("Clears error message when switching forms", () => {
    const mockOnLogin = jest.fn();
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid credentials" })
    });
    
    render(<Login onLogin={mockOnLogin} />);
    
    // Try to login (will fail)
    const identifierInput = screen.getByPlaceholderText("Email or Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /log in/i });
    
    fireEvent.change(identifierInput, { target: { value: "test" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });
    fireEvent.click(submitButton);
    
    // Wait for error to appear
    waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
    
    // Switch to register
    const registerLink = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerLink);
    
    // Error should be cleared
    expect(screen.queryByText("Invalid credentials")).not.toBeInTheDocument();
  });
});

/**
 * @testSuite Registration Form Tests
 * Tests registration functionality and validation.
 */
describe("Registration Form Tests", () => {
  
  test("Registration form has all required fields", () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    // Switch to register
    const registerLink = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerLink);
    
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  test("All registration fields are marked as required", () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    const registerLink = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerLink);
    
    expect(screen.getByPlaceholderText("Username")).toBeRequired();
    expect(screen.getByPlaceholderText("Email")).toBeRequired();
    expect(screen.getByPlaceholderText("Password")).toBeRequired();
  });

  test("Email field has type='email'", () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    const registerLink = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerLink);
    
    const emailInput = screen.getByPlaceholderText("Email");
    expect(emailInput).toHaveAttribute("type", "email");
  });

  test("Successful registration shows alert and switches to login", async () => {
    const mockOnLogin = jest.fn();
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        message: "User registered successfully",
        user: { id: 1, username: "newuser", email: "new@example.com" }
      })
    });
    
    render(<Login onLogin={mockOnLogin} />);
    
    // Switch to register
    const registerLink = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerLink);
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "newuser" }
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "new@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });
    
    // Submit
    const submitButton = screen.getByRole("button", { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Account created! Please log in.");
    });
    
    // Should switch back to login form
    await waitFor(() => {
      expect(screen.getByText("Log In")).toBeInTheDocument();
    });
    
    // Form should be cleared
    expect(screen.getByPlaceholderText("Email or Username").value).toBe("");
    expect(screen.getByPlaceholderText("Password").value).toBe("");
  });

  test("Registration sends correct data to API", async () => {
    const mockOnLogin = jest.fn();
    
    render(<Login onLogin={mockOnLogin} />);
    
    // Switch to register
    const registerLink = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerLink);
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "testuser" }
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "securepass123" }
    });
    
    // Submit
    const submitButton = screen.getByRole("button", { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8001/api/register",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "testuser",
            email: "test@example.com",
            password: "securepass123"
          })
        })
      );
    });
  });

  test("Shows error message when registration fails", async () => {
    const mockOnLogin = jest.fn();
    
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Username or email already exists" })
    });
    
    render(<Login onLogin={mockOnLogin} />);
    
    // Switch to register
    const registerLink = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerLink);
    
    // Fill and submit
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "existinguser" }
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "existing@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });
    
    const submitButton = screen.getByRole("button", { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText("Username or email already exists")).toBeInTheDocument();
    });
  });

  test("Does not call onLogin after successful registration", async () => {
    const mockOnLogin = jest.fn();
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        message: "User registered successfully",
        user: { id: 1, username: "newuser", email: "new@example.com" }
      })
    });
    
    render(<Login onLogin={mockOnLogin} />);
    
    const registerLink = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerLink);
    
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "newuser" }
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "new@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });
    
    const submitButton = screen.getByRole("button", { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalled();
    });
    
    // onLogin should NOT be called after registration
    expect(mockOnLogin).not.toHaveBeenCalled();
  });
});

/**
 * @testSuite Login Form Tests
 * Tests login functionality and validation.
 */
describe("Login Form Tests", () => {
  
  test("Login form accepts text input", () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    const identifierInput = screen.getByPlaceholderText("Email or Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    
    fireEvent.change(identifierInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    
    expect(identifierInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("password123");
  });

  test("Successful login calls onLogin with token", async () => {
    const mockOnLogin = jest.fn();
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        message: "Login successful",
        token: "jwt-token-abc123"
      })
    });
    
    render(<Login onLogin={mockOnLogin} />);
    
    fireEvent.change(screen.getByPlaceholderText("Email or Username"), {
      target: { value: "testuser" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });
    
    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith("jwt-token-abc123");
    });
  });

  test("Login sends correct data to API", async () => {
    const mockOnLogin = jest.fn();
    
    render(<Login onLogin={mockOnLogin} />);
    
    fireEvent.change(screen.getByPlaceholderText("Email or Username"), {
      target: { value: "myuser" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "mypass456" }
    });
    
    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8001/api/login",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: "myuser",
            password: "mypass456"
          })
        })
      );
    });
  });

  test("Shows error message when login fails", async () => {
    const mockOnLogin = jest.fn();
    
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid credentials" })
    });
    
    render(<Login onLogin={mockOnLogin} />);
    
    fireEvent.change(screen.getByPlaceholderText("Email or Username"), {
      target: { value: "wronguser" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" }
    });
    
    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
    
    // onLogin should not be called
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  test("Error message clears when user types in form", async () => {
    const mockOnLogin = jest.fn();
    
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid credentials" })
    });
    
    render(<Login onLogin={mockOnLogin} />);
    
    // Cause error
    fireEvent.change(screen.getByPlaceholderText("Email or Username"), {
      target: { value: "test" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "test" }
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    
    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
    
    // Type in field
    fireEvent.change(screen.getByPlaceholderText("Email or Username"), {
      target: { value: "test2" }
    });
    
    // Error should be cleared
    expect(screen.queryByText("Invalid credentials")).not.toBeInTheDocument();
  });
});

/**
 * @testSuite Loading State Tests
 * Tests loading state and button disabling.
 */
describe("Loading State Tests", () => {
  
  test("Submit button shows 'Loading…' during request", async () => {
    const mockOnLogin = jest.fn();
    
    // Delay the fetch response
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ token: "abc123" })
        }), 100)
      )
    );
    
    render(<Login onLogin={mockOnLogin} />);
    
    fireEvent.change(screen.getByPlaceholderText("Email or Username"), {
      target: { value: "test" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "test" }
    });
    
    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);
    
    // Should show loading text
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    
    // Button should be disabled
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  test("Button is disabled during registration", async () => {
    const mockOnLogin = jest.fn();
    
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ 
            message: "User registered successfully",
            user: { id: 1, username: "test", email: "test@test.com" }
          })
        }), 100)
      )
    );
    
    render(<Login onLogin={mockOnLogin} />);
    
    const registerLink = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerLink);
    
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "test" }
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@test.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "test123" }
    });
    
    const submitButton = screen.getByRole("button", { name: /register/i });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalled();
    });
  });
});

/**
 * @testSuite Error Handling Tests
 * Tests various error scenarios.
 */
describe("Error Handling Tests", () => {
  
  test("Handles network error gracefully", async () => {
    const mockOnLogin = jest.fn();
    
    fetch.mockRejectedValueOnce(new Error("Network error"));
    
    render(<Login onLogin={mockOnLogin} />);
    
    fireEvent.change(screen.getByPlaceholderText("Email or Username"), {
      target: { value: "test" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "test" }
    });
    
    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  test("Shows validation error for missing fields during registration", async () => {
    const mockOnLogin = jest.fn();
    
    render(<Login onLogin={mockOnLogin} />);
    
    const registerLink = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerLink);
    
    // Try to submit empty form
    const submitButton = screen.getByRole("button", { name: /register/i });
    fireEvent.click(submitButton);
    
    // HTML5 validation should prevent submission
    // The form should not call fetch
    expect(fetch).not.toHaveBeenCalled();
  });

  test("Shows validation error for missing fields during login", async () => {
    const mockOnLogin = jest.fn();
    
    render(<Login onLogin={mockOnLogin} />);
    
    // Try to submit empty form
    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);
    
    // HTML5 validation should prevent submission
    expect(fetch).not.toHaveBeenCalled();
  });
});