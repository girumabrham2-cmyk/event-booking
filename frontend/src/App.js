import { useEffect, useState } from "react";

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("https://event-booking-udyx.onrender.com/events")
      .then(res => res.json())
      .then(data => setEvents(JSON.parse(data)));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Event Booking</h1>

      {events.map(event => (
        <div key={event._id} style={{ border: "1px solid #ccc", margin: 10 }}>
          <h3>{event.title}</h3>
          <p>{event.date}</p>
          <p>Price: ${event.price}</p>
          <button>Book Now</button>
        </div>
      ))}
    </div>
  );
}

export default App;