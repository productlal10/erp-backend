const express = require("express");
const multer = require("multer");
const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" }); // store uploaded files temporarily

module.exports = (models, requireLogin) => {
  const { ItemMaster } = models;

  // Create Item (includes file upload)
  router.post("/", requireLogin, upload.single("bom_file"), async (req, res) => {
    try {
      const body = req.body;

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

  // Get all Items
  router.get("/", requireLogin, async (req, res) => {
    try {
      const items = await ItemMaster.findAll();
      res.json(items);
    } catch (err) {
      console.error("Sequelize Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get Item by ID
  router.get("/:id", requireLogin, async (req, res) => {
    try {
      const item = await ItemMaster.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: "Item not found" });
      res.json(item);
    } catch (err) {
      console.error("Error fetching item:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update Item by ID (includes file upload)
  router.put("/:id", requireLogin, upload.single("bom_file"), async (req, res) => {
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

  // Delete Item by ID
  router.delete("/:id", requireLogin, async (req, res) => {
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

  return router;
};
