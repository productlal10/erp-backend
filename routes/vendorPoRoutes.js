// const express = require("express");
// const router = express.Router();

// module.exports = (models) => {
//   const { VendorPO, VendorPOLineItem } = models;

//   // Create Vendor PO + Line Items
//   router.post("/", async (req, res) => {
//     const { items, ...poData } = req.body;

//     try {
//       // Step 1: Create the Vendor PO
//       const newPO = await VendorPO.create(poData);

//       // Step 2: If there are line items
//       if (items && items.length > 0) {
//         const lineItems = items.map(item => ({
//           vendor_po_id: newPO.vendor_po_id, 
//           vendor_po_number: newPO.vendor_po_no,
//           item_id: item.item_id,
//           item_name: item.item_name,
//           style_number: item.style_number,
//           sku_code: item.sku_code,
//           units_of_measure: item.units_of_measure,
//           rate: item.rate,
//           quantity: item.qty, // Use 'qty' as per original logic, although 'quantity' is the DB field
//           apply_taxes: item.apply_taxes,
//         }));

//         await VendorPOLineItem.bulkCreate(lineItems);
//       }

//       res.status(201).json({
//         success: true,
//         message: "Vendor PO created successfully",
//         po: newPO
//       });
//     } catch (err) {
//       console.error("Error in POST /vendorpos:", err);
//       res.status(500).json({
//         success: false,
//         error: err.message
//       });
//     }
//   });

//   // Get all Vendor POs
//   router.get("/", async (req, res) => {
//     try {
//       const pos = await VendorPO.findAll({ include: [{ model: VendorPOLineItem, as: "items" }] });
//       res.json(pos);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // Get single Vendor PO by vendor_po_no (using primary key in DB: vendor_po_id, but original code used vendor_po_no in params)
//   router.get("/:id", async (req, res) => { // Changed param name to ID for consistency, assuming it's the PK
//     try {
//       const po = await VendorPO.findByPk(req.params.id, { include: [{ model: VendorPOLineItem, as: "items" }] });
//       if (!po) return res.status(404).json({ error: "Vendor PO not found" });
//       res.json(po);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // Update Vendor PO + Line Items (using vendor_po_id as PK)
//   router.put("/:id", async (req, res) => {
//     const { items, ...poData } = req.body;
//     try {
//       const po = await VendorPO.findByPk(req.params.id);
//       if (!po) return res.status(404).json({ error: "Vendor PO not found" });

//       await po.update(poData);

//       if (items) {
//         // Assuming deletion is based on vendor_po_id, not vendor_po_no as in original monolithic code
//         await VendorPOLineItem.destroy({ where: { vendor_po_id: po.vendor_po_id } });
//         const newItems = items.map(item => ({ ...item, vendor_po_id: po.vendor_po_id }));
//         await VendorPOLineItem.bulkCreate(newItems);
//       }

//       res.json({ success: true, po });
//     } catch (err) {
//       console.error("Error in PUT /vendorpos:", err);
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // Delete Vendor PO + Line Items
//   router.delete("/:id", async (req, res) => {
//     try {
//       const po = await VendorPO.findByPk(req.params.id);
//       if (!po) return res.status(404).json({ error: "Vendor PO not found" });

//       await VendorPOLineItem.destroy({ where: { vendor_po_id: po.vendor_po_id } });
//       await po.destroy();

//       res.json({ success: true, message: "Vendor PO deleted" });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   return router;
// };

///////////////////

// const express = require("express");
// const router = express.Router();

// module.exports = (models, requireLogin) => {
//   const { VendorPO, VendorPOLineItem, DailyProductionReport } = models;

//   // Create Vendor PO + Line Items
//   router.post("/", requireLogin, async (req, res) => {
//     const { items, ...poData } = req.body;

//     try {
//       // Step 1: Create the Vendor PO
//       const newPO = await VendorPO.create(poData);

