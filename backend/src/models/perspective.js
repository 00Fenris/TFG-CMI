const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Perspective = sequelize.define('Perspective', {
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
    description: DataTypes.TEXT
  }, {
    tableName: 'perspectives',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Perspective;
};
