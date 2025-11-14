

const express = require("express");
const router = express.Router();

module.exports = (models, requireLogin) => {
  const { BuyerPOLineItem, TNAMergedReport } = models;

  // ===============================
  // 1️⃣ Generate TNA for an existing System PO
  // ===============================
  // router.post("/systempos/:system_po_id/generate-tna", async (req, res) => {
  //   const { system_po_id } = req.params;

  //   try {
  //     console.log("🔹 Generating TNA for System PO ID:", system_po_id);

  //     // 1️⃣ Find all Buyer PO Line Items under this System PO
  //     const lineItems = await BuyerPOLineItem.findAll({ where: { system_po_id } });

  //     if (!lineItems || lineItems.length === 0) {
  //       return res.status(400).json({ error: "No line items found for this System PO" });
  //     }

  //     // 2️⃣ Prepare TNA records for each Buyer PO Line Item
  //     const tnaRecords = lineItems.map((li) => ({
  //       line_item_id: li.line_item_id,
  //       buyer_po_number: li.po_number,
  //       item_name: li.item_name,
  //       style_number: li.style_number,
  //       sku_code: li.sku_code,
  //       buyer_order_date: li.created_at,
  //       tna_overall_status: "Pending",
  //       remarks: li.remarks || "",
  //       tna_code: `TNA_${Date.now()}_${li.line_item_id}`,
  //     }));

  //     // 3️⃣ Bulk insert into TNAMergedReport
  //     const createdTNA = await TNAMergedReport.bulkCreate(tnaRecords, { returning: true });

  //     res.status(201).json({
  //       message: "TNA records created successfully",
  //       tna_count: createdTNA.length,
  //       tna_records: createdTNA,
  //     });
  //   } catch (err) {
  //     console.error("❌ Error generating TNA:", err);
  //     res.status(500).json({ error: err.message });
  //   }
  // });
  router.post("/systempos/:system_po_id/generate-tna", async (req, res) => {
  const { system_po_id } = req.params;

  try {
    console.log("🔹 Generating TNA for System PO ID:", system_po_id);

    const lineItems = await BuyerPOLineItem.findAll({ where: { system_po_id } });

    if (!lineItems || lineItems.length === 0) {
      return res.status(400).json({ error: "No line items found for this System PO" });
    }

    // ✅ Get the last TNA ID to continue numbering
    const lastTNA = await TNAMergedReport.findOne({
      order: [["tna_id", "DESC"]],
    });

    let startNumber = lastTNA ? lastTNA.tna_id + 1 : 1;

    // ✅ Generate T&A codes incrementally
    const tnaRecords = lineItems.map((li, index) => ({
      line_item_id: li.line_item_id,
      buyer_po_number: li.po_number,
      item_name: li.item_name,
      style_number: li.style_number,
      sku_code: li.sku_code,
      buyer_order_date: li.created_at,
      tna_overall_status: "Pending",
      remarks: li.remarks || "",
      tna_code: `T&A_${startNumber + index}`,   // ✅ NEW FORMAT
    }));

    const createdTNA = await TNAMergedReport.bulkCreate(tnaRecords, { returning: true });


    await BuyerPOLineItem.update({ tna_created: true },{ where: { system_po_id } });

    res.status(201).json({
      message: "TNA records created successfully",
      tna_count: createdTNA.length,
      tna_records: createdTNA,
    });
  } catch (err) {
    console.error("❌ Error generating TNA:", err);
    res.status(500).json({ error: err.message });
  }
});


  // ===============================
  // 2️⃣ Get all TNA records
  // ===============================
  router.get("/", requireLogin, async (req, res) => {
    try {
      const tnaRecords = await TNAMergedReport.findAll({
        include: [{ model: BuyerPOLineItem, as: "buyerLineItem" }],
      });
      res.json(tnaRecords);
    } catch (err) {
      console.error("Error fetching TNA:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // ===============================
  // 3️⃣ Get single TNA by ID
  // ===============================
  router.get("/:tna_id", requireLogin, async (req, res) => {
    const { tna_id } = req.params;
    try {
      const tna = await TNAMergedReport.findByPk(tna_id, {
        include: [{ model: BuyerPOLineItem, as: "buyerLineItem" }],
      });
      if (!tna) return res.status(404).json({ error: "TNA not found" });
      res.json(tna);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ===============================
  // 4️⃣ Update TNA
  // ===============================
  // router.put("/:tna_id", requireLogin, async (req, res) => {
  //   const { tna_id } = req.params;
  //   const { tna_overall_status, remarks } = req.body;

  //   try {
  //     const tna = await TNAMergedReport.findByPk(tna_id);
  //     if (!tna) return res.status(404).json({ error: "TNA not found" });

  //     tna.tna_overall_status = tna_overall_status || tna.tna_overall_status;
  //     tna.remarks = remarks || tna.remarks;
      

  //     await tna.save();
  //     res.json({ message: "TNA updated successfully", tna });
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //   }
  // });

router.put("/:tna_id", requireLogin, async (req, res) => {
  const { tna_id } = req.params;

  try {
    const tna = await TNAMergedReport.findByPk(tna_id);
    if (!tna) return res.status(404).json({ error: "TNA not found" });

    // Update only fields sent from frontend (no need to assign manually)
    await tna.update(req.body);

    res.json({ message: "TNA updated successfully", tna });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




  // ===============================
  // 5️⃣ Delete TNA
  // ===============================
  router.delete("/:tna_id", requireLogin, async (req, res) => {
    const { tna_id } = req.params;
    try {
      const deleted = await TNAMergedReport.destroy({ where: { tna_id } });
      if (!deleted) return res.status(404).json({ error: "TNA not found" });
      res.json({ message: "TNA deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
