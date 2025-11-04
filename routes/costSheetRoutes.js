const express = require("express");
const router = express.Router();

module.exports = (models, requireLogin) => {
  const { CostSheet } = models;

  // GET all cost sheets
  router.get("/", requireLogin, async (req, res) => {
    try {
      const costsheets = await CostSheet.findAll({ order: [["cost_sheet_id", "DESC"]] });
      res.json(costsheets);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET single cost sheet
  router.get("/:id", requireLogin, async (req, res) => {
    try {
      const cs = await CostSheet.findByPk(req.params.id);
      if (!cs) return res.status(404).json({ error: "Cost sheet not found" });
      res.json(cs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // CREATE cost sheet
  router.post("/", requireLogin, async (req, res) => {
    try {
      const data = { ...req.body };
      delete data.cost_sheet_id;

      const lastSheet = await CostSheet.findOne({ order: [["cost_sheet_id", "DESC"]] });
      const nextNumber = lastSheet ? lastSheet.cost_sheet_id + 1 : 1;
      data.cost_sheet_code = `CS_${nextNumber}`;

      const newCS = await CostSheet.create(data);
      res.status(201).json(newCS);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // UPDATE cost sheet
  router.put("/:id", requireLogin, async (req, res) => {
    try {
      const cs = await CostSheet.findByPk(req.params.id);
      if (!cs) return res.status(404).json({ error: "Cost sheet not found" });

      await cs.update(req.body);
      res.json(cs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE cost sheet
  router.delete("/:id", requireLogin, async (req, res) => {
    try {
      const cs = await CostSheet.findByPk(req.params.id);
      if (!cs) return res.status(404).json({ error: "Cost sheet not found" });

      await cs.destroy();
      res.json({ message: "Cost sheet deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
