const express = require("express");
const router = express.Router();

//module.exports = (models, requireLogin) => {
  //const { DailyProductionReport, VendorPOLineItem, VendorPO, ItemMaster } = models;

module.exports = (models, requireLogin) => {
  const { DailyProductionReport, VendorPOLineItem, VendorPO, ItemMaster, DPRLineItem } = models;



  // --- POST Generate DPR for an entire Vendor PO (Bulk Creation) ---
  router.post("/vendorpos/:vendor_po_id/generate-dpr", requireLogin, async (req, res) => {
    const { vendor_po_id } = req.params;

    try {
      // Fetch Vendor Line Items along with ItemMaster and VendorPO
      const lineItems = await VendorPOLineItem.findAll({
        where: { vendor_po_id },
        include: [
          { model: ItemMaster, as: "ItemMaster" },
          { model: VendorPO, as: "VendorPO" }
        ]
      });

      if (!lineItems || lineItems.length === 0) {
        return res.status(400).json({ error: "No vendor line items found for this Vendor PO to generate DPRs." });
      }

      // Map fields for DPR, pulling data from related models
      const dprRecords = lineItems.map((li) => ({
        vendor_line_item_id: li.vendor_line_item_id,
        buyer_po_number: li.buyer_po_number || "",
        item_name: li.item_name || li.ItemMaster?.item_name || "",
        style_number: li.style_number || li.ItemMaster?.style_number || "",
        sku_code: li.sku_code || li.ItemMaster?.sku_code || "",
        colour: li.colour || "",
        quantity: 0,
        vendor_name: li.VendorPO?.vendor_name || "",
        buyer_name: li.buyer_name || "",
        vendor_code: li.VendorPO?.vendor_code || "",
        buyer_code: li.buyer_code || "",
        remarks: "Initial DPR created for production tracking.",
        //dpr_code: `DPR_${Date.now()}_${li.vendor_line_item_id}`,
      }));

      // const createdDPR = await DailyProductionReport.bulkCreate(dprRecords, { returning: true });
      const createdDPR = await DailyProductionReport.bulkCreate(dprRecords, { 
          returning: true,
          individualHooks: true,
});


      res.status(201).json({
        message: "Initial DPR records created successfully for all vendor line items.",
        dpr_count: createdDPR.length,
        dpr_records: createdDPR,
      });

    } catch (err) {
      console.error("❌ Error generating DPR:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // --- GET All DPR records ---
  router.get("/", requireLogin, async (req, res) => {
    try {
      const dprRecords = await DailyProductionReport.findAll({
        include: [
          { model: VendorPOLineItem, as: "vendorLineItem", include: [{ model: ItemMaster, as: "ItemMaster" }, { model: VendorPO, as: "VendorPO" }] }
        ]
      });
      res.json(dprRecords);
    } catch (err) {
      console.error("Error fetching DPR:", err);
      res.status(500).json({ error: err.message });
    }
  });
  
  // --- GET single DPR record by ID ---
  // router.get("/:dpr_id", requireLogin, async (req, res) => {
  //   const { dpr_id } = req.params;
  //   try {
  //     const dpr = await DailyProductionReport.findByPk(dpr_id, {
  //       include: [
  //         { model: VendorPOLineItem, as: "vendorLineItem", include: [{ model: ItemMaster, as: "ItemMaster" }, { model: VendorPO, as: "VendorPO" }] }
  //       ]
  //     });
  //     if (!dpr) return res.status(404).json({ error: "DPR not found" });
  //     res.json(dpr);
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //   }
  // });
  
  router.get("/:dpr_id", requireLogin, async (req, res) => {
  try {
    const dpr = await DailyProductionReport.findByPk(req.params.dpr_id, {
      include: [
        { model: DPRLineItem, as: "lineItems" }, // <--- include DPR line items
        { 
          model: VendorPOLineItem, 
          as: "vendorLineItem", 
          include: [
            { model: ItemMaster, as: "ItemMaster" },
            { model: VendorPO, as: "VendorPO" }
          ] 
        }
      ]
    });

    if (!dpr) return res.status(404).json({ error: "DPR not found" });

    res.json(dpr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





  // --- PUT Update DPR record ---
  // router.put("/:dpr_id", requireLogin, async (req, res) => {
  //   const { dpr_id } = req.params;
  //   const { quantity, remarks } = req.body;

  //   console.log("🟡 DPR UPDATE REQUEST RECEIVED");
  //   console.log("➡️ DPR ID:", dpr_id);
  //   console.log("➡️ Body Received:", req.body);

  //   try {
  //     const dpr = await DailyProductionReport.findByPk(dpr_id);
  //     if (!dpr) return res.status(404).json({ error: "DPR not found" });

  //     const updateData = {};
  //     if (typeof quantity !== 'undefined') updateData.quantity = quantity;
  //     if (remarks) updateData.remarks = remarks;

  //     await dpr.update(updateData);
  //     res.json({ message: "DPR updated successfully", dpr });
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //   }
  // });
//   router.put("/:dpr_id", requireLogin, async (req, res) => {
//   const { dpr_id } = req.params;

//   console.log("🟡 DPR UPDATE REQUEST RECEIVED");
//   console.log("➡️ DPR ID:", dpr_id);
//   console.log("➡️ Body Received:", req.body);

//   try {
//     const dpr = await DailyProductionReport.findByPk(dpr_id);
//     if (!dpr) return res.status(404).json({ error: "DPR not found" });

//     // Pick only fields that exist in the model
//     const fieldsToUpdate = [
//       "quantity",
//       "remarks",
//       "vendor_line_item_id",
//       "vendor_po_number",
//       "buyer_po_number",
//       "style_number",
//       "item_name",
//       "sku_code",
//       "vendor_name",
//       "buyer_name",
//       "vendor_code",
//       "buyer_code",
//       "colour",
//       "reported_on",
//       "units_produced",
//       "cutting",
//       "stitching",
//       "finishing",
//       "packaging"
      
//     ];

//     const updateData = {};
//     fieldsToUpdate.forEach(field => {
//       if (req.body[field] !== undefined) {
//         updateData[field] = req.body[field];
//       }
//     });

//     await dpr.update(updateData);

//     res.json({ message: "✅ DPR updated successfully", dpr });
//   } catch (err) {
//     console.error("❌ DPR UPDATE ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// });
// PUT /dpr/:id
router.put("/:id", async (req, res) => {
  try {
    const dpr_id = req.params.id;
    const dprData = req.body;
    const items = req.body.items || []; // ✅ Frontend items

    //console.log("🔄 Updating DPR:", dpr_id);

    console.log("🟡 DPR UPDATE REQUEST RECEIVED");
    console.log("➡️ DPR ID:", dpr_id);
    console.log("➡️ Body Received:", req.body);

    // 1️⃣ Update DPR Main Record
    await DailyProductionReport.update(dprData, { where: { dpr_id } });

    // 2️⃣ Remove previous line items
    await DPRLineItem.destroy({ where: { dpr_id } });

    // 3️⃣ Insert new line items
    if (items.length > 0) {
      const formattedItems = items.map(i => ({
        dpr_id,
        dpr_code: i.dpr_code,
        dpr_date: i.dpr_date || null,
        style_number: i.style_number || null,
        vendor_po_number: i.vendor_po_number || null,
        units_produced: i.units_produced || 0,
        cutting: i.cutting || 0,
        stitching: i.stitching || 0,
        finishing: i.finishing || 0,
        packaging: i.packaging || 0,
        defects: i.defects || 0
      }));

      await DPRLineItem.bulkCreate(formattedItems);
    }

    res.json({ success: true, message: "✅ DPR updated & line items saved." });
  } catch (error) {
    console.error("❌ DPR UPDATE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});


  // --- DELETE DPR record ---
  router.delete("/:dpr_id", requireLogin, async (req, res) => {
    const { dpr_id } = req.params;
    try {
      const deleted = await DailyProductionReport.destroy({ where: { dpr_id } });
      if (!deleted) return res.status(404).json({ error: "DPR not found" });
      res.json({ message: "DPR deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
