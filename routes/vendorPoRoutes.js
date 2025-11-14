
const express = require("express");
const router = express.Router();

module.exports = (models, requireLogin) => {
  const {
    VendorPO,
    VendorPOLineItem,
    DailyProductionReport,
    VendorMaster,
    CustomerMaster,
    SystemPO,
  } = models;

  // ==============================
  // CREATE VENDOR PO + LINE ITEMS
  // ==============================
  // router.post("/", requireLogin, async (req, res) => {
  //   const { items, ...poData } = req.body;

  //   console.log("📦 Received Vendor PO body:", JSON.stringify(req.body, null, 2)); // 👈 add this

  //   try {
  //     // Step 1: Create the Vendor PO
  //     const newPO = await VendorPO.create(poData);

  //     // Fetch Vendor & Buyer master data
  //     const vendor = await VendorMaster.findByPk(newPO.vendor_id);
  //     const buyer = await CustomerMaster.findByPk(newPO.buyer_id);

  //     // Step 2: Create Line Items linked to this Vendor PO
  //     let createdItems = [];
  //     if (items && items.length > 0) {
  //       const lineItems = items.map((item) => ({
  //         vendor_po_id: newPO.vendor_po_id,
  //         vendor_po_number: newPO.vendor_po_no,
  //         item_id: item.item_id,
  //         item_name: item.item_name,
  //         style_number: item.style_number,
  //         sku_code: item.sku_code,
  //         units_of_measure: item.units_of_measure,
  //         rate: item.rate,
  //         quantity: item.qty || 0, // ✅ FIX ADDED HERE
  //         apply_taxes: item.apply_taxes,
  //         gst_treatment: item.gst_treatment, // ✅ NEW FIELD ADDED HERE
  //       }));

  //       createdItems = await VendorPOLineItem.bulkCreate(lineItems, {
  //         returning: true,
  //       });
  //     }

  //     // Step 3: Auto-create DPR for each Line Item using VendorPO master data
  //     if (createdItems.length > 0) {
  //       const dprRecords = createdItems.map((li) => ({
  //         vendor_line_item_id: li.vendor_line_item_id,
  //         vendor_po_number: newPO.vendor_po_no || "",
  //         buyer_po_number: newPO.buyer_po_number || "",
  //         //vendor_name: vendor ? vendor.vendor_name : "",
  //         //buyer_name: buyer ? buyer.customer_name : "",
  //         vendor_name:(vendor && vendor.company_name) || newPO.vendor_company_name ||"Unknown Vendor",
  //         //vendor_name: vendor ? vendor.vendor_name : newPO.vendor_company_name || "unknown vendor",
  //         buyer_name: buyer ? buyer.company_name : newPO.buyer_company_name || "",
  //         vendor_code: vendor ? vendor.vendor_code : "",
  //         item_name: li.item_name || "",
  //         style_number: li.style_number || "",
  //         sku_code: li.sku_code || "",
  //         quantity: 0,
  //         remarks:
  //           "Initial DPR created automatically after Vendor PO creation.",
  //         //dpr_code: `DPR_${Date.now()}_${li.vendor_line_item_id}`,
  //       }));

  //       //await DailyProductionReport.bulkCreate(dprRecords);
  //       await DailyProductionReport.bulkCreate(dprRecords, { individualHooks: true });

  //     }

  //     res.status(201).json({
  //       success: true,
  //       message: "✅ Vendor PO, Line Items, and DPR created successfully.",
  //       po: newPO,
  //     });
  //   } catch (err) {
  //     console.error("❌ Error creating Vendor PO:", err);
  //     res.status(500).json({ success: false, error: err.message });
  //   }
  // });

  ////////

router.post("/", requireLogin, async (req, res) => {
const { items, ...poData } = req.body;

  console.log("📦 Received Vendor PO body:", JSON.stringify(req.body, null, 2));

  try {
    // ✅ Step 0: Perform backend calculations (fixed logic)
let subTotal = 0;
let totalGST = 0; // 👈 add this

const calculatedItems = (items || []).map((item) => {
  const rate = parseFloat(item.rate) || 0;
  const qty = parseFloat(item.qty) || 0;
  const gst = parseFloat(item.gst_treatment) || 0;

  // ✅ Base and GST separated
  const baseAmount = rate * qty;
  let gstValue = 0;

  if (item.apply_taxes === "Yes") {
    gstValue = (baseAmount * gst) / 100;
  }

  const amount = parseFloat((baseAmount + gstValue).toFixed(2));
  subTotal += baseAmount; // ✅ base amount
  totalGST += gstValue;   // ✅ gst added separately

  return { ...item, amount };
});

// ✅ Total = subtotal + gst + shipping - discount
const totalAmount = parseFloat(
  (
    subTotal +
    totalGST + // 👈 add GST to total
    (parseFloat(poData.shipping_cost) || 0) -
    (parseFloat(poData.discount) || 0)
  ).toFixed(2)
);

    poData.sub_total = parseFloat(subTotal.toFixed(2));
    poData.total_gst = parseFloat(totalGST.toFixed(2)); // optional but helpful
    poData.total_amount = totalAmount;
    // Step 1: Create the Vendor PO
    const newPO = await VendorPO.create(poData);

    // Fetch Vendor & Buyer master data
    const vendor = await VendorMaster.findByPk(newPO.vendor_id);
    const buyer = await CustomerMaster.findByPk(newPO.buyer_id);
    const systemPO = await SystemPO.findByPk(newPO.system_po_id);

    
    

    // Step 2: Create Line Items linked to this Vendor PO
    let createdItems = [];
    if (calculatedItems.length > 0) {
      const lineItems = calculatedItems.map((item) => ({
        vendor_po_id: newPO.vendor_po_id,
        vendor_po_number: newPO.vendor_po_no,
        item_id: item.item_id,
        item_name: item.item_name,
        style_number: item.style_number,
        sku_code: item.sku_code,
        units_of_measure: item.units_of_measure,
        rate: item.rate,
        quantity: item.qty || 0,
        apply_taxes: item.apply_taxes,
        gst_treatment: item.gst_treatment,
        amount: item.amount, // ✅ backend-calculated amount
      }));

      createdItems = await VendorPOLineItem.bulkCreate(lineItems, {
        returning: true,
      });
    }

    // Step 3: Auto-create DPR for each Line Item
    if (createdItems.length > 0) {
      const dprRecords = createdItems.map((li) => ({
        vendor_line_item_id: li.vendor_line_item_id,
        vendor_po_number: newPO.vendor_po_no || "",
        buyer_po_number: newPO.buyer_po_number || "",
        vendor_name:
          (vendor && vendor.company_name) ||
          newPO.vendor_company_name ||
          "Unknown Vendor",
        buyer_name: buyer
          ? buyer.company_name
          : newPO.buyer_company_name || "",
        vendor_code: vendor ? vendor.vendor_code : "",
       // buyer_code: buyer ? buyer.customer_code : "",
        buyer_code: systemPO ? systemPO.customer_code : "", // ✅ fetch from SystemPO
        item_name: li.item_name || "",
        style_number: li.style_number || "",
        sku_code: li.sku_code || "",
        quantity: li.quantity || 0,
        remarks:
          "Initial DPR created automatically after Vendor PO creation.",
      }));

      await DailyProductionReport.bulkCreate(dprRecords, {
        individualHooks: true,
      });
    }

    res.status(201).json({
      success: true,
      message: "✅ Vendor PO, Line Items, and DPR created successfully.",
      po: newPO,
    });
  } catch (err) {
    console.error("❌ Error creating Vendor PO:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


  // ==============================
  // UPDATE VENDOR PO
  // ==============================
  // router.put("/:id", requireLogin, async (req, res) => {
  //   const { items, ...poData } = req.body;

  //   try {
  //     const po = await VendorPO.findByPk(req.params.id);
  //     if (!po) return res.status(404).json({ error: "Vendor PO not found" });

  //     // Update VendorPO master
  //     await po.update(poData);

  //     // Fetch Vendor & Buyer master data
  //     const vendor = await VendorMaster.findByPk(po.vendor_id);
  //     const buyer = await CustomerMaster.findByPk(po.buyer_id);

  //     // Refresh line items and DPR
  //     if (items && items.length > 0) {
  //       await VendorPOLineItem.destroy({
  //         where: { vendor_po_id: po.vendor_po_id },
  //       });

  //       const newItems = items.map((item) => ({
  //         vendor_po_id: po.vendor_po_id,
  //         vendor_po_number: po.vendor_po_no,
  //         item_id: item.item_id,
  //         item_name: item.item_name,
  //         style_number: item.style_number,
  //         sku_code: item.sku_code,
  //         units_of_measure: item.units_of_measure,
  //         rate: item.rate,
  //         quantity: item.qty || 0, // ✅ FIX ADDED HERE
  //         apply_taxes: item.apply_taxes,
  //         gst_treatment: item.gst_treatment, // ✅ NEW FIELD ADDED HERE
  //       }));

  //       const createdItems = await VendorPOLineItem.bulkCreate(newItems, {
  //         returning: true,
  //       });

  //       // Recreate DPR records
  //       const dprRecords = createdItems.map((li) => ({
  //         vendor_line_item_id: li.vendor_line_item_id,
  //         vendor_po_number: po.vendor_po_no || "",
  //         buyer_po_number: po.buyer_po_number || "",
  //         vendor_name: vendor ? vendor.vendor_name : "",
  //         buyer_name: buyer ? buyer.customer_name : "",
  //         //vendor_name: vendor ? vendor.vendor_name : newPO.vendor_company_name || "",
  //         //buyer_name: buyer ? buyer.customer_name : newPO.buyer_company_name || "",

  //         vendor_code: vendor ? vendor.vendor_code : "",
  //         item_name: li.item_name || "",
  //         style_number: li.style_number || "",
  //         sku_code: li.sku_code || "",
  //         quantity: 0,
  //         remarks: "DPR re-created automatically after Vendor PO update.",
  //        // dpr_code: `DPR_${Date.now()}_${li.vendor_line_item_id}`,
  //       }));

  //      // await DailyProductionReport.bulkCreate(dprRecords);
  //         await DailyProductionReport.bulkCreate(dprRecords, { individualHooks: true });

  //     }

  //     res.json({
  //       success: true,
  //       message: "Vendor PO and related data updated successfully",
  //       po,
  //     });
  //   } catch (err) {
  //     console.error("❌ Error updating Vendor PO:", err);
  //     res.status(500).json({ error: err.message });
  //   }
  // });

///

router.put("/:id", requireLogin, async (req, res) => {
  const { items, ...poData } = req.body;

  try {
    const po = await VendorPO.findByPk(req.params.id);
    const systemPO = await SystemPO.findByPk(po.system_po_id);
    if (!po) return res.status(404).json({ error: "Vendor PO not found" });

    // ✅ Step 0: Perform backend calculations (same as POST)
    let subTotal = 0;
    let totalGST = 0;

    const calculatedItems = (items || []).map((item) => {
      const rate = parseFloat(item.rate) || 0;
      const qty = parseFloat(item.qty) || 0;
      const gst = parseFloat(item.gst_treatment) || 0;

      const baseAmount = rate * qty;
      let gstValue = 0;

      if (item.apply_taxes === "Yes") {
        gstValue = (baseAmount * gst) / 100;
      }

      const amount = parseFloat((baseAmount + gstValue).toFixed(2));
      subTotal += baseAmount;
      totalGST += gstValue;

      return { ...item, amount };
    });

    // ✅ Total = subtotal + gst + shipping - discount
    const totalAmount = parseFloat(
      (
        subTotal +
        totalGST +
        (parseFloat(poData.shipping_cost) || 0) -
        (parseFloat(poData.discount) || 0)
      ).toFixed(2)
    );

    poData.sub_total = parseFloat(subTotal.toFixed(2));
    poData.total_gst = parseFloat(totalGST.toFixed(2));
    poData.total_amount = totalAmount;

    // Remove vendor_po_no from poData before update
      await po.update(poData); // update all other fields safely

    // ✅ Fetch Vendor & Buyer master data
    const vendor = await VendorMaster.findByPk(po.vendor_id);
    const buyer = await CustomerMaster.findByPk(po.buyer_id);

    // ✅ Step 2: Refresh line items
    if (calculatedItems.length > 0) {
      await VendorPOLineItem.destroy({
        where: { vendor_po_id: po.vendor_po_id },
      });

      const newItems = calculatedItems.map((item) => ({
        vendor_po_id: po.vendor_po_id,
        vendor_po_number: po.vendor_po_no,
        item_id: item.item_id,
        item_name: item.item_name,
        style_number: item.style_number,
        sku_code: item.sku_code,
        units_of_measure: item.units_of_measure,
        rate: item.rate,
        quantity: item.qty || 0,
        apply_taxes: item.apply_taxes,
        gst_treatment: item.gst_treatment,
        amount: item.amount, // ✅ backend-calculated amount
      }));

      const createdItems = await VendorPOLineItem.bulkCreate(newItems, {
        returning: true,
      });

      // ✅ Step 3: Recreate DPR records
      const dprRecords = createdItems.map((li) => ({
        vendor_line_item_id: li.vendor_line_item_id,
        vendor_po_number: po.vendor_po_no || "",
        buyer_po_number: po.buyer_po_number || "",
        vendor_name:
          (vendor && vendor.company_name) ||
          po.vendor_company_name ||
          "Unknown Vendor",
        buyer_name: buyer
          ? buyer.company_name
          : po.buyer_company_name || "",
        vendor_code: vendor ? vendor.vendor_code : "",
        //buyer_code: buyer ? buyer.customer_code : "",
        buyer_code: systemPO ? systemPO.customer_code : "", // ✅ fetch from SystemPO
        item_name: li.item_name || "",
        style_number: li.style_number || "",
        sku_code: li.sku_code || "",
        quantity: li.quantity || 0,
        remarks: "DPR re-created automatically after Vendor PO update.",
      }));

      await DailyProductionReport.bulkCreate(dprRecords, {
        individualHooks: true,
      });
    }

    res.json({
      success: true,
      message: "✅ Vendor PO and related data updated successfully",
      po,
    });
  } catch (err) {
    console.error("❌ Error updating Vendor PO:", err);
    res.status(500).json({ error: err.message });
  }
});
  // ==============================
  // GET / DELETE ROUTES
  // ==============================
  router.get("/", requireLogin, async (req, res) => {
    try {
      const pos = await VendorPO.findAll({
        include: [{ model: VendorPOLineItem, as: "items" }],
      });
      res.json(pos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  // GET next Vendor PO number
router.get("/next-vpo-number", requireLogin, async (req, res) => {
  try {
    // Fetch the last Vendor PO
    const lastVPO = await VendorPO.findOne({
      order: [["vendor_po_id", "DESC"]],
    });

    let nextNumber = 1;
    if (lastVPO && lastVPO.vendor_po_no) {
      const match = lastVPO.vendor_po_no.match(/\d+$/); // extract the number
      if (match) nextNumber = parseInt(match[0], 10) + 1;
    }

    const nextVPOCode = `VPO-${nextNumber}`;
    res.json({ nextVPOCode });
  } catch (err) {
    console.error("Error generating next Vendor PO number:", err);
    res.status(500).json({ error: err.message });
  }
});



  router.get("/:id", requireLogin, async (req, res) => {
    try {
      const po = await VendorPO.findByPk(req.params.id, {
        include: [{ model: VendorPOLineItem, as: "items" }],
      });
      if (!po) return res.status(404).json({ error: "Vendor PO not found" });
      res.json(po);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/:id", requireLogin, async (req, res) => {
    try {
      const po = await VendorPO.findByPk(req.params.id);
      if (!po)
        return res.status(404).json({ error: "Vendor PO not found" });

      await VendorPOLineItem.destroy({
        where: { vendor_po_id: po.vendor_po_id },
      });
      await po.destroy();

      res.json({ success: true, message: "Vendor PO deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
