const { DataTypes } = require("sequelize");
const sequelize = require("../database");
// Removed: const bcrypt = require("bcryptjs"); // Hashing removed

const EmployeeMaster = sequelize.define(
  "EmployeeMaster",
  {
    employeeid: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    department: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING }, // Now stores PLAINTEXT password
    username: { type: DataTypes.STRING },
    reportingto: { type: DataTypes.STRING },
    access: { type: DataTypes.JSON },
  },
  { tableName: "employeemaster", timestamps: false }
);

// Removed HOOKS: Password hashing logic has been removed.

module.exports = EmployeeMaster;
