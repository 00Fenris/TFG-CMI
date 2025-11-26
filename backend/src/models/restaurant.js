const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Restaurant = sequelize.define('Restaurant', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true
    },
    city: DataTypes.STRING(100),
    address: DataTypes.TEXT,
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'open'
    }
  }, {
    tableName: 'restaurants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Restaurant;
};
