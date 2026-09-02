require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const busRoutes = require('./routes/busRoutes');
const studentRoutes = require('./routes/studentRoutes');
const driverRoutes = require('./routes/driverRoutes');
const routeRoutes = require('./routes/routeRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const sosRoutes = require('./routes/sosRoutes');

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] },
});
app.set('io', io);

// Real-time channels: clients join rooms per bus/user/school to receive
// locationUpdate, attendanceUpdate, notification, and sosAlert events.
io.on('connection', (socket) => {
  socket.on('joinBus', (busId) => socket.join(`bus:${busId}`));
  socket.on('joinUser', (userId) => socket.join(`user:${userId}`));
  socket.on('joinSchool', (schoolId) => socket.join(`school:${schoolId}`));
  socket.on('disconnect', () => {});
});

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'wheelbuddy-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sos', sosRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`WheelBuddy API running on port ${PORT}`));
