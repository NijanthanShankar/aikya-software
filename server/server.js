require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const setupSocket = require('./src/socket');

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
setupSocket(httpServer);

async function start() {
  try {
    await connectDB();
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('=== SERVER STARTUP FAILED ===');
    console.error('Error:', err.message);
    console.error('MONGODB_URI:', process.env.MONGODB_URI ? '(set)' : '(NOT SET — add this in Render environment variables)');
    process.exit(1);
  }
}

start();
