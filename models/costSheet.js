const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const CostSheet = sequelize.define(
  "CostSheet",
  {
    cost_sheet_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cost_sheet_code: { type: DataTypes.STRING, unique: true },
    item_id: { type: DataTypes.INTEGER },
    customer_id: { type: DataTypes.INTEGER },
    order_type:{type:DataTypes.STRING },
    buyer_name: { type: DataTypes.STRING },
    style_number: { type: DataTypes.STRING },
    category_name: { type: DataTypes.STRING },
    currency_master: { type: DataTypes.STRING },
    exchange_rate: { type: DataTypes.DECIMAL(10, 4) },
    cost_price: { type: DataTypes.DECIMAL(12, 2) },
    final_price: { type: DataTypes.DECIMAL(10, 2) },
    gp: { type: DataTypes.DECIMAL(10, 2) },
    total_gp: { type: DataTypes.DECIMAL(10, 2) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "cost_sheet", timestamps: false }
);

module.exports = CostSheet;
