const mongoose = require('mongoose');

async function connect() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,

  });
  console.log('MongoDB connected');
}

module.exports = { connect, mongoose };