//       // Step 2: Create Line Items
//       let createdItems = [];
//       if (items && items.length > 0) {
//         const lineItems = items.map(item => ({
//           vendor_po_id: newPO.vendor_po_id,
//           vendor_po_number: newPO.vendor_po_no,
//           item_id: item.item_id,
//           item_name: item.item_name,
//           style_number: item.style_number,
//           sku_code: item.sku_code,
//           units_of_measure: item.units_of_measure,
//           rate: item.rate,
//           quantity: item.qty,
//           apply_taxes: item.apply_taxes,
//         }));

//         createdItems = await VendorPOLineItem.bulkCreate(lineItems, { returning: true });
//       }

//       // ✅ Step 3: Automatically Create DPR for each Line Item
//       if (createdItems.length > 0) {
//         const dprRecords = createdItems.map((li) => ({
//           vendor_line_item_id: li.vendor_line_item_id,
//           vendor_po_number: li.vendor_po_number,
//           item_name: li.item_name,
//           style_number: li.style_number,
//           sku_code: li.sku_code,
//           quantity: 0,
//           remarks: "Initial DPR created automatically after Vendor PO creation.",
//           dpr_code: `DPR_${Date.now()}_${li.vendor_line_item_id}`,
//         }));

//         await DailyProductionReport.bulkCreate(dprRecords);
//       }

//       res.status(201).json({
//         success: true,
//         message: "Vendor PO and DPR created successfully",
//         po: newPO,
//       });
//     } catch (err) {
//       console.error("Error creating Vendor PO:", err);
//       res.status(500).json({ success: false, error: err.message });
//     }
//   });

//   // Get all Vendor POs
//   router.get("/", requireLogin, async (req, res) => {
//     try {
//       const pos = await VendorPO.findAll({
//         include: [{ model: VendorPOLineItem, as: "items" }],
//       });
//       res.json(pos);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // Get single Vendor PO by ID
//   router.get("/:id", requireLogin, async (req, res) => {
//     try {
//       const po = await VendorPO.findByPk(req.params.id, {
//         include: [{ model: VendorPOLineItem, as: "items" }],
//       });
//       if (!po) return res.status(404).json({ error: "Vendor PO not found" });
//       res.json(po);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // Update Vendor PO
//   router.put("/:id", requireLogin, async (req, res) => {
//     const { items, ...poData } = req.body;
//     try {
//       const po = await VendorPO.findByPk(req.params.id);
//       if (!po) return res.status(404).json({ error: "Vendor PO not found" });

//       await po.update(poData);

//       if (items) {
//         await VendorPOLineItem.destroy({ where: { vendor_po_id: po.vendor_po_id } });
//         const newItems = items.map(item => ({ ...item, vendor_po_id: po.vendor_po_id }));
//         const createdItems = await VendorPOLineItem.bulkCreate(newItems, { returning: true });

//         // ✅ Recreate DPR records for new items
//         const dprRecords = createdItems.map(li => ({
//           vendor_line_item_id: li.vendor_line_item_id,
//           vendor_po_number: li.vendor_po_number,
//           item_name: li.item_name,
//           style_number: li.style_number,
//           sku_code: li.sku_code,
//           quantity: 0,
//           remarks: "DPR re-created after Vendor PO update.",
//           dpr_code: `DPR_${Date.now()}_${li.vendor_line_item_id}`,
//         }));

//         await DailyProductionReport.bulkCreate(dprRecords);
//       }

//       res.json({ success: true, po });
//     } catch (err) {
//       console.error("Error updating Vendor PO:", err);
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // Delete Vendor PO
//   router.delete("/:id", requireLogin, async (req, res) => {
//     try {
//       const po = await VendorPO.findByPk(req.params.id);
//       if (!po) return res.status(404).json({ error: "Vendor PO not found" });

//       await VendorPOLineItem.destroy({ where: { vendor_po_id: po.vendor_po_id } });
//       await po.destroy();

//       res.json({ success: true, message: "Vendor PO deleted" });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   return router;
// };
//////////////////////


