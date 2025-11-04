
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const sequelize = require("./database");
const { DataTypes, Op } = require("sequelize");
require("dotenv").config();

const app = express();

// =========================
// PostgreSQL Pool for Session Storage
// =========================
const pgPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// =========================
// Middlewares
// =========================
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET || "my_super_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`\nIncoming request: ${req.method} ${req.url}`);
  console.log("Body:", req.body);
  console.log("Session:", req.session);
  next();
});

// ================= Models =================

// System PO
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

// Buyer PO Line Item
const BuyerPOLineItem = sequelize.define("BuyerPOLineItem", {
  line_item_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  system_po_id: { type: DataTypes.INTEGER },
  item_id: { type: DataTypes.INTEGER },
  cost_sheet_id: { type: DataTypes.INTEGER },
  cost_sheet_code: { type: DataTypes.STRING(50) },
  quantity: { type: DataTypes.INTEGER },
  rate: { type: DataTypes.DECIMAL(12,2) },
  amount: { type: DataTypes.DECIMAL(12,2) },
  remarks: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  po_number: { type: DataTypes.STRING(100) },
  item_name: { type: DataTypes.STRING(255) },
  style_number: { type: DataTypes.STRING(50) },
  units_of_measure: { type: DataTypes.STRING(50) },
  apply_taxes: { type: DataTypes.STRING(10) },
  gst_treatment: { type: DataTypes.STRING(50) },
  sku_code: { type: DataTypes.STRING(50) }
}, {
  tableName: "buyer_po_line_item",
  timestamps: false
});

// TNA Merged Report model
const TNAMergedReport = sequelize.define("tna_merged_reports", {
  tna_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  line_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  remarks: {
    type: DataTypes.TEXT,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  tna_code: {
    type: DataTypes.STRING,
  },
  buyer_po_number: {
    type: DataTypes.STRING,
  },
  item_name: {
    type: DataTypes.STRING,
  },
  style_number: {
    type: DataTypes.STRING,
  },
  sku_code: {
    type: DataTypes.STRING,
  },
  buyer_order_date: {
    type: DataTypes.DATE,
  },
  tna_overall_status: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: false,
});



// Association
SystemPO.hasMany(BuyerPOLineItem, { foreignKey: "system_po_id", as: "items" });
BuyerPOLineItem.belongsTo(SystemPO, { foreignKey: "system_po_id" });
TNAMergedReport.belongsTo(BuyerPOLineItem, {foreignKey: "line_item_id",as: "buyerLineItem",});


// ================= VENDOR PO MODEL =================

const VendorPO = sequelize.define("VendorPO", {
  vendor_po_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  vendor_id: { type: DataTypes.INTEGER },
  system_po_id: { type: DataTypes.INTEGER },
  buyer_po_number: { type: DataTypes.STRING, unique: true },
  vendor_po_no: { type: DataTypes.STRING },
  order_type: { type: DataTypes.STRING },
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
}, {
  tableName: "vendor_po",
  timestamps: false
});



// ================= VENDOR PO LINE ITEM MODEL =================


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
  amount: { type: DataTypes.DECIMAL(12,2) },
  vendor_po_number: { type: DataTypes.STRING }
}, {
  tableName: "vendor_po_line_item",
  timestamps: false
});



// ================= ASSOCIATIONS =================
// VendorPO.hasMany(VendorPOLineItem, { foreignKey: "vendor_po_no", sourceKey: "vendor_po_no", as: "items" });
// VendorPOLineItem.belongsTo(VendorPO, { foreignKey: "vendor_po_no", targetKey: "vendor_po_no" });

VendorPO.hasMany(VendorPOLineItem, { foreignKey: "vendor_po_id", sourceKey: "vendor_po_id", as: "items" });
VendorPOLineItem.belongsTo(VendorPO, { foreignKey: "vendor_po_id", targetKey: "vendor_po_id" });



