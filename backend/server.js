require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const employeeRoutes = require('./routes/employees');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('HR Management API is running'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/employees', employeeRoutes);

const PORT = process.env.PORT || 5000;
async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI environment variable');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}
start();
