const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectMongo = require('./src/utils/db');
const authRoutes = require('./src/routes/auth');
const pcRoutes = require('./src/routes/pc');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const frontendOrigin = process.env.CORS_ORIGIN || '*';

app.use(cors({
  origin: frontendOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectMongo();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Campus PC Monitoring backend is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/pc', pcRoutes);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint not found.' });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