// =========================
// Employee Model
// =========================
const EmployeeMaster = sequelize.define(
  "EmployeeMaster",
  {
    employeeid: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    department: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    username: { type: DataTypes.STRING },
    reportingto: { type: DataTypes.STRING },
    access: { type: DataTypes.JSON },
  },
  { tableName: "employeemaster", timestamps: false }
);

// =========================
// Role-Permission Model
// =========================
const RolePermission = sequelize.define(
  "RolePermission",
  {
    role: { type: DataTypes.STRING, primaryKey: true },
    access: { type: DataTypes.JSON },
  },
  { tableName: "role_permission", timestamps: false }
);

// =========================
// Customer Master Model
// =========================
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

// =========================
// Vendor Master Model
// =========================
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
//////////////////////////

// =========================
// ITEM MASTER MODEL
// =========================
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

// =========================
// COST SHEET MODEL
// =========================
const CostSheet = sequelize.define(
  "CostSheet",
  {
    cost_sheet_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cost_sheet_code: { type: DataTypes.STRING, unique: true },
    item_id: { type: DataTypes.INTEGER },
    customer_id: { type: DataTypes.INTEGER },
    order_type:{type:DataTypes.STRING },
    buyer_name: { type: DataTypes.STRING },
    style_number: { type: DataTypes.STRING },
    category_name: { type: DataTypes.STRING },
    currency_master: { type: DataTypes.STRING },
    exchange_rate: { type: DataTypes.DECIMAL(10, 4) },
    cost_price: { type: DataTypes.DECIMAL(12, 2) },
    final_price: { type: DataTypes.DECIMAL(10, 2) },
    gp: { type: DataTypes.DECIMAL(10, 2) },
    total_gp: { type: DataTypes.DECIMAL(10, 2) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "cost_sheet", timestamps: false }
);


// =========================
// Sync Database
// =========================
sequelize
  .sync()
  .then(() => console.log("✅ Tables synced with PostgreSQL"))
  .catch((err) => console.error("❌ Database sync error:", err));

// =========================
// Middleware: Check Session
// =========================
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  next();
};

// =========================
// LOGIN / LOGOUT / SESSION
// =========================
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await EmployeeMaster.findOne({ where: { username, password } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid username or password." });
    }

    const rolePermission = await RolePermission.findOne({ where: { role: user.role } });

    if (!rolePermission) {
      return res.status(403).json({ success: false, message: "No access permissions defined for this role." });
    }

    const userPayload = {
      id: user.employeeid,
      username: user.username,
      role: user.role,
      access: rolePermission.access,
    };

    req.session.user = userPayload;

    res.status(200).json({ success: true, message: "Login successful.", user: userPayload });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: "An unexpected error occurred." });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Logout Error:", err);
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logged out successfully" });
  });
});

app.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.json({ success: false, message: "No active session" });
  }
});


// ================= Routes =================

// // Create System PO + Line Items
app.post("/systempos", async (req, res) => {
  const { items, ...poData } = req.body;
  try {
    const newPO = await SystemPO.create(poData);
    if (items && items.length > 0) {
      const lineItems = items.map(item => ({
        ...item,
        system_po_id: newPO.system_po_id,
        po_number: poData.po_number,
        cost_sheet_code: item.cost_sheet_code // <-- add this
      }));
      await BuyerPOLineItem.bulkCreate(lineItems);
    }
    res.status(201).json({ success: true, po: newPO });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
    console.error("Error in /systempos POST:", err); 
  }
});

