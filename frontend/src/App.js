import logo from './logo.png';
import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('http://localhost:6001/api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error fetching events:', err));
  }, []);

  //Handle buying a ticket
  const buyTicket = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:6001/api/events/${eventId}/purchase`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to purchase ticket');
      
      //update ticket in UI
      setEvents(prev => prev.map(ev => ev.event_id === eventId ? { ...ev, event_tickets: ev.event_tickets - 1 } : ev));
      alert('Ticket purchased successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to purchase ticket');
    }
  };

  return (
    <div className="App">
      {/* Header Section */}
      <header className="App-header">
        <img src={logo} className="App-logo" alt="" aria-hidden="true" />
        <h1>TigerTix Event Tickets</h1>
      </header>

      {/* Main Content */}
      <main className="App-main">
        {events.length === 0 ? (
          <p>Loading events...</p>
        ) : (
          events.map(ev => (
            <div key={ev.event_id} className="event-card">
              <h3>{ev.event_name}</h3>
              <p>Date: {ev.event_date}</p>
              <p>Tickets Available: {ev.event_tickets}</p>

              <button onClick={() => buyTicket(ev.event_id)}
               disabled={ev.event_tickets === 0}
                aria-label={
                  ev.event_tickets > 0
                    ?'Buy ticket for '+ev.event_name
                    :'No more tickets available for '+ev.event_name
                }
                >
                {ev.event_tickets > 0 ? 'Buy Ticket' : 'Sold Out'}
              </button>
            </div>
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="App-footer">
        <p>© 2025 TigerTix. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
