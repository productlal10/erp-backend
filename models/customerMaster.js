const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const CustomerMaster = sequelize.define(
  "CustomerMaster",
  {
    customer_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_code: { type: DataTypes.STRING, allowNull: false, unique: true },
    salutation: { type: DataTypes.STRING },
    first_name: { type: DataTypes.STRING },
    last_name: { type: DataTypes.STRING },
    company_name: { type: DataTypes.STRING },
    customer_type: { type: DataTypes.STRING },
    display_name: { type: DataTypes.STRING },
    payment_terms: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    username: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    attachment: { type: DataTypes.STRING },
    currency: { type: DataTypes.STRING },
    brand_pin: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    billing_address: { type: DataTypes.TEXT },
    billing_country: { type: DataTypes.STRING },
    billing_city: { type: DataTypes.STRING },
    billing_pincode: { type: DataTypes.STRING },
    gst_treatment: { type: DataTypes.STRING },
    pan_no: { type: DataTypes.STRING },
    tax_preference: { type: DataTypes.STRING },
    gstin_no:{type:DataTypes.STRING },
    state_name:{type:DataTypes.STRING},
    state_name1:{type:DataTypes.STRING},
    shipping_address: { type: DataTypes.TEXT },
    shipping_country: { type: DataTypes.STRING },
    shipping_city: { type: DataTypes.STRING },
    shipping_pincode: { type: DataTypes.STRING },
    account_number: { type: DataTypes.STRING },
    account_holder_name: { type: DataTypes.STRING },
    bank_name: { type: DataTypes.STRING },
    branch_address: { type: DataTypes.TEXT },
    ifsc_code: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  { tableName: "customer_master", timestamps: false }
);

module.exports = CustomerMaster;
