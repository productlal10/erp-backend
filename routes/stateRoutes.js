const express = require("express");

module.exports = (models, requireLogin) => {
  const router = express.Router();
  const StateMaster = models.StateMaster;

  // GET all states
  router.get("/", requireLogin, async (req, res) => {
    try {
      const states = await StateMaster.findAll({
        order: [["state_name", "ASC"]],
      });
      res.json(states);
    } catch (err) {
      console.error("Error fetching states:", err);
      res.status(500).json({ error: "Failed to fetch states" });
    }
  });

  return router;
};