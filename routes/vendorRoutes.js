const express = require("express");
const router = express.Router();

module.exports = (models, requireLogin) => {
  const { VendorMaster } = models;

  // Create Vendor
  router.post("/", requireLogin, async (req, res) => {
    try {
      const lastVendor = await VendorMaster.findOne({
        order: [["vendor_id", "DESC"]],
      });

      let newCode;
      if (lastVendor) {
        const lastNum = parseInt(lastVendor.vendor_code?.split("-")[1], 10) || 1000;
        newCode = `VEND-${lastNum + 1}`;
      } else {
        newCode = "VEND-1001";
      }

      const vendor = await VendorMaster.create({
        vendor_code: newCode,
        vendor_first_name: req.body.vendor_first_name,
        vendor_last_name: req.body.vendor_last_name,
        company_name: req.body.company_name,
        primary_contact_email: req.body.primary_contact_email,
        vendor_display_name: req.body.vendor_display_name,
        primary_contact_mobile_number: req.body.primary_contact_mobile_number,
        gst_type: req.body.gst_type,
        primary_gst_no: req.body.primary_gst_no,
        billing_address: req.body.billing_address,
        billing_street: req.body.billing_street,
        billing_country: req.body.billing_country,
        billing_city: req.body.billing_city,
        billing_state: req.body.billing_state,
        billing_pin_code: req.body.billing_pin_code,
        billing_phone: req.body.billing_phone,
        shipping_address: req.body.shipping_address,
        shipping_street: req.body.shipping_street,
        shipping_country: req.body.shipping_country,
        shipping_city: req.body.shipping_city,
        shipping_state: req.body.shipping_state,
        shipping_pin_code: req.body.shipping_pin_code,
        shipping_phone: req.body.shipping_phone,
        account_number: req.body.account_number,
        account_type: req.body.account_type,
        account_holder_name: req.body.account_holder_name,
        branch_address: req.body.branch_address,
        bank_name: req.body.bank_name,
        ifsc_code: req.body.ifsc_code,
      });

      res.status(201).json(vendor);
    } catch (err) {
      console.error("Vendor creation error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get all Vendors
  router.get("/", requireLogin, async (req, res) => {
    try {
      const vendors = await VendorMaster.findAll();
      res.json(vendors);
    } catch (err) {
      console.error("Sequelize Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get Vendor by ID (with field normalization)
  router.get("/:id", requireLogin, async (req, res) => {
    try {
      const vendor = await VendorMaster.findByPk(req.params.id);

      if (!vendor) return res.status(404).json({ message: "Vendor not found" });

      // Normalize response (snake_case → camelCase)
      const formatted = {
        vendorId: vendor.vendor_id,
        vendorCode: vendor.vendor_code,
        vendorFirstName: vendor.vendor_first_name,
        vendorLastName: vendor.vendor_last_name,
        companyName: vendor.company_name,
        primaryContactEmail: vendor.primary_contact_email,
        vendorDisplayName: vendor.vendor_display_name,
        primaryContactMobileNumber: vendor.primary_contact_mobile_number,
        gstType: vendor.gst_type,
        primaryGstNo: vendor.primary_gst_no,
        billingAddress: vendor.billing_address,
        billingStreet: vendor.billing_street,
        billingCountry: vendor.billing_country,
        billingCity: vendor.billing_city,
        billingState: vendor.billing_state,
        billingPinCode: vendor.billing_pin_code,
        billingPhone: vendor.billing_phone,
        shippingAddress: vendor.shipping_address,
        shippingStreet: vendor.shipping_street,
        shippingCountry: vendor.shipping_country,
        shippingCity: vendor.shipping_city,
        shippingState: vendor.shipping_state,
        shippingPinCode: vendor.shipping_pin_code,
        shippingPhone: vendor.shipping_phone,
        accountNumber: vendor.account_number,
        accountType: vendor.account_type,
        accountHolderName: vendor.account_holder_name,
        branchAddress: vendor.branch_address,
        bankName: vendor.bank_name,
        ifscCode: vendor.ifsc_code,
      };

      res.json(formatted);
    } catch (err) {
      console.error("Error fetching vendor:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update Vendor by ID
  router.put("/:id", requireLogin, async (req, res) => {
    try {
      const vendor = await VendorMaster.findByPk(req.params.id);
      if (!vendor) return res.status(404).json({ error: "Vendor not found" });

      await vendor.update({
        vendor_first_name: req.body.vendor_first_name,
        vendor_last_name: req.body.vendor_last_name,
        company_name: req.body.company_name,
        primary_contact_email: req.body.primary_contact_email,
        vendor_display_name: req.body.vendor_display_name,
        primary_contact_mobile_number: req.body.primary_contact_mobile_number,
        gst_type: req.body.gst_type,
        primary_gst_no: req.body.primary_gst_no,
        billing_address: req.body.billing_address,
        billing_street: req.body.billing_street,
        billing_country: req.body.billing_country,
        billing_city: req.body.billing_city,
        billing_state: req.body.billing_state,
        billing_pin_code: req.body.billing_pin_code,
        billing_phone: req.body.billing_phone,
        shipping_address: req.body.shipping_address,
        shipping_street: req.body.shipping_street,
        shipping_country: req.body.shipping_country,
        shipping_city: req.body.shipping_city,
        shipping_state: req.body.shipping_state,
        shipping_pin_code: req.body.shipping_pin_code,
        shipping_phone: req.body.shipping_phone,
        account_number: req.body.account_number,
        account_type: req.body.account_type,
        account_holder_name: req.body.account_holder_name,
        branch_address: req.body.branch_address,
        bank_name: req.body.bank_name,
        ifsc_code: req.body.ifsc_code,
      });

      res.json(vendor);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Vendor by ID
  router.delete("/:id", requireLogin, async (req, res) => {
    try {
      const vendor = await VendorMaster.findByPk(req.params.id);
      if (!vendor) return res.status(404).json({ error: "Vendor not found" });

      await vendor.destroy();
      res.json({ message: "Vendor deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
