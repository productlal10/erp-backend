
///////////

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const multer = require("multer"); // Re-added multer import
const sequelize = require("./database"); 
require("dotenv").config();

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
// Import Models
// =========================
const SystemPO = require("./models/systemPo");
const BuyerPOLineItem = require("./models/buyerPoLineItem");
const TNAMergedReport = require("./models/tnaMergedReport");
const VendorPO = require("./models/vendorPo");
const VendorPOLineItem = require("./models/vendorPoLineItem");
const EmployeeMaster = require("./models/employeeMaster");
const RolePermission = require("./models/rolePermission");
const CustomerMaster = require("./models/customerMaster");
const VendorMaster = require("./models/vendorMaster");
const ItemMaster = require("./models/itemMaster");
const CostSheet = require("./models/costSheet");
const DailyProductionReport = require("./models/dailyProductionReport"); // <--- DPR: NEW IMPORT
const DPRLineItem = require("./models/dprLineItem");
const HsnMaster = require("./models/HsnMaster");
const PaymentTerm = require("./models/PaymentTerm");
const PaymentTermMaster = require("./models/PaymentTermMaster");
const StateMaster = require("./models/StateMaster");



// Consolidate models into an object for easy access
const models = {
  SystemPO, BuyerPOLineItem, TNAMergedReport,
  VendorPO, VendorPOLineItem, EmployeeMaster,
  RolePermission, CustomerMaster, VendorMaster,
  ItemMaster, CostSheet,
  DailyProductionReport, // <--- FIX 1: ADDED DPR TO MODELS OBJECT
  DPRLineItem,
  HsnMaster,
  PaymentTerm,
  PaymentTermMaster,
  StateMaster,
};


// =========================
// Define Associations 
// =========================
SystemPO.hasMany(BuyerPOLineItem, { foreignKey: "system_po_id", as: "items" });
BuyerPOLineItem.belongsTo(SystemPO, { foreignKey: "system_po_id" });

TNAMergedReport.belongsTo(BuyerPOLineItem, {foreignKey: "line_item_id",as: "buyerLineItem",});
BuyerPOLineItem.hasMany(TNAMergedReport, {foreignKey: "line_item_id", as: "tnaReports"}); 

VendorPO.hasMany(VendorPOLineItem, { foreignKey: "vendor_po_id", sourceKey: "vendor_po_id", as: "items" });
VendorPOLineItem.belongsTo(VendorPO, { foreignKey: "vendor_po_id", targetKey: "vendor_po_id" });

// --- DPR: CORRECTED ASSOCIATIONS (Linked to VendorPOLineItem) ---
// 1. Link DPR to Vendor Line Item (one Vendor Line Item can have many Daily Production Reports)
VendorPOLineItem.hasMany(DailyProductionReport, { 
  foreignKey: "vendor_line_item_id", 
  as: "dprReports"  // Using common alias for consistency with routes
});
DailyProductionReport.belongsTo(VendorPOLineItem, { 
  foreignKey: "vendor_line_item_id", 
  as: "vendorLineItem" // Using common alias for consistency with routes
});

// 2. Add associations needed for the DPR route to fetch master data
VendorPOLineItem.belongsTo(ItemMaster, { foreignKey: 'item_id', as: 'ItemMaster' }); 
// VendorPOLineItem.belongsTo(VendorPO, { foreignKey: 'vendor_po_id', as: 'VendorPO' }); // <--- FIX 3: REMOVED DUPLICATE ASSOCIATION

// --- DPR -> DPR Line Items Association ---
DailyProductionReport.hasMany(DPRLineItem, {
  foreignKey: "dpr_id",
  as: "items",
});

DPRLineItem.belongsTo(DailyProductionReport, {
  foreignKey: "dpr_id",
  as: "dpr",
});



// =========================
// Middlewares
// =========================
const app = express();
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

// Middleware: Check Session
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  next();
};


// =======================================================
// AUTHENTICATION AND MISC ROUTES (Consolidated)
// =======================================================

// LOGIN (Using Plaintext password check as per your request)
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 1. Find user by matching PLAINTEXT username AND PLAINTEXT password
    // Hashing logic REMOVED. This checks the password directly against the database field.
    const user = await EmployeeMaster.findOne({ where: { username, password } });

    if (!user) {
      // If the combination doesn't exist, return invalid credentials
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

// LOGOUT
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Logout Error:", err);
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// GET SESSION
app.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.json({ success: false, message: "No active session" });
  }
});

// ROLE-PERMISSIONS (GET)
app.get("/role-permissions", requireLogin, async (req, res) => {
  try {
    const roles = await RolePermission.findAll();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROLE-PERMISSIONS (POST/UPDATE)
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
// Import and Mount Module Routes
// =========================
const systemPoRoutes = require("./routes/systemPoRoutes");
const vendorPoRoutes = require("./routes/vendorPoRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const customerRoutes = require("./routes/customerRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const itemRoutes = require("./routes/itemRoutes");
const tnaRoutes = require("./routes/tnaRoutes");
const costSheetRoutes = require("./routes/costSheetRoutes");
const buyerPoRoutes = require("./routes/buyerPoRoutes"); 
const vendorPoLineItemRoutes = require("./routes/vendorPoLineItemRoutes");
const dprRoutes = require("./routes/dprRoutes"); // <--- DPR: NEW ROUTE IMPORT
const hsnRoutes = require("./routes/hsnRoutes");
const paymentTermRoutes = require("./routes/paymentTerms");
const paymentTermMasterRoutes = require("./routes/paymentTermMasterRoutes");
const stateRoutes = require("./routes/stateRoutes");
const forexRoutes = require("./routes/forex");




// Note: Pass models and middleware dependencies to the route functions
app.use("/systempos", systemPoRoutes(models, requireLogin));
app.use("/vendorpos", vendorPoRoutes(models, requireLogin));
// FIX: Ensure sequelize is passed if employeeRoutes.js requires it, to prevent arguments from being misaligned.
app.use("/employees", employeeRoutes(models, sequelize, requireLogin));
app.use("/customers", customerRoutes(models, requireLogin));
app.use("/vendors", vendorRoutes(models, requireLogin));
app.use("/items", itemRoutes(models, requireLogin, multer)); // Passed multer instead of upload
app.use("/tna", tnaRoutes(models, requireLogin)); 
app.use("/costsheets", costSheetRoutes(models, requireLogin));
app.use("/buyer_po_line_items", buyerPoRoutes(models, requireLogin));
// Mounted the Vendor PO Line Item Routes here
app.use("/vendor_po_line_items", vendorPoLineItemRoutes(models, requireLogin)); 
app.use("/dpr", dprRoutes(models, requireLogin)); // <--- FIX 2: REMOVED 'sequelize' ARGUMENT
app.use("/hsn", hsnRoutes(models, requireLogin));
app.use("/payment-terms", paymentTermRoutes(models, requireLogin));
app.use("/payment-term-master", paymentTermMasterRoutes(models, requireLogin));
app.use("/states", stateRoutes(models, requireLogin));
app.use("/forex", forexRoutes);



// =========================
// Sync Database & Start Server
// =========================
sequelize
  .sync()
  .then(() => console.log("✅ Tables synced with PostgreSQL"))
  .catch((err) => console.error("❌ Database sync error:", err));


app.get("/", (req, res) => {
  res.send("Hello from ERP backend! Server is running.");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ ERP Backend listening on port ${PORT}`);
});
