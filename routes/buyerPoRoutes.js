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

  return router;
};
