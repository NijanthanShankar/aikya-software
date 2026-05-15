const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const useMySQL =
  process.env.DB_HOST &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD &&
  process.env.DB_NAME;

let sequelize;

if (useMySQL) {
  console.log(`Using MySQL: ${process.env.DB_USER}@${process.env.DB_HOST}/${process.env.DB_NAME}`);
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    }
  );
} else {
  const dataDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, 'aikya_courses.sqlite');
  console.log('Using SQLite database at:', dbPath);
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });
}

module.exports = sequelize;
