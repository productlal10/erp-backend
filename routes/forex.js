// routes/forex.js
const express = require("express");
const router = express.Router();

router.get("/:currency", async (req, res) => {
  try {
    const currency = req.params.currency.toUpperCase();

    // INR base
    if (currency === "INR") {
      return res.json({ rate: 1 });
    }

    const apiUrl = `https://assets.ino.com/data/quote/?format=json&s=FOREX_INR${currency}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(500).json({ error: "Forex API failed" });
    }

    const data = await response.json();

    const key = `FOREX_INR${currency}`;
    const rate = data?.[key]?.last;

    if (!rate) {
      return res.status(404).json({ error: "Rate not found" });
    }

    //res.json({ rate: Number(rate) });
    res.json({ rate: Number(parseFloat(rate).toFixed(3)) });

  } catch (err) {
    console.error("Forex Error:", err);
    res.status(500).json({ error: "Failed to fetch exchange rate" });
  }
});

module.exports = router;