// const express = require("express");
// const router = express.Router();

// module.exports = (models, requireLogin) => {
//   const { VendorPO, VendorPOLineItem, DailyProductionReport } = models;

//   // ==============================
//   // CREATE VENDOR PO + LINE ITEMS
//   // ==============================
//   router.post("/", requireLogin, async (req, res) => {
//     const { items, ...poData } = req.body;

//     try {
//       // Step 1: Create the Vendor PO
//       const newPO = await VendorPO.create(poData);

//       // Step 2: Create Line Items linked to this Vendor PO
//       let createdItems = [];
//       if (items && items.length > 0) {
//         const lineItems = items.map(item => ({
//           vendor_po_id: newPO.vendor_po_id,
//           vendor_po_number: newPO.vendor_po_no,  // ✅ comes from VendorPO
//           item_id: item.item_id,
//           item_name: item.item_name,
//           style_number: item.style_number,
//           sku_code: item.sku_code,
//           units_of_measure: item.units_of_measure,
//           rate: item.rate,
//           quantity: item.qty,
//           apply_taxes: item.apply_taxes,
//         }));

//         createdItems = await VendorPOLineItem.bulkCreate(lineItems, { returning: true });
//       }

//       //✅ Step 3: Auto-create DPR for each Line Item using VendorPO master data
//       if (createdItems.length > 0) {
//         const dprRecords = createdItems.map((li) => ({
//           vendor_line_item_id: li.vendor_line_item_id,
//           vendor_po_number: newPO.vendor_po_no || "",           // ✅ from VendorPO
//           buyer_po_number: newPO.buyer_po_number || "",          // ✅ from VendorPO
//           vendor_name: newPO.vendor_name || "",                  // ✅ from VendorPO
//           buyer_name: newPO.buyer_company_name || "",            // ✅ from VendorPO
//           vendor_code: newPO.vendor_code || "",                  // ✅ from VendorPO
//           item_name: li.item_name || "",
//           style_number: li.style_number || "",
//           sku_code: li.sku_code || "",
//           quantity: 0,
//           remarks: "Initial DPR created automatically after Vendor PO creation.",
//           dpr_code: `DPR_${Date.now()}_${li.vendor_line_item_id}`,
//         }));

//         await DailyProductionReport.bulkCreate(dprRecords);
//       }

  


//       res.status(201).json({
//         success: true,
//         message: "✅ Vendor PO, Line Items, and DPR created successfully.",
//         po: newPO,
//       });
//     } catch (err) {
//       console.error("❌ Error creating Vendor PO:", err);
//       res.status(500).json({ success: false, error: err.message });
//     }
//   });

//   // ==============================
//   // GET ALL VENDOR POs
//   // ==============================
//   router.get("/", requireLogin, async (req, res) => {
//     try {
//       const pos = await VendorPO.findAll({
//         include: [{ model: VendorPOLineItem, as: "items" }],
//       });
//       res.json(pos);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // ==============================
//   // GET SINGLE VENDOR PO BY ID
//   // ==============================
//   router.get("/:id", requireLogin, async (req, res) => {
//     try {
//       const po = await VendorPO.findByPk(req.params.id, {
//         include: [{ model: VendorPOLineItem, as: "items" }],
//       });
//       if (!po) return res.status(404).json({ error: "Vendor PO not found" });
//       res.json(po);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // ==============================
//   // UPDATE VENDOR PO
//   // ==============================
//   router.put("/:id", requireLogin, async (req, res) => {
//     const { items, ...poData } = req.body;

//     try {
//       const po = await VendorPO.findByPk(req.params.id);
//       if (!po) return res.status(404).json({ error: "Vendor PO not found" });

//       // Update the master VendorPO
//       await po.update(poData);

//       // Refresh line items and DPR
//       if (items && items.length > 0) {
//         await VendorPOLineItem.destroy({ where: { vendor_po_id: po.vendor_po_id } });

