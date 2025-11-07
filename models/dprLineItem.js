const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const DPRLineItem = sequelize.define("DPRLineItem", {
  dpr_line_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  dpr_id: { type: DataTypes.INTEGER, allowNull: false },
  dpr_code: { type: DataTypes.STRING },

  dpr_date: { type: DataTypes.DATEONLY },
  style_number: { type: DataTypes.STRING },
  vendor_po_number: { type: DataTypes.STRING },

  units_produced: { type: DataTypes.INTEGER, defaultValue: 0 },
  cutting: { type: DataTypes.INTEGER, defaultValue: 0 },
  stitching: { type: DataTypes.INTEGER, defaultValue: 0 },
  finishing: { type: DataTypes.INTEGER, defaultValue: 0 },
  packaging: { type: DataTypes.INTEGER, defaultValue: 0 },
  defects: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: "dpr_line_item", // ✅ Correct table
  timestamps: false
});

module.exports = DPRLineItem;
