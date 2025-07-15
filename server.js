const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

app.use('/auth', require('./routes/authRoutes'));

app.listen(5000, () => console.log('Server running at http://localhost:5000'));