//         const newItems = items.map(item => ({
//           vendor_po_id: po.vendor_po_id,
//           vendor_po_number: po.vendor_po_no,
//           item_id: item.item_id,
//           item_name: item.item_name,
//           style_number: item.style_number,
//           sku_code: item.sku_code,
//           units_of_measure: item.units_of_measure,
//           rate: item.rate,
//           quantity: item.qty,
//           apply_taxes: item.apply_taxes,
//         }));

//         const createdItems = await VendorPOLineItem.bulkCreate(newItems, { returning: true });

//         // ✅ Recreate DPR records for new line items
//         const dprRecords = createdItems.map(li => ({
//           vendor_line_item_id: li.vendor_line_item_id,
//           vendor_po_number: po.vendor_po_no || "",
//           buyer_po_number: po.buyer_po_number || "",
//           vendor_name: po.vendor_name || "",
//           buyer_name: po.buyer_company_name || "",
//           vendor_code: po.vendor_code || "",
//           item_name: li.item_name || "",
//           style_number: li.style_number || "",
//           sku_code: li.sku_code || "",
//           quantity: 0,
//           remarks: "DPR re-created automatically after Vendor PO update.",
//           dpr_code: `DPR_${Date.now()}_${li.vendor_line_item_id}`,
//         }));

//         await DailyProductionReport.bulkCreate(dprRecords);
//       }

//       res.json({ success: true, message: "Vendor PO and related data updated successfully", po });
//     } catch (err) {
//       console.error("❌ Error updating Vendor PO:", err);
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // ==============================
//   // DELETE VENDOR PO
//   // ==============================
//   router.delete("/:id", requireLogin, async (req, res) => {
//     try {
//       const po = await VendorPO.findByPk(req.params.id);
//       if (!po) return res.status(404).json({ error: "Vendor PO not found" });

//       await VendorPOLineItem.destroy({ where: { vendor_po_id: po.vendor_po_id } });
//       await po.destroy();

//       res.json({ success: true, message: "Vendor PO deleted successfully" });
//     } catch (err) {
//       console.error("❌ Error deleting Vendor PO:", err);
//       res.status(500).json({ error: err.message });
//     }
//   });

//   return router;
// };
/////////////


// const express = require("express");
// const router = express.Router();

// module.exports = (models, requireLogin) => {
//   const { VendorPO, VendorPOLineItem, DailyProductionReport, VendorMaster, CustomerMaster } = models;

//   // ==============================
//   // CREATE VENDOR PO + LINE ITEMS
//   // ==============================
//   router.post("/", requireLogin, async (req, res) => {
//     const { items, ...poData } = req.body;

//     try {
//       // Step 1: Create the Vendor PO
//       const newPO = await VendorPO.create(poData);

//       // Fetch Vendor & Buyer master data
//       const vendor = await VendorMaster.findByPk(newPO.vendor_id);
//       const buyer = await CustomerMaster.findByPk(newPO.buyer_id);

//       // Step 2: Create Line Items linked to this Vendor PO
//       let createdItems = [];
//       if (items && items.length > 0) {
//         const lineItems = items.map(item => ({
//           vendor_po_id: newPO.vendor_po_id,
//           vendor_po_number: newPO.vendor_po_no,
//           item_id: item.item_id,
//           item_name: item.item_name,
//           style_number: item.style_number,
//           sku_code: item.sku_code,
//           units_of_measure: item.units_of_measure,
//           rate: item.rate,
//           quantity: item.qty || 0,
//           apply_taxes: item.apply_taxes,
//         }));

//         createdItems = await VendorPOLineItem.bulkCreate(lineItems, { returning: true });
//       }

