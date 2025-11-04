const express = require("express");
const router = express.Router();

module.exports = (models, requireLogin) => {
  const { VendorPOLineItem } = models;

  // Get all Vendor PO Line Items
  // This is used for bulk lookups, reporting, or initial data loading.
  router.get("/", requireLogin, async (req, res) => {
    try {
      const lineItems = await VendorPOLineItem.findAll();
      res.json(lineItems);
    } catch (err) {
      // Log the error for server-side debugging
      console.error("Error retrieving Vendor PO Line Items:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // NOTE: CRUD operations (Create, Update, Delete) for individual line items
  // should typically be implemented within the parent VendorPO routes file 
  // (e.g., routes/vendorPoRoutes.js) to ensure data integrity and complex transaction handling.

  return router;
};
