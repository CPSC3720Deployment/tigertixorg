import logo from './logo.png';
import './App.css';
import { useEffect, useState } from 'react';

function App() {
  // State to hold events
  const [events, setEvents] = useState([]);

  // Fetch events from client microservice on component mount
  useEffect(() => {
    fetch('http://localhost:6001/api/events') // client microservice port
      .then(response => response.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error fetching events:', err));
  }, []);

  // Handle buying a ticket
  const buyTicket = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:6001/api/events/${eventId}/purchase`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to purchase ticket');
      // Update the UI by decrementing the ticket count locally
      setEvents(prevEvents => prevEvents.map(ev => 
        ev.event_id === eventId 
          ? { ...ev, event_tickets: ev.event_tickets - 1 } 
          : ev
      ));
      alert('Ticket purchased successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to purchase ticket');
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>TigerTix Event Tickets</h1>

        {/* Event List */}
        <div>
          {events.length === 0 ? (
            <p>Loading events...</p>
          ) : (
            events.map(ev => (
              <div key={ev.event_id} style={{ margin: '1rem', border: '1px solid #fff', padding: '1rem', borderRadius: '8px' }}>
                <h3>{ev.event_name}</h3>
                <p>Date: {ev.event_date}</p>
                <p>Tickets Available: {ev.event_tickets}</p>
                <button 
                  onClick={() => buyTicket(ev.event_id)}
                  disabled={ev.event_tickets === 0}
                >
                  {ev.event_tickets > 0 ? 'Buy Ticket' : 'Sold Out'}
                </button>
              </div>
            ))
          )}
        </div>
      </header>
    </div>
  );
}

export default App;