//       // Step 3: Auto-create DPR for each Line Item using VendorPO master data
//       if (createdItems.length > 0) {
//         const dprRecords = createdItems.map((li) => ({
//           vendor_line_item_id: li.vendor_line_item_id,
//           vendor_po_number: newPO.vendor_po_no || "",
//           buyer_po_number: newPO.buyer_po_number || "",
//           vendor_name: vendor ? vendor.vendor_name : "",
//           buyer_name: buyer ? buyer.customer_name : "",
//           vendor_code: vendor ? vendor.vendor_code : "",
//           item_name: li.item_name || "",
//           style_number: li.style_number || "",
//           sku_code: li.sku_code || "",
//           quantity: 0,
//           remarks: "Initial DPR created automatically after Vendor PO creation.",
//           dpr_code: `DPR_${Date.now()}_${li.vendor_line_item_id}`,
//         }));

//         await DailyProductionReport.bulkCreate(dprRecords);
//       }

//       res.status(201).json({
//         success: true,
//         message: "✅ Vendor PO, Line Items, and DPR created successfully.",
//         po: newPO,
//       });
//     } catch (err) {
//       console.error("❌ Error creating Vendor PO:", err);
//       res.status(500).json({ success: false, error: err.message });
//     }
//   });

//   // ==============================
//   // UPDATE VENDOR PO
//   // ==============================
//   router.put("/:id", requireLogin, async (req, res) => {
//     const { items, ...poData } = req.body;

//     try {
//       const po = await VendorPO.findByPk(req.params.id);
//       if (!po) return res.status(404).json({ error: "Vendor PO not found" });

//       // Update VendorPO master
//       await po.update(poData);

//       // Fetch Vendor & Buyer master data
//       const vendor = await VendorMaster.findByPk(po.vendor_id);
//       const buyer = await CustomerMaster.findByPk(po.buyer_id);

//       // Refresh line items and DPR
//       if (items && items.length > 0) {
//         await VendorPOLineItem.destroy({ where: { vendor_po_id: po.vendor_po_id } });

//         const newItems = items.map(item => ({
//           vendor_po_id: po.vendor_po_id,
//           vendor_po_number: po.vendor_po_no,
//           item_id: item.item_id,
//           item_name: item.item_name,
//           style_number: item.style_number,
//           sku_code: item.sku_code,
//           units_of_measure: item.units_of_measure,
//           rate: item.rate,
//           quantity: item.qty,
//           apply_taxes: item.apply_taxes,
//         }));

//         const createdItems = await VendorPOLineItem.bulkCreate(newItems, { returning: true });

//         // Recreate DPR records
//         const dprRecords = createdItems.map(li => ({
//           vendor_line_item_id: li.vendor_line_item_id,
//           vendor_po_number: po.vendor_po_no || "",
//           buyer_po_number: po.buyer_po_number || "",
//           vendor_name: vendor ? vendor.vendor_name : "",
//           buyer_name: buyer ? buyer.customer_name : "",
//           vendor_code: vendor ? vendor.vendor_code : "",
//           item_name: li.item_name || "",
//           style_number: li.style_number || "",
//           sku_code: li.sku_code || "",
//           quantity: 0,
//           remarks: "DPR re-created automatically after Vendor PO update.",
//           dpr_code: `DPR_${Date.now()}_${li.vendor_line_item_id}`,
//         }));

//         await DailyProductionReport.bulkCreate(dprRecords);
//       }

//       res.json({ success: true, message: "Vendor PO and related data updated successfully", po });
//     } catch (err) {
//       console.error("❌ Error updating Vendor PO:", err);
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // ==============================
//   // GET / DELETE ROUTES (unchanged)
//   // ==============================
//   router.get("/", requireLogin, async (req, res) => {
//     try {
//       const pos = await VendorPO.findAll({
//         include: [{ model: VendorPOLineItem, as: "items" }],
//       });
//       res.json(pos);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   router.get("/:id", requireLogin, async (req, res) => {
//     try {
//       const po = await VendorPO.findByPk(req.params.id, {
//         include: [{ model: VendorPOLineItem, as: "items" }],
//       });
//       if (!po) return res.status(404).json({ error: "Vendor PO not found" });
//       res.json(po);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   router.delete("/:id", requireLogin, async (req, res) => {
//     try {
//       const po = await VendorPO.findByPk(req.params.id);
//       if (!po) return res.status(404).json({ error: "Vendor PO not found" });

