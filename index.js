require('dotenv').config();
const express = require('express');
const cors = require("cors");
const routes = require('./routes');
const { connect: connectDB } = require('./config/db');

const app = express();

app.use(cors());

// Increase payload limit for large base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

connectDB();

app.use('/', routes);

app.get('/', (req, res) => {
  res.send("Backend is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
