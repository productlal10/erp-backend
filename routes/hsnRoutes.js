const express = require("express");
const router = express.Router();

module.exports = (models, requireLogin) => {
  const { HsnMaster } = models;

  // Create HSN
  router.post("/", requireLogin, async (req, res) => {
    try {
      const { hsn_code } = req.body;

      if (!hsn_code) {
        return res.status(400).json({ error: "HSN Code is required" });
      }

      const existing = await HsnMaster.findOne({ where: { hsn_code } });
      if (existing) {
        return res.status(409).json({ error: "HSN already exists" });
      }

      const newHsn = await HsnMaster.create({ hsn_code });

      res.status(201).json(newHsn);
    } catch (err) {
      console.error("HSN creation error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get all HSN
  router.get("/", requireLogin, async (req, res) => {
    try {
      const hsns = await HsnMaster.findAll({
        order: [["hsn_code", "ASC"]]
      });
      res.json(hsns);
    } catch (err) {
      console.error("Sequelize Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get HSN by ID
  router.get("/:id", requireLogin, async (req, res) => {
    try {
      const hsn = await HsnMaster.findByPk(req.params.id);
      if (!hsn) return res.status(404).json({ message: "HSN not found" });

      res.json(hsn);
    } catch (err) {
      console.error("Error fetching HSN:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update HSN
  router.put("/:id", requireLogin, async (req, res) => {
    try {
      const hsn = await HsnMaster.findByPk(req.params.id);
      if (!hsn) return res.status(404).json({ error: "HSN not found" });

      const { hsn_code } = req.body;

      if (!hsn_code) {
        return res.status(400).json({ error: "HSN Code is required" });
      }

      await hsn.update({ hsn_code });

      res.json(hsn);
    } catch (err) {
      console.error("Error updating HSN:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Delete HSN
  router.delete("/:id", requireLogin, async (req, res) => {
    try {
      const hsn = await HsnMaster.findByPk(req.params.id);
      if (!hsn) return res.status(404).json({ error: "HSN not found" });

      await hsn.destroy();
      res.json({ message: "HSN deleted successfully" });
    } catch (err) {
      console.error("Error deleting HSN:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};