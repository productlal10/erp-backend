const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const StateMaster = sequelize.define(
  "StateMaster",
  {
    state_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    state_name: { type: DataTypes.STRING, allowNull: false },
    state_code: { type: DataTypes.STRING, allowNull: false }
  },
  {
    tableName: "state_master",
    timestamps: false
  }
);

module.exports = StateMaster;