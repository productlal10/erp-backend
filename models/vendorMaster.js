const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const VendorMaster = sequelize.define(
  "VendorMaster",
  {
    vendor_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vendor_code: { type: DataTypes.STRING, allowNull: false, unique: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    vendor_first_name: { type: DataTypes.STRING },
    vendor_last_name: { type: DataTypes.STRING },
    company_name: { type: DataTypes.STRING },
    primary_contact_email: { type: DataTypes.STRING },
    vendor_display_name: { type: DataTypes.STRING },
    primary_contact_mobile_number: { type: DataTypes.STRING },
    gst_type: { type: DataTypes.STRING },
    primary_gst_no: { type: DataTypes.STRING },
    billing_address: { type: DataTypes.TEXT },
    billing_street: { type: DataTypes.STRING },
    billing_country: { type: DataTypes.STRING },
    billing_city: { type: DataTypes.STRING },
    billing_state: { type: DataTypes.STRING },
    billing_pin_code: { type: DataTypes.STRING },
    billing_phone: { type: DataTypes.STRING },
    shipping_address: { type: DataTypes.TEXT },
    shipping_street: { type: DataTypes.STRING },
    shipping_country: { type: DataTypes.STRING },
    shipping_city: { type: DataTypes.STRING },
    shipping_state: { type: DataTypes.STRING },
    shipping_pin_code: { type: DataTypes.STRING },
    shipping_phone: { type: DataTypes.STRING },
    account_number: { type: DataTypes.STRING },
    account_type: { type: DataTypes.STRING },
    account_holder_name: { type: DataTypes.STRING },
    branch_address: { type: DataTypes.TEXT },
    bank_name: { type: DataTypes.STRING },
    ifsc_code: { type: DataTypes.STRING },
  },
  { tableName: "vendor_master", timestamps: false }
);

module.exports = VendorMaster;
