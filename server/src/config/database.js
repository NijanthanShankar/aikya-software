const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// Note: Hostinger docs show createClient but mongodb package exports MongoClient
let client;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  client = new MongoClient(uri);
  await client.connect();
  console.log('MongoDB native client connected');

  await mongoose.connect(uri);
  console.log('Mongoose connected');
};

const getClient = () => client;

module.exports = connectDB;
module.exports.getClient = getClient;