//       await VendorPOLineItem.destroy({ where: { vendor_po_id: po.vendor_po_id } });
//       await po.destroy();

//       res.json({ success: true, message: "Vendor PO deleted successfully" });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   return router;
// };
//////////////////


const express = require("express");
const router = express.Router();

module.exports = (models, requireLogin) => {
  const {
    VendorPO,
    VendorPOLineItem,
    DailyProductionReport,
    VendorMaster,
    CustomerMaster,
  } = models;

  // ==============================
  // CREATE VENDOR PO + LINE ITEMS
  // ==============================
  router.post("/", requireLogin, async (req, res) => {
    const { items, ...poData } = req.body;

    console.log("📦 Received Vendor PO body:", JSON.stringify(req.body, null, 2)); // 👈 add this

    try {
      // Step 1: Create the Vendor PO
      const newPO = await VendorPO.create(poData);

      // Fetch Vendor & Buyer master data
      const vendor = await VendorMaster.findByPk(newPO.vendor_id);
      const buyer = await CustomerMaster.findByPk(newPO.buyer_id);

      // Step 2: Create Line Items linked to this Vendor PO
      let createdItems = [];
      if (items && items.length > 0) {
        const lineItems = items.map((item) => ({
          vendor_po_id: newPO.vendor_po_id,
          vendor_po_number: newPO.vendor_po_no,
          item_id: item.item_id,
          item_name: item.item_name,
          style_number: item.style_number,
          sku_code: item.sku_code,
          units_of_measure: item.units_of_measure,
          rate: item.rate,
          quantity: item.qty || 0, // ✅ FIX ADDED HERE
          apply_taxes: item.apply_taxes,
        }));

        createdItems = await VendorPOLineItem.bulkCreate(lineItems, {
          returning: true,
        });
      }

      // Step 3: Auto-create DPR for each Line Item using VendorPO master data
      if (createdItems.length > 0) {
        const dprRecords = createdItems.map((li) => ({
          vendor_line_item_id: li.vendor_line_item_id,
          vendor_po_number: newPO.vendor_po_no || "",
          buyer_po_number: newPO.buyer_po_number || "",
          //vendor_name: vendor ? vendor.vendor_name : "",
          //buyer_name: buyer ? buyer.customer_name : "",
          vendor_name:(vendor && vendor.company_name) || newPO.vendor_company_name ||"Unknown Vendor",
          //vendor_name: vendor ? vendor.vendor_name : newPO.vendor_company_name || "unknown vendor",
          buyer_name: buyer ? buyer.company_name : newPO.buyer_company_name || "",
          vendor_code: vendor ? vendor.vendor_code : "",
          item_name: li.item_name || "",
          style_number: li.style_number || "",
          sku_code: li.sku_code || "",
          quantity: 0,
          remarks:
            "Initial DPR created automatically after Vendor PO creation.",
          //dpr_code: `DPR_${Date.now()}_${li.vendor_line_item_id}`,
        }));

        //await DailyProductionReport.bulkCreate(dprRecords);
        await DailyProductionReport.bulkCreate(dprRecords, { individualHooks: true });

      }

      res.status(201).json({
        success: true,
        message: "✅ Vendor PO, Line Items, and DPR created successfully.",
        po: newPO,
      });
    } catch (err) {
      console.error("❌ Error creating Vendor PO:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==============================
  // UPDATE VENDOR PO
  // ==============================
  router.put("/:id", requireLogin, async (req, res) => {
    const { items, ...poData } = req.body;

    try {
      const po = await VendorPO.findByPk(req.params.id);
      if (!po) return res.status(404).json({ error: "Vendor PO not found" });

      // Update VendorPO master
      await po.update(poData);

      // Fetch Vendor & Buyer master data
      const vendor = await VendorMaster.findByPk(po.vendor_id);
      const buyer = await CustomerMaster.findByPk(po.buyer_id);

      // Refresh line items and DPR
      if (items && items.length > 0) {
        await VendorPOLineItem.destroy({
          where: { vendor_po_id: po.vendor_po_id },
        });

        const newItems = items.map((item) => ({
          vendor_po_id: po.vendor_po_id,
          vendor_po_number: po.vendor_po_no,
          item_id: item.item_id,
          item_name: item.item_name,
          style_number: item.style_number,
          sku_code: item.sku_code,
          units_of_measure: item.units_of_measure,
          rate: item.rate,
          quantity: item.qty || 0, // ✅ FIX ADDED HERE
          apply_taxes: item.apply_taxes,
        }));

        const createdItems = await VendorPOLineItem.bulkCreate(newItems, {
          returning: true,
        });

        // Recreate DPR records
        const dprRecords = createdItems.map((li) => ({
          vendor_line_item_id: li.vendor_line_item_id,
          vendor_po_number: po.vendor_po_no || "",
          buyer_po_number: po.buyer_po_number || "",
          vendor_name: vendor ? vendor.vendor_name : "",
          buyer_name: buyer ? buyer.customer_name : "",
          //vendor_name: vendor ? vendor.vendor_name : newPO.vendor_company_name || "",
          //buyer_name: buyer ? buyer.customer_name : newPO.buyer_company_name || "",

          vendor_code: vendor ? vendor.vendor_code : "",
          item_name: li.item_name || "",
          style_number: li.style_number || "",
          sku_code: li.sku_code || "",
          quantity: 0,
          remarks: "DPR re-created automatically after Vendor PO update.",
         // dpr_code: `DPR_${Date.now()}_${li.vendor_line_item_id}`,
        }));

       // await DailyProductionReport.bulkCreate(dprRecords);
          await DailyProductionReport.bulkCreate(dprRecords, { individualHooks: true });

      }

      res.json({
        success: true,
        message: "Vendor PO and related data updated successfully",
        po,
      });
    } catch (err) {
      console.error("❌ Error updating Vendor PO:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // ==============================
  // GET / DELETE ROUTES
  // ==============================
  router.get("/", requireLogin, async (req, res) => {
    try {
      const pos = await VendorPO.findAll({
        include: [{ model: VendorPOLineItem, as: "items" }],
      });
      res.json(pos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  // GET next Vendor PO number
router.get("/next-vpo-number", requireLogin, async (req, res) => {
  try {
    // Fetch the last Vendor PO
    const lastVPO = await VendorPO.findOne({
      order: [["vendor_po_id", "DESC"]],
    });

    let nextNumber = 1;
    if (lastVPO && lastVPO.vendor_po_no) {
      const match = lastVPO.vendor_po_no.match(/\d+$/); // extract the number
      if (match) nextNumber = parseInt(match[0], 10) + 1;
    }

    const nextVPOCode = `VPO-${nextNumber}`;
    res.json({ nextVPOCode });
  } catch (err) {
    console.error("Error generating next Vendor PO number:", err);
    res.status(500).json({ error: err.message });
  }
});



  router.get("/:id", requireLogin, async (req, res) => {
    try {
      const po = await VendorPO.findByPk(req.params.id, {
        include: [{ model: VendorPOLineItem, as: "items" }],
      });
      if (!po) return res.status(404).json({ error: "Vendor PO not found" });
      res.json(po);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/:id", requireLogin, async (req, res) => {
    try {
      const po = await VendorPO.findByPk(req.params.id);
      if (!po)
        return res.status(404).json({ error: "Vendor PO not found" });

      await VendorPOLineItem.destroy({
        where: { vendor_po_id: po.vendor_po_id },
      });
      await po.destroy();

      res.json({ success: true, message: "Vendor PO deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
