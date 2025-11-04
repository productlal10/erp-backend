const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const ItemMaster = sequelize.define(
  "ItemMaster",
  {
    item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    item_code: { type: DataTypes.STRING, allowNull: false, unique: true },
    is_composite: { type: DataTypes.STRING },
    item_type: { type: DataTypes.STRING },
    warehouse_name: { type: DataTypes.STRING },
    created_by: { type: DataTypes.STRING },
    bom_file: { type: DataTypes.STRING },
    is_fob: { type: DataTypes.STRING },

    category_name: { type: DataTypes.STRING },
    subcategory_name: { type: DataTypes.STRING },
    sub_sub_category: { type: DataTypes.STRING },
    material: { type: DataTypes.STRING },
    colour: { type: DataTypes.STRING },
    craft: { type: DataTypes.STRING },
    lal10_or_outside: { type: DataTypes.STRING },
    size: { type: DataTypes.STRING },

    item_name: { type: DataTypes.STRING },
    item_sku: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    selling_price: { type: DataTypes.DECIMAL(12, 2) },
    cost_price: { type: DataTypes.DECIMAL(12, 2) },
    inventory_quantity: { type: DataTypes.DECIMAL(12, 2) },
    tax_preference: { type: DataTypes.STRING },
    hsn_sac: { type: DataTypes.STRING },
    style_number: { type: DataTypes.STRING },
    buyer_style_ref: { type: DataTypes.STRING },
    usage_units: { type: DataTypes.STRING },
    component_type: { type: DataTypes.STRING },
    
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  { tableName: "item_master", timestamps: false }
);

module.exports = ItemMaster;
