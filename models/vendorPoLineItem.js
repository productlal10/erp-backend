const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const VendorPOLineItem = sequelize.define("VendorPOLineItem", {
  vendor_line_item_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  vendor_po_id: { type: DataTypes.INTEGER }, // FK
  item_id: { type: DataTypes.INTEGER },
  item_name: { type: DataTypes.STRING },
  style_number: { type: DataTypes.STRING },
  sku_code: { type: DataTypes.STRING },
  units_of_measure: { type: DataTypes.STRING },
  rate: { type: DataTypes.DECIMAL(12,2) },
  quantity: { type: DataTypes.INTEGER },
  apply_taxes: { type: DataTypes.STRING },
  gst_treatment: { type: DataTypes.INTEGER },
  amount: { type: DataTypes.DECIMAL(12,2) },
  vendor_po_number: { type: DataTypes.STRING }
}, {
  tableName: "vendor_po_line_item",
  timestamps: false
});

module.exports = VendorPOLineItem;
