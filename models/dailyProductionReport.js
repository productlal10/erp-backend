// const { DataTypes } = require("sequelize");
// const sequelize = require("../database");

// const DailyProductionReport = sequelize.define(
//   "daily_production_report",
//   {
//     dpr_id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true, 
//       comment: "Unique identifier for the Daily Production Report.",
//     },
//     // Foreign Key linking to the Vendor PO Line Item (the source of production)
//     vendor_line_item_id: { 
//       type: DataTypes.STRING, // Must match the data type of the key in VendorPOLineItem
//       allowNull: false,
//       references: {
//         model: "vendorpolineitem", // This must match the table name
//         key: "vendor_line_item_id",
//       },
//       comment: "The Vendor PO Line Item this production report belongs to.",
//     },
//     quantity: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 0,
//       comment: "Quantity produced or reported for the current cycle.",
//     },
//     // Denormalized fields copied from the Vendor PO Line Item during creation:
//     buyer_po_number: { type: DataTypes.STRING },
//     colour: { type: DataTypes.STRING },
//     style_number: { type: DataTypes.STRING },
//     item_name: { type: DataTypes.STRING },
//     sku_code: { type: DataTypes.STRING },
    
//     remarks: { type: DataTypes.TEXT, comment: "Any remarks related to the daily production status." },
    
//     // Additional DPR specific fields
//     dpr_code: { type: DataTypes.STRING, comment: "Unique code generated on creation." },
//     reported_on: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW,
//       comment: "The date the production was reported.",
//     }
//   },
//   { 
//     tableName: "daily_production_report", 
//     timestamps: false,
//     comment: "Records the daily production quantity against specific Vendor PO Line Items."
//   }
// );

// module.exports = DailyProductionReport;



/////


const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const DailyProductionReport = sequelize.define(
  "daily_production_report",
  {
    dpr_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Unique identifier for the Daily Production Report.",
    },
    vendor_line_item_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "vendorpolineitem",
        key: "vendor_line_item_id",
      },
      comment: "The Vendor PO Line Item this production report belongs to.",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    buyer_po_number: { type: DataTypes.STRING },
    vendor_po_number: { type: DataTypes.STRING },
    colour: { type: DataTypes.STRING },
    style_number: { type: DataTypes.STRING },
    item_name: { type: DataTypes.STRING },
    sku_code: { type: DataTypes.STRING },
    vendor_name: { type: DataTypes.STRING },
    buyer_name: { type: DataTypes.STRING },
    vendor_code: { type: DataTypes.STRING },
    buyer_code: { type: DataTypes.STRING },
    remarks: { type: DataTypes.TEXT },
    dpr_code: { type: DataTypes.STRING },
    reported_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "daily_production_report",
    timestamps: false,
  }
);

DailyProductionReport.afterCreate(async (dpr) => {
  await dpr.update({ dpr_code: `DPR_${dpr.dpr_id}` });
});



module.exports = DailyProductionReport;
