import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import axios from 'axios';
import './Reminders.css';

function Reminders() {
  const [reminder, setReminder] = useState({ time: '', message: '' });

  const handleChange = (e) => {
    setReminder({ ...reminder, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/users/reminders', reminder, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Reminder set successfully!');
    } catch (error) {
      console.error('Error setting reminder:', error);
      alert('Failed to set reminder.');
    }
  };

  return (
    <div className="reminders-page">
      <Header />
      <div className="reminders-content">
        <h2>Set a Reminder</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="time"
            placeholder="Time (e.g., 14:00)"
            value={reminder.time}
            onChange={handleChange}
          />
          <input
            type="text"
            name="message"
            placeholder="Reminder Message"
            value={reminder.message}
            onChange={handleChange}
          />
          <button type="submit">Set Reminder</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default Reminders;
