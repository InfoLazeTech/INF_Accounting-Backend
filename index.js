require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { connect } = require('./config/db');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

(async () => {
  try {
    await connect();

    const app = express();
    app.use(bodyParser.json());

    app.use('/', routes);
    app.use(errorHandler);

    app.get("/", (req, res) => {
  res.send("Backend is running...");
});

    app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
  } catch (e) {
    console.error('Failed to start server', e);
    process.exit(1);
  }
})();
