const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const KpiAlert = sequelize.define('KpiAlert', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    recorded_value: {
      type: DataTypes.DECIMAL(14,4),
      allowNull: false
    },
    target_value: DataTypes.DECIMAL(14,4),
    threshold: DataTypes.DECIMAL(14,4),
    condition: DataTypes.STRING(10)
  }, {
    tableName: 'kpi_alerts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return KpiAlert;
};
