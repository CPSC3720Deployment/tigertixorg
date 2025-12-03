
// import LLM from "./llm.js";  
// import logo from "./logo.png";
// import Login from "./login.js";
// import "./App.css";
// import { useState, useEffect } from "react";

// /**
//  * App component
//  * @component
//  * @returns {JSX.Element} Rendered application with header, main event list, and footer
//  * @type {[Array<Object>, Function]}
//  * @description State to hold event data fetched from the backend
//  * Each event object has: { event_id, event_name, event_date, event_tickets }
//  */

// function App() {
//   const [events, setEvents] = useState([]);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     fetch("http://localhost:6001/api/events")
//       .then((res) => res.json())
//       .then((data) => setEvents(data))
//       .catch((err) => console.error("Error fetching events:", err));
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       // Validate token with /me
//       fetch("http://localhost:8001/api/me", {
//         headers: { Authorization: `Bearer ${token}` }
//       })
//         .then(res => res.ok ? res.json() : Promise.reject())
//         .then(data => setUser(data))
//         .catch(() => localStorage.removeItem("token"));
//     }
//   }, []);

//   /**
//    * Handles ticket purchase for a specific event
//    * 
//    * @async
//    * @function
//    * @param {number} eventId - ID of the event for which to purchase a ticket
//    * @param {string} eventName - Name of the event
//    * @returns {Promise<void>}
//    */

//      const buyTicket = async (eventId, eventName) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`http://localhost:6001/api/events/${eventId}/purchase`, { 
//         method: 'POST', 
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to purchase ticket');
//       }
      
//       setEvents(prev => prev.map(ev => 
//         ev.event_id === eventId 
//           ? { ...ev, event_tickets: Math.max(0, ev.event_tickets - 1) } 
//           : ev
//       ));
      
//       alert('Ticket purchased successfully!');
      
//     } catch (err) {
//       console.error(err);
//       alert('Failed to purchase ticket');
//     }
//   };

//   if (events.length === 0) {
//   return <p>Loading events...</p>;
// }

// if (!user) {
//     return(
//        <Login
//         onLogin={(token) => {
//   localStorage.setItem("token", token);
//   fetch("http://localhost:8001/api/me", {
//     headers: { Authorization: `Bearer ${token}` }
//   })
//     .then(res => {
//       if (!res.ok) throw new Error("Invalid token");
//       return res.json();
//     })
//     .then(data => setUser(data))
//     .catch(err => {
//       console.error("Token validation failed:", err);
//       localStorage.removeItem("token");
//       alert("Login failed. Please try again.");
//     });
// }}
//      />
//     );
//   }

//   /* @returns {JSX.Element} The main UI layout for the TigerTix app.
//   *  @description Renders the TigerTix interface including:
//   *  - **Header:** Displays the logo (decorative, aria-hidden) and app title.
//   *  - **Main Section:** Lists all events. Each event card includes details and a ticket button
//   *    with dynamic text ("Buy Ticket"/"Sold Out") and ARIA labels for accessibility.
//   *  - **Footer:** Shows © 2025 TigerTix. All rights reserved.
//   */

//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="" aria-hidden="true" />
//         <h1>TigerTix Event Tickets</h1>
//           <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
//             <span>Hi, {user?.username || user?.email}!</span>
//             <button
//               onClick={() => {
//                 localStorage.removeItem("token");
//                 setUser(null);
//               }}
//               style={{ padding: "0.5rem 1rem", background: "#e53e3e", color: "white", border: "none", borderRadius: "4px" }}
//             >
//               Logout
//             </button>
//           </div>
//       </header>

//       {/* Main Content */}
//       <main className="App-main">
//         <LLM events={events} setEvents={setEvents} />

//         {events.length === 0 ? (
//           <p>Loading events...</p>
//         ) : (
//           <ul style={{ listStyle: "none", padding: 0 }}>
//             {events.map((ev) => (
//               <li key={ev.event_id} className="event-card">
//                 <article>
//                   <h3>{ev.event_name}</h3>
//                   <p>Date: {ev.event_date}</p>
//                   <p>Location: {ev.event_location}</p>
//                   <p>Tickets Available: {ev.event_tickets}</p>

