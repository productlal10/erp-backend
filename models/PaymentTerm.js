const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const PaymentTerm = sequelize.define(
  "PaymentTerm",
  {
    payment_term_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    payment_term_name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  { 
    tableName: "payment_terms", 
    timestamps: false 
  }
);

module.exports = PaymentTerm;