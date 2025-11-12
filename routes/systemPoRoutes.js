const express = require("express");
const router = express.Router();

module.exports = (models) => {
  const { SystemPO, BuyerPOLineItem } = models;

  // Create System PO + Line Items
  // router.post("/", async (req, res) => {
  //   const { items, ...poData } = req.body;

  //   console.log("📦 Received System PO body:", JSON.stringify(req.body, null, 2)); // 👈 add this


  //   try {
  //     const newPO = await SystemPO.create(poData);
  //     if (items && items.length > 0) {
  //       const lineItems = items.map(item => ({
  //         ...item,
  //         system_po_id: newPO.system_po_id,
  //         po_number: poData.po_number,
  //         cost_sheet_code: item.cost_sheet_code
  //       }));
  //       await BuyerPOLineItem.bulkCreate(lineItems);
  //     }
  //     res.status(201).json({ success: true, po: newPO });
  //   } catch (err) {
  //     res.status(500).json({ success: false, error: err.message });
  //     console.error("Error in POST /systempos:", err); 
  //   }
  // });


  // Create System PO + Line Items
router.post("/", async (req, res) => {
  const { items, ...poData } = req.body;

  console.log("📦 Received System PO body:", JSON.stringify(req.body, null, 2));

  try {
    // 1️⃣ Create the PO first
    const newPO = await SystemPO.create(poData);

    if (items && items.length > 0) {
      // 2️⃣ Calculate per-line amounts
      const lineItems = items.map(item => {
        const rate = parseFloat(item.rate) || 0;
        const quantity = parseFloat(item.quantity) || 0;
        const gst = parseFloat(item.gst_treatment) || 0;

        const base_amount = rate * quantity;
        const gst_value = (base_amount * gst) / 100;
        const amount = base_amount + gst_value;

        return {
          ...item,
          system_po_id: newPO.system_po_id,
          po_number: poData.po_number,
          cost_sheet_code: item.cost_sheet_code,
          base_amount: base_amount.toFixed(2),
          gst_value: gst_value.toFixed(2),
          amount: amount.toFixed(2),
        };
      });

      // 3️⃣ Insert line items
      await BuyerPOLineItem.bulkCreate(lineItems);

      // 4️⃣ Calculate PO-level totals
      const sub_total_amount = lineItems.reduce((sum, item) => sum + parseFloat(item.base_amount), 0);
      const gst_amount = lineItems.reduce((sum, item) => sum + parseFloat(item.gst_value), 0);
      const total_amount = sub_total_amount + gst_amount;

      // 5️⃣ Update PO with totals
      newPO.sub_total_amount = sub_total_amount.toFixed(2);
      newPO.gst_amount = gst_amount.toFixed(2);
      newPO.total_amount = total_amount.toFixed(2);

      await newPO.save();
    }

    res.status(201).json({ success: true, po: newPO });
  } catch (err) {
    console.error("Error in POST /systempos:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

  // Get all System POs with items
  router.get("/", async (req, res) => {
    try {
      const pos = await SystemPO.findAll({ include: [{ model: BuyerPOLineItem, as: "items" }] });
      res.json(pos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET next PO number for System PO
router.get("/next-po-number", async (req, res) => {
  try {
    const lastPO = await SystemPO.findOne({
      order: [["system_po_id", "DESC"]],
    });

    let nextNumber = 1;
    if (lastPO && lastPO.po_number) {
      const match = lastPO.po_number.match(/\d+$/);
      if (match) nextNumber = parseInt(match[0]) + 1;
    }

    const nextPOCode = `Buyer PO${nextNumber}`;
    res.json({ nextPOCode });
  } catch (err) {
    console.error("Error generating next PO number:", err);
    res.status(500).json({ error: err.message });
  }
});

  // Get one System PO by id
  router.get("/:id", async (req, res) => {
    try {
      const po = await SystemPO.findByPk(req.params.id, { include: [{ model: BuyerPOLineItem, as: "items" }] });
      if (!po) return res.status(404).json({ error: "System PO not found" });
      res.json(po);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // // Update System PO + Line Items
  // router.put("/:id", async (req, res) => {
  //   const { items, ...poData } = req.body;
  //   try {
  //     const po = await SystemPO.findByPk(req.params.id);
  //     if (!po) return res.status(404).json({ error: "System PO not found" });

  //     await po.update(poData);

  //     if (items) {
  //       // remove old items
  //       await BuyerPOLineItem.destroy({ where: { system_po_id: po.system_po_id } });
  //       // add new items
  //       const newItems = items.map(item => ({
  //         ...item,
  //         system_po_id: po.system_po_id,
  //         po_number: poData.po_number || po.po_number,
  //         cost_sheet_code: item.cost_sheet_code
  //       }));
  //       await BuyerPOLineItem.bulkCreate(newItems);
  //     }

  //     res.json({ success: true, po });
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //     console.error("Error in PUT /systempos:", err); 
  //   }
  // });

  // Update System PO + Line Items
router.put("/:id", async (req, res) => {
  const { items, ...poData } = req.body;

  try {
    const po = await SystemPO.findByPk(req.params.id);
    if (!po) return res.status(404).json({ error: "System PO not found" });

    // 1️⃣ Update PO general data
    await po.update(poData);

    if (items && items.length > 0) {
      // 2️⃣ Remove old items
      await BuyerPOLineItem.destroy({ where: { system_po_id: po.system_po_id } });

      // 3️⃣ Calculate per-line amounts and prepare new items
      const newItems = items.map(item => {
        const rate = parseFloat(item.rate) || 0;
        const quantity = parseFloat(item.quantity) || 0;
        const gst = parseFloat(item.gst_treatment) || 0;

        const base_amount = rate * quantity;
        const gst_value = (base_amount * gst) / 100;
        const amount = base_amount + gst_value;

        return {
          ...item,
          system_po_id: po.system_po_id,
          po_number: poData.po_number || po.po_number,
          cost_sheet_code: item.cost_sheet_code,
          base_amount: base_amount.toFixed(2),
          gst_value: gst_value.toFixed(2),
          amount: amount.toFixed(2),
        };
      });

      // 4️⃣ Insert updated line items
      await BuyerPOLineItem.bulkCreate(newItems);

      // 5️⃣ Recalculate PO-level totals
      const sub_total_amount = newItems.reduce((sum, item) => sum + parseFloat(item.base_amount), 0);
      const gst_amount = newItems.reduce((sum, item) => sum + parseFloat(item.gst_value), 0);
      const total_amount = sub_total_amount + gst_amount;

      po.sub_total_amount = sub_total_amount.toFixed(2);
      po.gst_amount = gst_amount.toFixed(2);
      po.total_amount = total_amount.toFixed(2);

      await po.save();
    }

    res.json({ success: true, po });
  } catch (err) {
    console.error("Error in PUT /systempos:", err);
    res.status(500).json({ error: err.message });
  }
});

  // Delete System PO + cascade items
  router.delete("/:id", async (req, res) => {
    try {
      const po = await SystemPO.findByPk(req.params.id);
      if (!po) return res.status(404).json({ error: "System PO not found" });

      // Note: Sequelize v6 does not automatically cascade, so we manually delete line items
      await BuyerPOLineItem.destroy({ where: { system_po_id: po.system_po_id } });
      await po.destroy();

      res.json({ success: true, message: "System PO deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  return router;
};
