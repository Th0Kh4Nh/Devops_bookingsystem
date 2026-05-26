import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    pitchName: 'Sân 5 người',
    bookingDate: '',
    startTime: '',
    endTime: ''
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // Tính ngày hôm nay để chặn đặt lùi ngày
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${apiUrl}/bookings`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (response.ok) {
        alert('✅ Đặt sân thành công!');
        fetchBookings();
      } else {
        alert('❌ Lỗi: ' + result.error);
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hủy lịch này?')) return;
    try {
      const response = await fetch(`${apiUrl}/bookings/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Đã hủy!');
        fetchBookings();
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ!');
    }
  };

  return (
    <div className="app-container">
      <h1>Hệ Thống Đặt Sân</h1>
      
      <form onSubmit={handleSubmit} className="booking-form">
        <select name="pitchName" value={formData.pitchName} onChange={handleInputChange}>
          <option value="Sân 5 người">Sân 5 người</option>
          <option value="Sân 7 người">Sân 7 người</option>
        </select>
        
        <input type="text" name="customerName" placeholder="Tên khách" required onChange={handleInputChange} />
        <input type="text" name="phoneNumber" placeholder="SĐT" required onChange={handleInputChange} />
        
        <input type="date" name="bookingDate" required min={today} onChange={handleInputChange} />
        <input type="time" name="startTime" required onChange={handleInputChange} />
        <input type="time" name="endTime" required onChange={handleInputChange} />
        
        <button type="submit">Đặt Sân</button>
      </form>

      <div className="booking-list">
        <h2>Danh sách đặt sân</h2>
        <table>
          <thead>
            <tr>
              <th>Sân</th>
              <th>Khách</th>
              <th>Ngày</th>
              <th>Giờ</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.pitchName}</td>
                <td>{b.customerName}</td>
                <td>{b.bookingDate}</td>
                <td>{b.startTime} - {b.endTime}</td>
                <td>{b.status}</td>
                <td><button onClick={() => handleDelete(b._id)}>Hủy</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;