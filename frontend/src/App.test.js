import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header text', () => {
  render(<App />);
  const headerElement = screen.getByText(/TigerTix Event Tickets/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders AI toggle button', () => {
  render(<App />);
  const toggleButton = screen.getByRole('button', { name: /toggle AI assistant/i });
  expect(toggleButton).toBeInTheDocument();
});

