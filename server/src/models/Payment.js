const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR',
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  merchantTransactionId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  phonepeTransactionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  gatewayResponse: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'payments',
});

module.exports = Payment;
