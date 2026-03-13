const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config({ path: '../.env' });

// Ensure the database connection is initialized on startup
require('./config/db');

const Employee = require('./models/Employee');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running' });
});

// Simple database test endpoint
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find().limit(10).select('firstName lastName email');
    res.json({ employees });
  } catch (error) {
    res.status(500).json({ error: 'Failed to query employees', details: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
