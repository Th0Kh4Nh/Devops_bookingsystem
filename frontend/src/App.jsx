import { useState, useEffect } from 'react';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    pitchName: '',
    bookingDate: '',
    timeSlot: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // ===== PREDEFINED TIME SLOTS =====
  const TIME_SLOTS = [
    { id: 1, label: '17:00 - 18:30', startTime: '17:00', endTime: '18:30' },
    { id: 2, label: '18:30 - 20:00', startTime: '18:30', endTime: '20:00' },
    { id: 3, label: '20:00 - 21:30', startTime: '20:00', endTime: '21:30' }
  ];

  // ===== PITCH OPTIONS =====
  const PITCH_OPTIONS = [
    { id: 1, label: 'Sân 5 người' },
    { id: 2, label: 'Sân 7 người' },
    { id: 3, label: 'Sân 11 người' },
    { id: 4, label: 'Sân Futsal' }
  ];

  // ===== MIN DATE (today) FOR DATE INPUT =====
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const minDate = `${yyyy}-${mm}-${dd}`;

  // ===== FETCH ALL BOOKINGS =====
  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/bookings`);

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const msg = body?.error || `Không thể tải đặt lịch: ${response.statusText}`;
        toast.error(msg);
        return;
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error('Lỗi khi tải đặt lịch:', err.message);
      toast.error('Không thể tải đặt lịch. Vui lòng thử lại.');
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

    if (!formData.customerName || !formData.pitchName || !formData.bookingDate || !formData.timeSlot) {
      toast.error('Tất cả các trường đều bắt buộc');
      return;
    }

    try {
      setLoading(true);

      const selectedSlot = TIME_SLOTS.find(slot => slot.id === parseInt(formData.timeSlot));
      if (!selectedSlot) {
        toast.error('Khung giờ không hợp lệ');
        setLoading(false);
        return;
      }

      const startDateTime = `${formData.bookingDate}T${selectedSlot.startTime}:00`;
      const endDateTime = `${formData.bookingDate}T${selectedSlot.endTime}:00`;

      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          pitchName: formData.pitchName,
          startTime: startDateTime,
          endTime: endDateTime
        })
      });

      const respBody = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = respBody?.error || `Không thể tạo đặt lịch: ${response.statusText}`;
        toast.error(msg);
        return;
      }

      const newBooking = respBody;
      setBookings((prevBookings) => [newBooking, ...prevBookings]);

      setFormData({
        customerName: '',
        pitchName: '',
        bookingDate: '',
        timeSlot: ''
      });

      toast.success('Tạo đặt lịch thành công');
    } catch (err) {
      console.error('Lỗi khi tạo đặt lịch:', err.message);
      toast.error('Không thể tạo đặt lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ===== CANCEL BOOKING =====
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt lịch này không?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = body?.error || `Không thể hủy đặt lịch: ${response.statusText}`;
        toast.error(msg);
        return;
      }

      setBookings((prevBookings) => prevBookings.filter((booking) => booking._id !== bookingId));
      toast.success('Hủy đặt lịch thành công');
    } catch (err) {
      console.error('Lỗi khi hủy đặt lịch:', err.message);
      toast.error('Không thể hủy đặt lịch. Vui lòng thử lại.');
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
      <h1 className="title">HỆ THỐNG ĐẶT LỊCH SÂN BÓNG ĐÁ</h1>

      {/* Toast notifications */}

      {/* ===== BOOKING FORM ===== */}
      <div className="form-section">
        <h2>TẠO ĐẶT LỊCH</h2>
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="customerName">Tên khách hàng:</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              placeholder="Nhập tên khách hàng"
              value={formData.customerName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pitchName">Tên sân:</label>
            <select
              id="pitchName"
              name="pitchName"
              value={formData.pitchName}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Chọn sân --</option>
              {PITCH_OPTIONS.map((pitch) => (
                <option key={pitch.id} value={pitch.label}>
                  {pitch.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bookingDate">Ngày đặt lịch:</label>
            <input
              type="date"
              id="bookingDate"
              name="bookingDate"
              value={formData.bookingDate}
              min={minDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeSlot">Khung giờ:</label>
            <select
              id="timeSlot"
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Chọn khung giờ --</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo Đặt lịch'}
          </button>
        </form>
      </div>

      {/* ===== BOOKINGS LIST ===== */}
      <div className="bookings-section">
        <h2>Đặt lịch hiện tại</h2>
        {bookings.length === 0 ? (
          <p className="no-bookings">Không có đặt lịch nào</p>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-details">
                  <p>
                    <strong>Khách hàng:</strong> {booking.customerName}
                  </p>
                  <p>
                    <strong>Sân:</strong> {booking.pitchName}
                  </p>
                  <p>
                    <strong>Bắt đầu:</strong> {formatDateTime(booking.startTime)}
                  </p>
                  <p>
                    <strong>Kết thúc:</strong> {formatDateTime(booking.endTime)}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{' '}
                    <span className="status-badge">{booking.status}</span>
                  </p>
                </div>
                <button
                  className="cancel-btn"
                  onClick={() => handleCancelBooking(booking._id)}
                >
                  Hủy Đặt lịch
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

export default App;
