// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sportstalent';

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('Mongo error:', err));

app.use('/auth', require('./routes/auth'));
app.use('/tests', require('./routes/tests'));
app.use('/user', require('./routes/user'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
