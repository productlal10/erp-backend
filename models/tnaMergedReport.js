const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const TNAMergedReport = sequelize.define("tna_merged_reports", {
  tna_id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true, },
  line_item_id: { type: DataTypes.INTEGER, allowNull: false,},
  remarks: {type: DataTypes.TEXT, },
  created_at: {type: DataTypes.DATE,defaultValue: DataTypes.NOW, },
  tna_code: { type: DataTypes.STRING, },
  buyer_po_number: { type: DataTypes.STRING, },
  item_name: { type: DataTypes.STRING,},
  style_number: { type: DataTypes.STRING, },
  sku_code: {type: DataTypes.STRING,},
  buyer_order_date: { type: DataTypes.DATE, },
  tna_overall_status: {type: DataTypes.STRING,},
}, {
  timestamps: false,
});

module.exports = TNAMergedReport;
