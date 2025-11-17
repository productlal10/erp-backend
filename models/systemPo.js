const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const SystemPO = sequelize.define("SystemPO", {
  system_po_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  po_number: { type: DataTypes.STRING(100) },
  customer_id: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING(50) },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  merchandiser: { type: DataTypes.STRING(255) },
  department: { type: DataTypes.STRING(255) },
  upload_buyer_po: { type: DataTypes.TEXT },
  buyer_name: { type: DataTypes.STRING(255) },
  customer_code: { type: DataTypes.STRING(50) },
  buyer_order_date: { type: DataTypes.DATE },
  expected_delivery_date: { type: DataTypes.DATE },
  buyer_po_reference_number: { type: DataTypes.STRING(100) },
  type_of_buyer_po: { type: DataTypes.STRING(50) },
  payment_term: { type: DataTypes.STRING(255) },
  discount_amount: { type: DataTypes.DECIMAL(12,2) },
  sub_total_amount: { type: DataTypes.DECIMAL(12,2) },
  gst_amount: { type: DataTypes.DECIMAL(12,2) },
  shipping_cost: { type: DataTypes.DECIMAL(12,2) },
  total_amount: { type: DataTypes.DECIMAL(12,2) },
  billing_address: { type: DataTypes.TEXT },
  shipping_address: { type: DataTypes.TEXT }
}, {
  tableName: "system_po",
  timestamps: false
});

module.exports = SystemPO;
