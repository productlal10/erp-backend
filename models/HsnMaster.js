const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const HsnMaster = sequelize.define(
  "HsnMaster",
  {
    hsn_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hsn_code: { type: DataTypes.STRING, allowNull: false, unique: true },

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  { 
    tableName: "hsn_master", 
    timestamps: false 
  }
);

module.exports = HsnMaster;