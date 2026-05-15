require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { sequelize } = require('./src/models');
const setupSocket = require('./src/socket');

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
setupSocket(httpServer);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    await sequelize.sync({ alter: true });
    console.log('Database synced');
    httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('=== SERVER STARTUP FAILED ===');
    console.error('Error:', err.message);
    console.error('DB_HOST:', process.env.DB_HOST || '(not set — will use SQLite)');
    console.error('DB_NAME:', process.env.DB_NAME || '(not set)');
    console.error('DB_USER:', process.env.DB_USER || '(not set)');
    console.error('DB_PASSWORD:', process.env.DB_PASSWORD ? '(set)' : '(not set)');
    process.exit(1);
  }
}

start();
