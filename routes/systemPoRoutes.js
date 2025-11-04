const express = require("express");
const router = express.Router();

module.exports = (models) => {
  const { SystemPO, BuyerPOLineItem } = models;

  // Create System PO + Line Items
  router.post("/", async (req, res) => {
    const { items, ...poData } = req.body;
    try {
      const newPO = await SystemPO.create(poData);
      if (items && items.length > 0) {
        const lineItems = items.map(item => ({
          ...item,
          system_po_id: newPO.system_po_id,
          po_number: poData.po_number,
          cost_sheet_code: item.cost_sheet_code
        }));
        await BuyerPOLineItem.bulkCreate(lineItems);
      }
      res.status(201).json({ success: true, po: newPO });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
      console.error("Error in POST /systempos:", err); 
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

  // Update System PO + Line Items
  router.put("/:id", async (req, res) => {
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
          cost_sheet_code: item.cost_sheet_code
        }));
        await BuyerPOLineItem.bulkCreate(newItems);
      }

      res.json({ success: true, po });
    } catch (err) {
      res.status(500).json({ error: err.message });
      console.error("Error in PUT /systempos:", err); 
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
