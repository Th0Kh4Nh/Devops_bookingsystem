const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/bookingsystem';

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Đã kết nối tới MongoDB'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// 1. ÉP KIỂU CHUỖI ĐỂ DIỆT LỖI MÚI GIỜ
const bookingSchema = new mongoose.Schema({
  customerName: String,
  phoneNumber: String,
  pitchName: String,
  bookingDate: String, // Chỉ lưu "2026-05-27"
  startTime: String,   // Chỉ lưu "17:00"
  endTime: String,     // Chỉ lưu "18:30"
  status: { type: String, default: 'Đã đặt' }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { customerName, phoneNumber, pitchName, bookingDate, startTime, endTime } = req.body;

    if (!customerName || !pitchName || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ error: 'Vui lòng điền đủ thông tin!' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ error: 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc!' });
    }

    // 2. THUẬT TOÁN CHỐNG TRÙNG LỊCH CHUẨN
    const conflictingBooking = await Booking.findOne({
      pitchName: pitchName,
      bookingDate: bookingDate,
      status: 'Đã đặt',
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ error: 'Sân này đã có người đặt trong giờ đó!' });
    }

    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server: ' + err.message });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});