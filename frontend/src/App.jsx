import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    pitchName: '',
    startTime: '',
    endTime: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // ===== FETCH ALL BOOKINGS =====
  const fetchBookings = async () => {
    try {
      setError('');
      const response = await fetch(`${API_URL}/bookings`);

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.statusText}`);
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err.message);
      setError('Failed to load bookings. Please try again.');
    }
  };

  // ===== USE EFFECT - FETCH BOOKINGS ON MOUNT =====
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== HANDLE FORM INPUT CHANGE =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  // ===== CREATE BOOKING =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form data
    if (!formData.customerName || !formData.pitchName || !formData.startTime || !formData.endTime) {
      setError('All fields are required');
      return;
    }

    // Validate time logic
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      setError('End time must be after start time');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          pitchName: formData.pitchName,
          startTime: formData.startTime,
          endTime: formData.endTime
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create booking: ${response.statusText}`);
      }

      const newBooking = await response.json();
      setBookings((prevBookings) => [newBooking, ...prevBookings]);
      
      // Reset form
      setFormData({
        customerName: '',
        pitchName: '',
        startTime: '',
        endTime: ''
      });

      console.log('Booking created successfully:', newBooking);
    } catch (err) {
      console.error('Error creating booking:', err.message);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== CANCEL BOOKING =====
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setError('');
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel booking: ${response.statusText}`);
      }

      setBookings((prevBookings) => prevBookings.filter((booking) => booking._id !== bookingId));
      console.log('Booking cancelled successfully:', bookingId);
    } catch (err) {
      console.error('Error cancelling booking:', err.message);
      setError('Failed to cancel booking. Please try again.');
    }
  };

  // ===== FORMAT DATE TIME FOR DISPLAY =====
  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container">
      <h1 className="title">Football Pitch Booking System</h1>

      {/* ===== ERROR ALERT ===== */}
      {error && (
        <div className="error-alert">
          {error}
          <button className="close-btn" onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* ===== BOOKING FORM ===== */}
      <div className="form-section">
        <h2>Create a Booking</h2>
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="customerName">Customer Name:</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              placeholder="Enter customer name"
              value={formData.customerName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pitchName">Pitch Name:</label>
            <input
              type="text"
              id="pitchName"
              name="pitchName"
              placeholder="Enter pitch name"
              value={formData.pitchName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Start Time:</label>
            <input
              type="datetime-local"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time:</label>
            <input
              type="datetime-local"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Booking'}
          </button>
        </form>
      </div>

      {/* ===== BOOKINGS LIST ===== */}
      <div className="bookings-section">
        <h2>Current Bookings</h2>
        {bookings.length === 0 ? (
          <p className="no-bookings">No bookings available</p>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-details">
                  <p>
                    <strong>Customer:</strong> {booking.customerName}
                  </p>
                  <p>
                    <strong>Pitch:</strong> {booking.pitchName}
                  </p>
                  <p>
                    <strong>Start:</strong> {formatDateTime(booking.startTime)}
                  </p>
                  <p>
                    <strong>End:</strong> {formatDateTime(booking.endTime)}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className="status-badge">{booking.status}</span>
                  </p>
                </div>
                <button
                  className="cancel-btn"
                  onClick={() => handleCancelBooking(booking._id)}
                >
                  Cancel Booking
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
