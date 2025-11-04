const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const BuyerPOLineItem = sequelize.define("BuyerPOLineItem", {
  line_item_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  system_po_id: { type: DataTypes.INTEGER },
  item_id: { type: DataTypes.INTEGER },
  cost_sheet_id: { type: DataTypes.INTEGER },
  cost_sheet_code: { type: DataTypes.STRING(50) },
  quantity: { type: DataTypes.INTEGER },
  rate: { type: DataTypes.DECIMAL(12,2) },
  amount: { type: DataTypes.DECIMAL(12,2) },
  remarks: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  po_number: { type: DataTypes.STRING(100) },
  item_name: { type: DataTypes.STRING(255) },
  style_number: { type: DataTypes.STRING(50) },
  units_of_measure: { type: DataTypes.STRING(50) },
  apply_taxes: { type: DataTypes.STRING(10) },
  gst_treatment: { type: DataTypes.STRING(50) },
  sku_code: { type: DataTypes.STRING(50) }
}, {
  tableName: "buyer_po_line_item",
  timestamps: false
});

module.exports = BuyerPOLineItem;
