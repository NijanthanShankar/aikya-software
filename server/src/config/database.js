const { Sequelize } = require('sequelize');
const path = require('path');

const useMySQL = process.env.DB_HOST && process.env.DB_PASSWORD && process.env.DB_PASSWORD !== 'your_mysql_password_here';

let sequelize;

if (useMySQL) {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    }
  );
  console.log('Using MySQL database');
} else {
  const dbPath = path.join(__dirname, '../../data/aikya_courses.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });
  console.log('Using SQLite database at:', dbPath);
}

module.exports = sequelize;
