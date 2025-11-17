const express = require("express");
const router = express.Router();

module.exports = (models, requireLogin) => {
  const { PaymentTermMaster } = models;

  // Create Payment Term
  router.post("/", requireLogin, async (req, res) => {
    try {
      const { payment_term_name, description } = req.body;

      if (!payment_term_name) {
        return res.status(400).json({ error: "Payment Term Name is required" });
      }

      const existing = await PaymentTermMaster.findOne({
        where: { payment_term_name }
      });
      if (existing) {
        return res.status(409).json({ error: "Payment Term already exists" });
      }

      const newTerm = await PaymentTermMaster.create({
        payment_term_name,
        description
      });

      res.status(201).json(newTerm);
    } catch (err) {
      console.error("Payment Term creation error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get all Payment Terms
  router.get("/", requireLogin, async (req, res) => {
    try {
      const terms = await PaymentTermMaster.findAll({
        order: [["payment_term_name", "ASC"]]
      });
      res.json(terms);
    } catch (err) {
      console.error("Sequelize Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get Payment Term by ID
  router.get("/:id", requireLogin, async (req, res) => {
    try {
      const term = await PaymentTermMaster.findByPk(req.params.id);
      if (!term) {
        return res.status(404).json({ message: "Payment Term not found" });
      }

      res.json(term);
    } catch (err) {
      console.error("Error fetching Payment Term:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update Payment Term
  router.put("/:id", requireLogin, async (req, res) => {
    try {
      const term = await PaymentTermMaster.findByPk(req.params.id);
      if (!term) {
        return res.status(404).json({ error: "Payment Term not found" });
      }

      const { payment_term_name, description } = req.body;

      if (!payment_term_name) {
        return res.status(400).json({ error: "Payment Term Name is required" });
      }

      await term.update({
        payment_term_name,
        description,
        updated_at: new Date()
      });

      res.json(term);
    } catch (err) {
      console.error("Error updating Payment Term:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Payment Term
  router.delete("/:id", requireLogin, async (req, res) => {
    try {
      const term = await PaymentTermMaster.findByPk(req.params.id);
      if (!term) {
        return res.status(404).json({ error: "Payment Term not found" });
      }

      await term.destroy();
      res.json({ message: "Payment Term deleted successfully" });
    } catch (err) {
      console.error("Error deleting Payment Term:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};