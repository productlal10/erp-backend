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

//Adding some of the new field for the purpose of Updation:-

// ---------------- Greige Fabric Order Section ----------------
  status_greige_fabric_order: { type: DataTypes.STRING },
  expected_date_greige_fabric_order: { type: DataTypes.DATE },
  actual_date_greige_fabric_order: { type: DataTypes.DATE },
  last_modified_date_time_greige_fabric_order: { type: DataTypes.DATE },
  greige_fabric_quantity_ordered: { type: DataTypes.DECIMAL(10, 2) },
  running_status_greige_fabric_order: { type: DataTypes.STRING },

  // ---------------- Greige Fabric In-house Section ----------------
  overall_status_greige_fabric_inhouse: { type: DataTypes.STRING },
  overall_expected_date_greige_fabric_inhouse: { type: DataTypes.DATE },
  overall_actual_date_greige_fabric_inhouse: { type: DataTypes.DATE },
  last_modified_date_time_greige_fabric_inhouse: { type: DataTypes.DATE },
  cumulative_quantity_greige_fabric_inhouse: { type: DataTypes.DECIMAL(10, 2) },
  running_status_greige_fabric_inhouse: { type: DataTypes.STRING },

  // ---------------- Fabric Processing Start Section ----------------
  status_fabric_processing_start: { type: DataTypes.STRING },
  expected_date_fabric_processing_start: { type: DataTypes.DATE },
  actual_date_fabric_processing_start: { type: DataTypes.DATE },
  last_modified_date_time_fabric_processing_start: { type: DataTypes.DATE },
  vendor_po_no_fabric_processing_start: { type: DataTypes.STRING },
  fabric_name_fabric_processing_start: { type: DataTypes.STRING },
  processed_fabric_quantity: { type: DataTypes.DECIMAL(10, 2) },
  running_status_fabric_processing_start: { type: DataTypes.STRING },

  // ---------------- Strike-off / Lab-dip / Desk-loom Section ----------------
  status_strikeoff_labdip_deskloom: { type: DataTypes.STRING },
  expected_date_strikeoff_labdip_deskloom: { type: DataTypes.DATE },
  actual_date_strikeoff_labdip_deskloom: { type: DataTypes.DATE },
  last_modified_date_time_strikeoff_labdip_deskloom: { type: DataTypes.DATE },
  running_status_strikeoff_labdip_deskloom: { type: DataTypes.STRING },

  // ---------------- Yardages In-house Section ----------------
  status_yardages_inhouse: { type: DataTypes.STRING },
  expected_date_yardages_inhouse: { type: DataTypes.DATE },
  actual_date_yardages_inhouse: { type: DataTypes.DATE },
  last_modified_date_time_yardages_inhouse: { type: DataTypes.DATE },
  running_status_yardages_inhouse: { type: DataTypes.STRING },

  // ---------------- Processed Fabric In-house Section ----------------
  overall_status_processed_fabric_inhouse: { type: DataTypes.STRING },
  overall_expected_date_processed_fabric_inhouse: { type: DataTypes.DATE },
  overall_actual_date_processed_fabric_inhouse: { type: DataTypes.DATE },
  last_modified_date_time_processed_fabric_inhouse: { type: DataTypes.DATE },
  cumulative_quantity_processed_fabric_inhouse: { type: DataTypes.DECIMAL(10, 2) },
  running_status_processed_fabric_inhouse: { type: DataTypes.STRING },

  // ---------------- Processed Fabric QC Section ----------------
  overall_status_processed_fabric_qc: { type: DataTypes.STRING },
  overall_expected_date_processed_fabric_qc: { type: DataTypes.DATE },
  overall_actual_date_processed_fabric_qc: { type: DataTypes.DATE },
  last_modified_date_time_processed_fabric_qc: { type: DataTypes.DATE },
  cumulative_quantity_processed_fabric_qc: { type: DataTypes.DECIMAL(10, 2) },
  running_status_processed_fabric_qc: { type: DataTypes.STRING },

  // ---------------- Trims Order Section ----------------
  overall_status_trims_order: { type: DataTypes.STRING },
  overall_expected_date_trims_order: { type: DataTypes.DATE },
  overall_actual_date_trims_order: { type: DataTypes.DATE },
  last_modified_date_time_trims_order: { type: DataTypes.DATE },
  running_status_trims_order: { type: DataTypes.STRING },


}, {
  timestamps: false,
});

module.exports = TNAMergedReport;
