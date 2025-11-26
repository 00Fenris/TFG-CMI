const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Objective = sequelize.define('Objective', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(400),
      allowNull: false,
    },
    description: DataTypes.TEXT,
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'active'
    },
    due_date: DataTypes.DATE
  }, {
    tableName: 'objectives',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Objective;
};