//                   <button
//                     onClick={() => buyTicket(ev.event_id, ev.event_name)}
//                     disabled={ev.event_tickets === 0}
//                     aria-label={
//                       ev.event_tickets > 0
//                         ? "Buy ticket for " + ev.event_name
//                         : "No more tickets available for " + ev.event_name
//                     }
//                   >
//                     {ev.event_tickets > 0 ? "Buy Ticket" : "Sold Out"}
//                   </button>
//                 </article>
//               </li>
//             ))}
//           </ul>
//         )}
//       </main>

//       {/* Footer */}
//       <footer className="App-footer">
//         <p>&copy; 2025 TigerTix. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// }

// export default App;


// import LLM from "./llm.js";  
// import logo from "./logo.png";
// import Login from "./login.js";
// import "./App.css";
// import { useState, useEffect } from "react";

/**
 * App component
 * @component
 * @returns {JSX.Element} Rendered application with header, main event list, and footer
 * @type {[Array<Object>, Function]}
 * @description State to hold event data fetched from the backend
 * Each event object has: { event_id, event_name, event_date, event_tickets }
 */

function App() {
  const CLIENT_API = process.env.REACT_APP_CLIENT_API;
  const AUTH_API = process.env.REACT_APP_AUTH_API;

  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${CLIENT_API}/api/events`)
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Error fetching events:", err));
  }, [CLIENT_API]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Validate token with /me
      fetch(`${AUTH_API}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setUser(data))
        .catch(() => localStorage.removeItem("token"));
    }
  }, [AUTH_API]);

  /**
   * Handles ticket purchase for a specific event
   * 
   * @async
   * @function
   * @param {number} eventId - ID of the event for which to purchase a ticket
   * @param {string} eventName - Name of the event
   * @returns {Promise<void>}
   */

  const buyTicket = async (eventId, eventName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${CLIENT_API}/api/events/${eventId}/purchase`, { 
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase ticket');
      }
      
      setEvents(prev => prev.map(ev => 
        ev.event_id === eventId 
          ? { ...ev, event_tickets: Math.max(0, ev.event_tickets - 1) } 
          : ev
      ));
      
      alert('Ticket purchased successfully!');
      
    } catch (err) {
      console.error(err);
      alert('Failed to purchase ticket');
    }
  };

  if (events.length === 0) {
    return <p>Loading events...</p>;
  }

  if (!user) {
    return(
      <Login
        onLogin={(token) => {
          localStorage.setItem("token", token);
          fetch(`${AUTH_API}/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => {
              if (!res.ok) throw new Error("Invalid token");
              return res.json();
            })
            .then(data => setUser(data))
            .catch(err => {
              console.error("Token validation failed:", err);
              localStorage.removeItem("token");
              alert("Login failed. Please try again.");
            });
        }}
      />
    );
  }

  /* @returns {JSX.Element} The main UI layout for the TigerTix app.
   *  @description Renders the TigerTix interface including:
   *  - **Header:** Displays the logo (decorative, aria-hidden) and app title.
   *  - **Main Section:** Lists all events. Each event card includes details and a ticket button
   *    with dynamic text ("Buy Ticket"/"Sold Out") and ARIA labels for accessibility.
   *  - **Footer:** Shows © 2025 TigerTix. All rights reserved.
   */

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="" aria-hidden="true" />
        <h1>TigerTix Event Tickets</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
          <span>Hi, {user?.username || user?.email}!</span>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              setUser(null);
            }}
            style={{ padding: "0.5rem 1rem", background: "#e53e3e", color: "white", border: "none", borderRadius: "4px" }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="App-main">
        <LLM events={events} setEvents={setEvents} />

        {events.length === 0 ? (
          <p>Loading events...</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {events.map((ev) => (
              <li key={ev.event_id} className="event-card">
                <article>
                  <h3>{ev.event_name}</h3>
                  <p>Date: {ev.event_date}</p>
                  <p>Location: {ev.event_location}</p>
                  <p>Tickets Available: {ev.event_tickets}</p>

                  <button
                    onClick={() => buyTicket(ev.event_id, ev.event_name)}
                    disabled={ev.event_tickets === 0}
                    aria-label={
                      ev.event_tickets > 0
                        ? "Buy ticket for " + ev.event_name
                        : "No more tickets available for " + ev.event_name
                    }
                  >
                    {ev.event_tickets > 0 ? "Buy Ticket" : "Sold Out"}
                  </button>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Footer */}
      <footer className="App-footer">
        <p>&copy; 2025 TigerTix. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
