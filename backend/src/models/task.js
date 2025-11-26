const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(400),
      allowNull: false
    },
    description: DataTypes.TEXT,
    due_date: DataTypes.DATE,
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'todo'
    },
    priority: {
      type: DataTypes.STRING(20),
      defaultValue: 'normal'
    }
  }, {
    tableName: 'tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Task;
};
