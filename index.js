// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const routes = require('./routes');
// // const errorHandler = require('./middlewares/errorHandler');
// const { connect } = require('./config/db');

// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI;
// const SESSION_SECRET = process.env.SESSION_SECRET;

// (async () => {
//   try {
//     await connect();

//     const app = express();
//     app.use(bodyParser.json());

//     app.use('/', routes);
//     // app.use(errorHandler);

//     app.get("/", (req, res) => {
//   res.send("Backend is running...");
// });

//     app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
//   } catch (e) {
//     console.error('Failed to start server', e);
//     process.exit(1);
//   }
// })();

const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const routes = require('./routes');
const {connect:connectDB} = require('./config/db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

connectDB();

app.use(routes);

app.get('/', (req, res) => {
  res.send("Backend of Wallet is running...")
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})

