const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const VendorPO = sequelize.define("VendorPO", {
  vendor_po_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  vendor_id: { type: DataTypes.INTEGER },
  system_po_id: { type: DataTypes.INTEGER },
  buyer_po_number: { type: DataTypes.STRING, unique: true },
  vendor_po_no: { type: DataTypes.STRING },
  order_type: { type: DataTypes.STRING },
  sampling_type:{type: DataTypes.STRING},
  sampling_purpose:{type:DataTypes.STRING},
  status: { type: DataTypes.STRING },
  vendor_company_name: { type: DataTypes.STRING },
  vendor_name: { type: DataTypes.STRING },
  vendor_code: { type: DataTypes.STRING },
  primary_email_id: { type: DataTypes.STRING },
  payment_terms: { type: DataTypes.STRING },
  requested_by: { type: DataTypes.STRING },
  buyer_company_name: { type: DataTypes.STRING },
  purchase_order_date: { type: DataTypes.DATE },
  expected_delivery_date: { type: DataTypes.DATE },
  sub_total: { type: DataTypes.DECIMAL(12,2) },
  shipping_cost: { type: DataTypes.DECIMAL(12,2) },
  discount: { type: DataTypes.DECIMAL(12,2) },
  total_amount: { type: DataTypes.DECIMAL(12,2) },
  terms_and_conditions: { type: DataTypes.TEXT },
  vendor_address:{type: DataTypes.TEXT},
}, {
  tableName: "vendor_po",
  timestamps: false
});

module.exports = VendorPO;
