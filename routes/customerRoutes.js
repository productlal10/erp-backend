const express = require("express");
const router = express.Router();

module.exports = (models, requireLogin) => {
  const { CustomerMaster } = models;

  // Create Customer
  router.post("/", requireLogin, async (req, res) => {
    
    try {
      const lastCustomer = await CustomerMaster.findOne({
        order: [["customer_id", "DESC"]],
      });

      let newCode;
      if (lastCustomer) {
        const lastNum = parseInt(lastCustomer.customer_code?.split("-")[1], 10) || 1000;
        newCode = `CUST-${lastNum + 1}`;
      } else {
        newCode = "CUST-1001";
      }

      console.log("Incoming Customer Data:", req.body);

    console.log(
    "GST:", req.body.gst_treatment,
    "PAN:", req.body.pan_no,
    "TAX:", req.body.tax_preference
    );

      const customer = await CustomerMaster.create({
        customer_code: newCode,
        salutation: req.body.salutation,
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        company_name: req.body.companyName,
        customer_type: req.body.customerType,
        email: req.body.primaryEmail,
        display_name: req.body.customerDisplayName,
        payment_terms: req.body.paymentTerms,
        phone: req.body.primaryMobile,
        type: req.body.type,
        username: req.body.userName,
        password: req.body.password,
        attachment: req.body.attachment || null,
        currency: req.body.currency,
        brand_pin: req.body.brandPin,
        billing_address: req.body.billingAddress || "",
        billing_country: req.body.country || "",
        billing_city: req.body.city || "",
        billing_pincode: req.body.pinCode || "",
        gst_treatment: req.body.gst_treatment,
        pan_no: req.body.pan_no,
        tax_preference: req.body.tax_preference,
        gstin_no:req.body.gstin_no,
        state_name:req.body.state_name,
        state_name1:req.body.state_name1,
        shipping_address: req.body.shippingAddress || "",
        shipping_country: req.body.country1 || "",
        shipping_city: req.body.city1 || "",
        shipping_pincode: req.body.pinCode1 || "",
        account_number: req.body.accountNumber || "",
        account_holder_name: req.body.accountHolderName || "",
        bank_name: req.body.bankName || "",
        branch_address: req.body.branchAddress || "",
        ifsc_code: req.body.iFSCCode || "",
      });

      res.status(201).json(customer);
    } catch (err) {
      console.error("Customer creation error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get all Customers
  router.get("/", requireLogin, async (req, res) => {
    try {
      const customers = await CustomerMaster.findAll();
      res.json(customers);
    } catch (err) {
      console.error("Sequelize Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get Customer by ID (with field normalization)
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await CustomerMaster.findByPk(id);

      if (!customer) return res.status(404).json({ message: "Customer not found" });

      // Normalize DB fields (snake_case → camelCase)
      const formatted = {
        customer_id: customer.customer_id,
        customerCode: customer.customer_code,
        salutation: customer.salutation,
        firstName: customer.first_name,
        lastName: customer.last_name,
        companyName: customer.company_name,
        type: customer.type,
        customerDisplayName: customer.display_name,
        primaryEmail: customer.email,
        primaryMobile: customer.phone,
        paymentTerms: customer.payment_terms,
        currency: customer.currency,
        userName:customer.username,
        accountNumber: customer.account_number,
        accountHolderName: customer.account_holder_name,
        bankName: customer.bank_name,
        branchAddress: customer.branch_address,
        iFSCCode: customer.ifsc_code,
        billingAddress: customer.billing_address,
        shippingAddress: customer.shipping_address,
        city: customer.billing_city,
        city1:customer.shipping_city,
        country: customer.billing_country,
        country1:customer.shipping_country,
        pinCode: customer.billing_pincode,
        pinCode1:customer.shipping_city, // Note: original code had a typo here (shipping_city instead of pincode)
        gst_treatment: customer.gst_treatment,
        gstin_no:customer.gstin_no,
        state_name:customer.state_name,
        state_name1:customer.state_name1,
        pan_no: customer.pan_no,
        tax_preference: customer.tax_preference,
        brandPin:customer.brand_pin
      
      };

      res.json(formatted);
    } catch (err) {
      console.error("Error fetching customer:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update Customer by ID
  router.put("/:id", requireLogin, async (req, res) => {
    try {
      const customer = await CustomerMaster.findByPk(req.params.id);
      if (!customer) return res.status(404).json({ error: "Customer not found" });

      await customer.update({
        salutation: req.body.salutation,
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        company_name: req.body.companyName,
        customer_type: req.body.customerType,
        email: req.body.primaryEmail,
        display_name: req.body.customerDisplayName,
        payment_terms: req.body.paymentTerms,
        phone: req.body.primaryMobile,
        type: req.body.type,
        username: req.body.userName,
        password: req.body.password,
        attachment: req.body.attachment || null,
        currency: req.body.currency,
        brand_pin: req.body.brandPin,
        billing_address: req.body.billingAddress || "",
        billing_country: req.body.country || "",
        billing_city: req.body.city || "",
        billing_pincode: req.body.pinCode || "",
        gst_treatment: req.body.gst_treatment,
        gstin_no:req.body.gstin_no,
        state_name:req.body.state_name,
        state_name1:req.body.state_name1,
        pan_no: req.body.pan_no,
        tax_preference: req.body.tax_preference,
        shipping_address: req.body.shippingAddress || "",
        shipping_country: req.body.country1 || "",
        shipping_city: req.body.city1 || "",
        shipping_pincode: req.body.pinCode1 || "",
        account_number: req.body.accountNumber || "",
        account_holder_name: req.body.accountHolderName || "",
        bank_name: req.body.bankName || "",
        branch_address: req.body.branchAddress || "",
        ifsc_code: req.body.iFSCCode || "",
      });

      res.json(customer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Customer by ID
  router.delete("/:id", requireLogin, async (req, res) => {
    try {
      const customer = await CustomerMaster.findByPk(req.params.id);
      if (!customer) return res.status(404).json({ error: "Customer not found" });

      await customer.destroy();
      res.json({ message: "Customer deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
