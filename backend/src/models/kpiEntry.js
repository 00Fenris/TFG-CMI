const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const KpiEntry = sequelize.define('KpiEntry', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    value: {
      type: DataTypes.DECIMAL(14,4),
      allowNull: false
    },
    period_start: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    note: DataTypes.TEXT
  }, {
    tableName: 'kpi_entries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return KpiEntry;
};