// Generate TNA for an existing System PO
app.post("/systempos/:system_po_id/generate-tna", async (req, res) => {
  const { system_po_id } = req.params;

  try {
    console.log("🔹 Generating TNA for System PO ID:", system_po_id);

    // 1️⃣ Find all line items for this System PO
    const lineItems = await BuyerPOLineItem.findAll({ where: { system_po_id } });

    console.log("🔹 Line items found:", lineItems.length);
    if (!lineItems || lineItems.length === 0) {
      return res.status(400).json({ error: "No line items found for this System PO" });
    }

    // 2️⃣ Prepare TNA records with all required fields
    const tnaRecords = lineItems.map((li, index) => {
      console.log(`🔹 Preparing TNA for line item #${index + 1}:`, li.line_item_id);

      return {
        line_item_id: li.line_item_id,
        buyer_po_number: li.po_number,
        item_name: li.item_name,
        style_number: li.style_number,
        sku_code: li.sku_code,
        buyer_order_date: li.created_at, // or SystemPO's date if needed
        tna_overall_status: "Pending",
        remarks: li.remarks || "",
        tna_code: `TNA_${Date.now()}_${li.line_item_id}`, // unique TNA code
      };
    });

    console.log("🔹 TNA records prepared:", tnaRecords);

    // 3️⃣ Bulk insert into tna_merged_report
    const createdTNA = await TNAMergedReport.bulkCreate(tnaRecords, { returning: true });
    console.log("✅ TNA records created:", createdTNA.length);

    res.status(201).json({
      message: "TNA records created successfully",
      tna_count: createdTNA.length,
      tna_records: createdTNA,
    });

  } catch (err) {
    console.error("❌ Error generating TNA:", err);
    // Show full Sequelize error object if available
    if (err.errors) {
      err.errors.forEach(e => console.error("   •", e.message, "-", e.path));
    }
    res.status(500).json({ error: err.message });
  }
});

