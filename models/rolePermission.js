const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const RolePermission = sequelize.define(
  "RolePermission",
  {
    role: { type: DataTypes.STRING, primaryKey: true },
    access: { type: DataTypes.JSON },
  },
  { tableName: "role_permission", timestamps: false }
);

module.exports = RolePermission;
