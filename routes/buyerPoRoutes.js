const express = require("express");
const router = express.Router();

module.exports = (models, requireLogin) => {
  const { BuyerPOLineItem } = models;

  // Get all Buyer PO Line Items
  router.get("/", requireLogin, async (req, res) => {
    try {
      const lineItems = await BuyerPOLineItem.findAll();
      res.json(lineItems);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // NOTE: CRUD for individual line items is typically managed through the parent SystemPO routes. 
  // Only the bulk retrieval route from the original server.js is included here.

  // ================================================
  // 2️⃣ Get Buyer PO Line Items by PO Number (ADD THIS)
  // ================================================
  router.get("/by-po/:poNumber", requireLogin, async (req, res) => {
    try {
      const poNumber = req.params.poNumber;

      const items = await BuyerPOLineItem.findAll({
        where: { po_number: poNumber }
      });

      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });





  return router;
};