// Get all TNA records
app.get("/tna", requireLogin, async (req, res) => {
  try {
    const tnaRecords = await TNAMergedReport.findAll({
      include: [{ model: BuyerPOLineItem, as: "buyerLineItem" }]
    });
    res.json(tnaRecords);
  } catch (err) {
    console.error("Error fetching TNA:", err);
    res.status(500).json({ error: err.message });
  }
});
///////////////
app.get("/tna/:tna_id", requireLogin, async (req, res) => {
  const { tna_id } = req.params;
  try {
    const tna = await TNAMergedReport.findByPk(tna_id, {
      include: [{ model: BuyerPOLineItem, as: "buyerLineItem" }]
    });
    if (!tna) return res.status(404).json({ error: "TNA not found" });
    res.json(tna);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
////////////
app.put("/tna/:tna_id", requireLogin, async (req, res) => {
  const { tna_id } = req.params;
  const { tna_overall_status, remarks } = req.body;

  try {
    const tna = await TNAMergedReport.findByPk(tna_id);
    if (!tna) return res.status(404).json({ error: "TNA not found" });

    tna.tna_overall_status = tna_overall_status || tna.tna_overall_status;
    tna.remarks = remarks || tna.remarks;

    await tna.save();
    res.json({ message: "TNA updated successfully", tna });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/////////////
app.delete("/tna/:tna_id", requireLogin, async (req, res) => {
  const { tna_id } = req.params;
  try {
    const deleted = await TNAMergedReport.destroy({ where: { tna_id } });
    if (!deleted) return res.status(404).json({ error: "TNA not found" });
    res.json({ message: "TNA deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// Get all System POs with items
app.get("/systempos", async (req, res) => {
  try {
    const pos = await SystemPO.findAll({ include: [{ model: BuyerPOLineItem, as: "items" }] });
    res.json(pos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one System PO by id
app.get("/systempos/:id", async (req, res) => {
  try {
    const po = await SystemPO.findByPk(req.params.id, { include: [{ model: BuyerPOLineItem, as: "items" }] });
    if (!po) return res.status(404).json({ error: "System PO not found" });
    res.json(po);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update System PO + Line Items
app.put("/systempos/:id", async (req, res) => {
  const { items, ...poData } = req.body;
  try {
    const po = await SystemPO.findByPk(req.params.id);
    if (!po) return res.status(404).json({ error: "System PO not found" });

    await po.update(poData);

    if (items) {
      // remove old items
      await BuyerPOLineItem.destroy({ where: { system_po_id: po.system_po_id } });
      // add new items
      const newItems = items.map(item => ({
        ...item,
        system_po_id: po.system_po_id,
        po_number: poData.po_number || po.po_number,
        cost_sheet_code: item.cost_sheet_code // <-- add this
      }));
      await BuyerPOLineItem.bulkCreate(newItems);
    }

    res.json({ success: true, po });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error("Error in /systempos POST:", err); 
  }
});

// Delete System PO + cascade items
app.delete("/systempos/:id", async (req, res) => {
  try {
    const po = await SystemPO.findByPk(req.params.id);
    if (!po) return res.status(404).json({ error: "System PO not found" });

    await BuyerPOLineItem.destroy({ where: { system_po_id: po.system_po_id } });
    await po.destroy();

    res.json({ success: true, message: "System PO deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get all Buyer PO Line Items
app.get("/buyer_po_line_items", async (req, res) => {
  try {
    const lineItems = await BuyerPOLineItem.findAll();
    res.json(lineItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Create Vendor PO + Line Items
app.post("/vendorpos", async (req, res) => {
  const { items, ...poData } = req.body;

  try {
    // Step 1: Create the Vendor PO
    const newPO = await VendorPO.create(poData);

    // Step 2: If there are line items
    if (items && items.length > 0) {
      const lineItems = items.map(item => ({
        vendor_po_id: newPO.vendor_po_id, 
        vendor_po_number: newPO.vendor_po_no,           // ✅ FK to VendorPO
        item_id: item.item_id,                       // ✅ Fix: Include item_id
        item_name: item.item_name,
        style_number: item.style_number,
        sku_code: item.sku_code,
        units_of_measure: item.units_of_measure,
        rate: item.rate,
        quantity: item.qty,                          // ✅ Match DB field
        apply_taxes: item.apply_taxes,
        
        //vendor_po_number: item.vendor_po_number || ""
      }));

      // Optional debug log
      console.log("Saving Vendor PO Line Items:", lineItems);

      // Step 3: Bulk insert all line items
      await VendorPOLineItem.bulkCreate(lineItems);
    }

    // Step 4: Return success response
    res.status(201).json({
      success: true,
      message: "Vendor PO created successfully",
      po: newPO
    });
  } catch (err) {
    console.error("Error in /vendorpos POST:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});





// Get all Vendor POs
app.get("/vendorpos", async (req, res) => {
  try {
    const pos = await VendorPO.findAll({ include: [{ model: VendorPOLineItem, as: "items" }] });
    res.json(pos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single Vendor PO by vendor_po_no
app.get("/vendorpos/:vendor_po_no", async (req, res) => {
  try {
    const po = await VendorPO.findByPk(req.params.vendor_po_no, { include: [{ model: VendorPOLineItem, as: "items" }] });
    if (!po) return res.status(404).json({ error: "Vendor PO not found" });
    res.json(po);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Vendor PO + Line Items
app.put("/vendorpos/:vendor_po_no", async (req, res) => {
  const { items, ...poData } = req.body;
  try {
    const po = await VendorPO.findByPk(req.params.vendor_po_no);
    if (!po) return res.status(404).json({ error: "Vendor PO not found" });

    await po.update(poData);

    if (items) {
      await VendorPOLineItem.destroy({ where: { vendor_po_no: po.vendor_po_no } });
      const newItems = items.map(item => ({ ...item, vendor_po_no: po.vendor_po_no }));
      await VendorPOLineItem.bulkCreate(newItems);
    }

    res.json({ success: true, po });
  } catch (err) {
    console.error("Error in /vendorpos PUT:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Vendor PO + Line Items
app.delete("/vendorpos/:vendor_po_no", async (req, res) => {
  try {
    const po = await VendorPO.findByPk(req.params.vendor_po_no);
    if (!po) return res.status(404).json({ error: "Vendor PO not found" });

    await VendorPOLineItem.destroy({ where: { vendor_po_no: po.vendor_po_no } });
    await po.destroy();

    res.json({ success: true, message: "Vendor PO deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// =========================
// EMPLOYEE ROUTES
// =========================
app.post("/employees", requireLogin, async (req, res) => {
  try {
    const lastEmployee = await EmployeeMaster.findOne({
      order: [[sequelize.literal("CAST(SUBSTRING(employeeid, 5) AS INTEGER)"), "DESC"]],
      limit: 1,
      where: { employeeid: { [Op.like]: "EMP_%" } },
    });

    let newEmployeeNumber = 1;
    if (lastEmployee) {
      const lastId = lastEmployee.employeeid;
      const lastNumber = parseInt(lastId.split("_")[1], 10);
      newEmployeeNumber = lastNumber + 1;
    }

    const newEmployeeID = `EMP_${newEmployeeNumber}`;

    const employee = await EmployeeMaster.create({
      employeeid: newEmployeeID,
      name: req.body.name,
      email: req.body.email,
      department: req.body.department,
      role: req.body.role,
      username: req.body.username,
      password: req.body.password,
      reportingto: req.body.reportingTo,
      access: req.body.access,
    });
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/employees", requireLogin, async (req, res) => {
  try {
    const employees = await EmployeeMaster.findAll();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/employees/:id", requireLogin, async (req, res) => {
  try {
    const employee = await EmployeeMaster.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/employees/:id", requireLogin, async (req, res) => {
  try {
    const employee = await EmployeeMaster.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    await employee.update({
      name: req.body.name,
      email: req.body.email,
      department: req.body.department,
      role: req.body.role,
      username: req.body.username,
      password: req.body.password,
      reportingto: req.body.reportingTo,
      access: req.body.access,
    });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/employees/:id", requireLogin, async (req, res) => {
  try {
    const employee = await EmployeeMaster.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    await employee.destroy();
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// CUSTOMER ROUTES (fixed)
// =========================
app.post("/customers", requireLogin, async (req, res) => {
  try {
    const lastCustomer = await CustomerMaster.findOne({
      order: [["customer_id", "DESC"]],
    });

    let newCode;
    if (lastCustomer) {
      const lastNum = parseInt(lastCustomer.customer_code?.split("-")[1], 10) || 1000;
      newCode = `CUST-${lastNum + 1}`;
    } else {
      newCode = "CUST-1001";
    }

    const customer = await CustomerMaster.create({
      customer_code: newCode,
      salutation: req.body.salutation,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      company_name: req.body.companyName,
      customer_type: req.body.customerType,
      email: req.body.primaryEmail,
      display_name: req.body.customerDisplayName,
      payment_terms: req.body.paymentTerms,
      phone: req.body.primaryMobile,
      type: req.body.type,
      username: req.body.userName,
      password: req.body.password,
      attachment: req.body.attachment || null,
      currency: req.body.currency,
      brand_pin: req.body.brandPin,
      billing_address: req.body.billingAddress || "",
      billing_country: req.body.country || "",
      billing_city: req.body.city || "",
      billing_pincode: req.body.pinCode || "",
      shipping_address: req.body.shippingAddress || "",
      shipping_country: req.body.country1 || "",
      shipping_city: req.body.city1 || "",
      shipping_pincode: req.body.pinCode1 || "",
      account_number: req.body.accountNumber || "",
      account_holder_name: req.body.accountHolderName || "",
      bank_name: req.body.bankName || "",
      branch_address: req.body.branchAddress || "",
      ifsc_code: req.body.iFSCCode || "",
    });

    res.status(201).json(customer);
  } catch (err) {
    console.error("Customer creation error:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/customers", requireLogin, async (req, res) => {
  try {
    const customers = await CustomerMaster.findAll();
    res.json(customers);
  } catch (err) {
    console.error("Sequelize Error:", err); // <--- log full error
    res.status(500).json({ error: err.message });
  }
});



app.get("/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await CustomerMaster.findByPk(id);

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // Normalize DB fields (snake_case → camelCase)
    const formatted = {
      customer_id: customer.customer_id,
      customerCode: customer.customer_code,
      salutation: customer.salutation,
      firstName: customer.first_name,
      lastName: customer.last_name,
      companyName: customer.company_name,
      type: customer.type,
      customerDisplayName: customer.display_name,
      primaryEmail: customer.email,
      primaryMobile: customer.phone,
      paymentTerms: customer.payment_terms,
      currency: customer.currency,
      userName:customer.username,
      accountNumber: customer.account_number,
      accountHolderName: customer.account_holder_name,
      bankName: customer.bank_name,
      branchAddress: customer.branch_address,
      iFSCCode: customer.ifsc_code,
      billingAddress: customer.billing_address,
      shippingAddress: customer.shipping_address,
      city: customer.billing_city,
      city1:customer.shipping_city,
      country: customer.billing_country,
      country1:customer.shipping_country,
      pinCode: customer.billing_pincode,
      pinCode1:customer.shipping_city
      
    };

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching customer:", err);
    res.status(500).json({ message: "Server error" });
  }
});





app.put("/customers/:id", requireLogin, async (req, res) => {
  try {
    const customer = await CustomerMaster.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    await customer.update({
      salutation: req.body.salutation,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      company_name: req.body.companyName,
      customer_type: req.body.customerType,
      email: req.body.primaryEmail,
      display_name: req.body.customerDisplayName,
      payment_terms: req.body.paymentTerms,
      phone: req.body.primaryMobile,
      type: req.body.type,
      username: req.body.userName,
      password: req.body.password,
      attachment: req.body.attachment || null,
      currency: req.body.currency,
      brand_pin: req.body.brandPin,
      billing_address: req.body.billingAddress || "",
      billing_country: req.body.country || "",
      billing_city: req.body.city || "",
      billing_pincode: req.body.pinCode || "",
      shipping_address: req.body.shippingAddress || "",
      shipping_country: req.body.country1 || "",
      shipping_city: req.body.city1 || "",
      shipping_pincode: req.body.pinCode1 || "",
      account_number: req.body.accountNumber || "",
      account_holder_name: req.body.accountHolderName || "",
      bank_name: req.body.bankName || "",
      branch_address: req.body.branchAddress || "",
      ifsc_code: req.body.iFSCCode || "",
    });

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/customers/:id", requireLogin, async (req, res) => {
  try {
    const customer = await CustomerMaster.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    await customer.destroy();
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// =========================
// VENDOR ROUTES
// =========================
app.post("/vendors", requireLogin, async (req, res) => {
  try {
    const lastVendor = await VendorMaster.findOne({
      order: [["vendor_id", "DESC"]],
    });

    let newCode;
    if (lastVendor) {
      const lastNum = parseInt(lastVendor.vendor_code?.split("-")[1], 10) || 1000;
      newCode = `VEND-${lastNum + 1}`;
    } else {
      newCode = "VEND-1001";
    }

    const vendor = await VendorMaster.create({
      vendor_code: newCode,
      vendor_first_name: req.body.vendor_first_name,
      vendor_last_name: req.body.vendor_last_name,
      company_name: req.body.company_name,
      primary_contact_email: req.body.primary_contact_email,
      vendor_display_name: req.body.vendor_display_name,
      primary_contact_mobile_number: req.body.primary_contact_mobile_number,
      gst_type: req.body.gst_type,
      primary_gst_no: req.body.primary_gst_no,
      billing_address: req.body.billing_address,
      billing_street: req.body.billing_street,
      billing_country: req.body.billing_country,
      billing_city: req.body.billing_city,
      billing_state: req.body.billing_state,
      billing_pin_code: req.body.billing_pin_code,
      billing_phone: req.body.billing_phone,
      shipping_address: req.body.shipping_address,
      shipping_street: req.body.shipping_street,
      shipping_country: req.body.shipping_country,
      shipping_city: req.body.shipping_city,
      shipping_state: req.body.shipping_state,
      shipping_pin_code: req.body.shipping_pin_code,
      shipping_phone: req.body.shipping_phone,
      account_number: req.body.account_number,
      account_type: req.body.account_type,
      account_holder_name: req.body.account_holder_name,
      branch_address: req.body.branch_address,
      bank_name: req.body.bank_name,
      ifsc_code: req.body.ifsc_code,
    });

    res.status(201).json(vendor);
  } catch (err) {
    console.error("Vendor creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/vendors", requireLogin, async (req, res) => {
  try {
    const vendors = await VendorMaster.findAll();
    res.json(vendors);
  } catch (err) {
    console.error("Sequelize Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/vendors/:id", requireLogin, async (req, res) => {
  try {
    const vendor = await VendorMaster.findByPk(req.params.id);

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Normalize response (snake_case → camelCase)
    const formatted = {
      vendorId: vendor.vendor_id,
      vendorCode: vendor.vendor_code,
      vendorFirstName: vendor.vendor_first_name,
      vendorLastName: vendor.vendor_last_name,
      companyName: vendor.company_name,
      primaryContactEmail: vendor.primary_contact_email,
      vendorDisplayName: vendor.vendor_display_name,
      primaryContactMobileNumber: vendor.primary_contact_mobile_number,
      gstType: vendor.gst_type,
      primaryGstNo: vendor.primary_gst_no,
      billingAddress: vendor.billing_address,
      billingStreet: vendor.billing_street,
      billingCountry: vendor.billing_country,
      billingCity: vendor.billing_city,
      billingState: vendor.billing_state,
      billingPinCode: vendor.billing_pin_code,
      billingPhone: vendor.billing_phone,
      shippingAddress: vendor.shipping_address,
      shippingStreet: vendor.shipping_street,
      shippingCountry: vendor.shipping_country,
      shippingCity: vendor.shipping_city,
      shippingState: vendor.shipping_state,
      shippingPinCode: vendor.shipping_pin_code,
      shippingPhone: vendor.shipping_phone,
      accountNumber: vendor.account_number,
      accountType: vendor.account_type,
      accountHolderName: vendor.account_holder_name,
      branchAddress: vendor.branch_address,
      bankName: vendor.bank_name,
      ifscCode: vendor.ifsc_code,
    };

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching vendor:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/vendors/:id", requireLogin, async (req, res) => {
  try {
    const vendor = await VendorMaster.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    await vendor.update({
      vendor_first_name: req.body.vendor_first_name,
      vendor_last_name: req.body.vendor_last_name,
      company_name: req.body.company_name,
      primary_contact_email: req.body.primary_contact_email,
      vendor_display_name: req.body.vendor_display_name,
      primary_contact_mobile_number: req.body.primary_contact_mobile_number,
      gst_type: req.body.gst_type,
      primary_gst_no: req.body.primary_gst_no,
      billing_address: req.body.billing_address,
      billing_street: req.body.billing_street,
      billing_country: req.body.billing_country,
      billing_city: req.body.billing_city,
      billing_state: req.body.billing_state,
      billing_pin_code: req.body.billing_pin_code,
      billing_phone: req.body.billing_phone,
      shipping_address: req.body.shipping_address,
      shipping_street: req.body.shipping_street,
      shipping_country: req.body.shipping_country,
      shipping_city: req.body.shipping_city,
      shipping_state: req.body.shipping_state,
      shipping_pin_code: req.body.shipping_pin_code,
      shipping_phone: req.body.shipping_phone,
      account_number: req.body.account_number,
      account_type: req.body.account_type,
      account_holder_name: req.body.account_holder_name,
      branch_address: req.body.branch_address,
      bank_name: req.body.bank_name,
      ifsc_code: req.body.ifsc_code,
    });

    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/vendors/:id", requireLogin, async (req, res) => {
  try {
    const vendor = await VendorMaster.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    await vendor.destroy();
    res.json({ message: "Vendor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// ITEM MASTER ROUTES
// =========================
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // store uploaded files temporarily

app.post("/items", requireLogin, upload.single("bom_file"), async (req, res) => {
  try {
    const body = req.body;

    // Validate required field
    if (!body.item_name) {
      return res.status(400).json({ error: "Item Name is required" });
    }

    // Generate unique item_code
    const lastItem = await ItemMaster.findOne({ order: [["item_id", "DESC"]] });
    const nextNumber = lastItem ? lastItem.item_id + 1 : 1;
    const item_code = `ITEM-${nextNumber.toString().padStart(4, "0")}`;

    // Handle file if uploaded
    if (req.file) {
      body.bom_file = req.file.filename; // store file name
    }

    const newItem = await ItemMaster.create({ ...body, item_code });
    res.status(201).json(newItem);

  } catch (err) {
    console.error("Item creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/items", requireLogin, async (req, res) => {
  try {
    const items = await ItemMaster.findAll();
    res.json(items);
  } catch (err) {
    console.error("Sequelize Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/items/:id", requireLogin, async (req, res) => {
  try {
    const item = await ItemMaster.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/items/:id", requireLogin, upload.single("bom_file"), async (req, res) => {
  try {
    const item = await ItemMaster.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const body = req.body;
    if (req.file) body.bom_file = req.file.filename;

    await item.update(body);
    res.json(item);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/items/:id", requireLogin, async (req, res) => {
  try {
    const item = await ItemMaster.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    await item.destroy();
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET all cost sheets
app.get("/costsheets", requireLogin, async (req, res) => {
  try {
    const costsheets = await CostSheet.findAll({ order: [["cost_sheet_id", "DESC"]] });
    res.json(costsheets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET single cost sheet
app.get("/costsheets/:id", requireLogin, async (req, res) => {
  try {
    const cs = await CostSheet.findByPk(req.params.id);
    if (!cs) return res.status(404).json({ error: "Cost sheet not found" });
    res.json(cs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// CREATE cost sheet
app.post("/costsheets", requireLogin, async (req, res) => {
  try {

    console.log("Incoming cost sheet data:", req.body);
    const data = { ...req.body };
    delete data.cost_sheet_id;

    const lastSheet = await CostSheet.findOne({ order: [["cost_sheet_id", "DESC"]] });
    const nextNumber = lastSheet ? lastSheet.cost_sheet_id + 1 : 1;
    data.cost_sheet_code = `CS_${nextNumber}`;

    const newCS = await CostSheet.create(data);
    res.status(201).json(newCS);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE cost sheet
app.put("/costsheets/:id", requireLogin, async (req, res) => {
  try {
    const cs = await CostSheet.findByPk(req.params.id);
    if (!cs) return res.status(404).json({ error: "Cost sheet not found" });

    await cs.update(req.body);
    res.json(cs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE cost sheet
app.delete("/costsheets/:id", requireLogin, async (req, res) => {
  try {
    const cs = await CostSheet.findByPk(req.params.id);
    if (!cs) return res.status(404).json({ error: "Cost sheet not found" });

    await cs.destroy();
    res.json({ message: "Cost sheet deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// ROLE-PERMISSIONS ROUTES (unchanged)
// =========================
app.get("/role-permissions", requireLogin, async (req, res) => {
  try {
    const roles = await RolePermission.findAll();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/role-permissions", requireLogin, async (req, res) => {
  try {
    const { role, access } = req.body;

    if (!role || !access) {
      return res.status(400).json({ error: "Role and access are required" });
    }

    let rolePermission = await RolePermission.findOne({ where: { role } });

    if (rolePermission) {
      await rolePermission.update({ access });
      return res.status(200).json({ message: "Role access updated successfully", rolePermission });
    } else {
      rolePermission = await RolePermission.create({ role, access });
      return res.status(201).json({ message: "Role access created successfully", rolePermission });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// Test Route
// =========================
app.get("/", (req, res) => {
  res.send("Hello from PostgreSQL-backed session ERP backend!");
});

// =========================
// Start Server
// =========================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
