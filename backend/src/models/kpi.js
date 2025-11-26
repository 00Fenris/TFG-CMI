const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Kpi = sequelize.define('Kpi', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(400),
      allowNull: false
    },
    description: DataTypes.TEXT,
    formula: DataTypes.TEXT,
    frequency: {
      type: DataTypes.STRING(50),
      defaultValue: 'monthly'
    },
    unit: {
      type: DataTypes.STRING(50),
      defaultValue: 'number'
    },
    current_value: DataTypes.DECIMAL(14,4),
    target_value: DataTypes.DECIMAL(14,4),
    alert_condition: {
      type: DataTypes.STRING(10),
      defaultValue: 'below'
    },
    alert_threshold: DataTypes.DECIMAL(14,4)
  }, {
    tableName: 'kpis',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Kpi;
};
