

//////


// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const ocrService = require('../services/ocrService');
// const VendorPO = require('../models/vendorPo');
// const SystemPO = require('../models/systemPo');

// const router = express.Router();

// // Create uploads directory if it doesn't exist
// const uploadDir = 'uploads/po_documents';
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Configure multer for file upload
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, 'po-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Only image files (JPEG, JPG, PNG) are allowed'));
//     }
//   }
// });

// /**
//  * POST /api/ocr/upload-vendor-po
//  * Upload and process Vendor PO document
//  */
// router.post('/upload-vendor-po', upload.single('document'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const filePath = req.file.path;
//     console.log('Processing Vendor PO:', filePath);

//     // ✅ FIXED: Call correct function name
//     const ocrResult = await ocrService.processVendorPO(filePath);

//     // ✅ FIXED: Return data (not ocrResult) to match frontend expectations
//     res.json({
//       success: true,
//       message: 'OCR processing completed',
//       data: {
//         vendorPoNo: ocrResult.vendorPoNo,
//         vendorName: ocrResult.vendorName,
//         vendorCode: ocrResult.vendorCode,
//         poDate: ocrResult.poDate,
//         totalAmount: ocrResult.totalAmount,
//         paymentTerms: ocrResult.paymentTerms,
//         confidence: ocrResult.confidence,
//         status: ocrResult.status,
//         extractedText: ocrResult.extractedText
//       },
//       filePath: filePath
//     });

//   } catch (error) {
//     console.error('Vendor PO upload error:', error);
//     res.status(500).json({ 
//       error: 'Failed to process document',
//       message: error.message 
//     });
//   }
// });

// /**
//  * POST /api/ocr/upload-buyer-po
//  * Upload and process Buyer PO document
//  * NOTE: This route is included but buyer PO OCR is not implemented yet
//  */
// router.post('/upload-buyer-po', upload.single('document'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const filePath = req.file.path;
//     console.log('Processing Buyer PO:', filePath);

//     // Note: Buyer PO processing not implemented in ocrService yet
//     res.status(501).json({
//       success: false,
//       message: 'Buyer PO OCR not implemented yet',
//       error: 'This feature is coming soon'
//     });

//   } catch (error) {
//     console.error('Buyer PO upload error:', error);
//     res.status(500).json({ 
//       error: 'Failed to process document',
//       message: error.message 
//     });
//   }
// });

// /**
//  * POST /api/ocr/save-vendor-po
//  * Save verified Vendor PO data to database
//  */
// router.post('/save-vendor-po', async (req, res) => {
//   try {
//     const {
//       vendorPoNo,
//       vendorId,
//       systemPoId,
//       buyerPoNumber,
//       orderType,
//       vendorCompanyName,
//       vendorName,
//       vendorCode,
//       primaryEmailId,
//       paymentTerms,
//       requestedBy,
//       buyerCompanyName,
//       purchaseOrderDate,
//       expectedDeliveryDate,
//       subTotal,
//       shippingCost,
//       discount,
//       totalAmount,
//       termsAndConditions,
//       filePath
//     } = req.body;

//     // Create Vendor PO in database
//     const vendorPo = await VendorPO.create({
//       vendor_po_no: vendorPoNo,
//       vendor_id: vendorId || null,
//       system_po_id: systemPoId || null,
//       buyer_po_number: buyerPoNumber || null,
//       order_type: orderType || 'standard',
//       status: 'pending',
//       vendor_company_name: vendorCompanyName || null,
//       vendor_name: vendorName,
//       vendor_code: vendorCode || null,
//       primary_email_id: primaryEmailId || null,
//       payment_terms: paymentTerms,
//       requested_by: requestedBy || null,
//       buyer_company_name: buyerCompanyName || null,
//       purchase_order_date: purchaseOrderDate,
//       expected_delivery_date: expectedDeliveryDate || null,
//       sub_total: subTotal || 0,
//       shipping_cost: shippingCost || 0,
//       discount: discount || 0,
//       total_amount: totalAmount,
//       terms_and_conditions: termsAndConditions || null
//     });

//     res.json({
//       success: true,
//       message: 'Vendor PO saved successfully',
//       data: vendorPo
//     });

//   } catch (error) {
//     console.error('Save Vendor PO error:', error);
//     res.status(500).json({ 
//       error: 'Failed to save Vendor PO',
//       message: error.message 
//     });
//   }
// });

// /**
//  * POST /api/ocr/save-buyer-po
//  * Save verified Buyer PO data to database
//  */
// router.post('/save-buyer-po', async (req, res) => {
//   try {
//     const {
//       poNumber,
//       customerId,
//       merchandiser,
//       department,
//       uploadBuyerPo,
//       buyerName,
//       customerCode,
//       buyerOrderDate,
//       expectedDeliveryDate,
//       buyerPoReferenceNumber,
//       typeOfBuyerPo,
//       discountAmount,
//       subTotalAmount,
//       gstAmount,
//       shippingCost,
//       totalAmount,
//       billingAddress,
//       shippingAddress,
//       filePath
//     } = req.body;

//     // Create System PO (Buyer PO) in database
//     const systemPo = await SystemPO.create({
//       po_number: poNumber,
//       customer_id: customerId,
//       status: 'pending',
//       merchandiser: merchandiser,
//       department: department,
//       upload_buyer_po: uploadBuyerPo,
//       buyer_name: buyerName,
//       customer_code: customerCode,
//       buyer_order_date: buyerOrderDate,
//       expected_delivery_date: expectedDeliveryDate,
//       buyer_po_reference_number: buyerPoReferenceNumber,
//       type_of_buyer_po: typeOfBuyerPo,
//       discount_amount: discountAmount,
//       sub_total_amount: subTotalAmount,
//       gst_amount: gstAmount,
//       shipping_cost: shippingCost,
//       total_amount: totalAmount,
//       billing_address: billingAddress,
//       shipping_address: shippingAddress
//     });

//     res.json({
//       success: true,
//       message: 'Buyer PO saved successfully',
//       data: systemPo
//     });

//   } catch (error) {
//     console.error('Save Buyer PO error:', error);
//     res.status(500).json({ 
//       error: 'Failed to save Buyer PO',
//       message: error.message 
//     });
//   }
// });

// /**
//  * GET /api/ocr/test
//  * Test endpoint to verify OCR routes are working
//  */
// router.get('/test', (req, res) => {
//   res.json({ 
//     success: true, 
//     message: 'OCR routes are working!',
//     endpoints: [
//       'POST /api/ocr/upload-vendor-po',
//       'POST /api/ocr/upload-buyer-po (not implemented)',
//       'POST /api/ocr/save-vendor-po',
//       'POST /api/ocr/save-buyer-po'
//     ]
//   });
// });

// module.exports = router;


//////////////////////

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ocrService = require('../services/ocrService');
const VendorPO = require('../models/vendorPo');
const SystemPO = require('../models/systemPo');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/po_documents';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'po-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG) are allowed'));
    }
  }
});

/**
 * POST /api/ocr/upload-vendor-po
 * Upload and process Vendor PO document
 */
router.post('/upload-vendor-po', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    console.log('Processing Vendor PO:', filePath);

    // ✅ FIXED: Call processVendorPO instead of processPODocument
    const ocrResult = await ocrService.processVendorPO(filePath);

    // ✅ FIXED: Return 'data' instead of 'ocrResult' to match frontend
    res.json({
      success: true,
      message: 'OCR processing completed',
      data: {
        vendorPoNo: ocrResult.vendorPoNo,
        vendorName: ocrResult.vendorName,
        vendorCode: ocrResult.vendorCode,
        poDate: ocrResult.poDate,
        totalAmount: ocrResult.totalAmount,
        paymentTerms: ocrResult.paymentTerms,
        confidence: ocrResult.confidence,
        status: ocrResult.status,
        extractedText: ocrResult.extractedText
      },
      filePath: filePath
    });

  } catch (error) {
    console.error('Vendor PO upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process document',
      message: error.message 
    });
  }
});

/**
 * POST /api/ocr/upload-buyer-po
 * Upload and process Buyer PO document
 */
router.post('/upload-buyer-po', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    console.log('Processing Buyer PO:', filePath);

    // ✅ FIXED: Call processBuyerPO instead of processPODocument
    const ocrResult = await ocrService.processBuyerPO(filePath);

    // ✅ FIXED: Return 'data' instead of 'ocrResult' to match frontend
    res.json({
      success: true,
      message: 'OCR processing completed',
      data: {
        buyerPoNumber: ocrResult.buyerPoNumber,
        buyerName: ocrResult.buyerName,
        customerCode: ocrResult.customerCode,
        orderDate: ocrResult.orderDate,
        deliveryDate: ocrResult.deliveryDate,
        totalAmount: ocrResult.totalAmount,
        poReferenceNumber: ocrResult.poReferenceNumber,
        confidence: ocrResult.confidence,
        status: ocrResult.status,
        extractedText: ocrResult.extractedText
      },
      filePath: filePath
    });

  } catch (error) {
    console.error('Buyer PO upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process document',
      message: error.message 
    });
  }
});

/**
 * POST /api/ocr/save-vendor-po
 * Save verified Vendor PO data to database
 */
router.post('/save-vendor-po', async (req, res) => {
  try {
    const {
      vendorPoNo,
      vendorId,
      systemPoId,
      buyerPoNumber,
      orderType,
      vendorCompanyName,
      vendorName,
      vendorCode,
      primaryEmailId,
      paymentTerms,
      requestedBy,
      buyerCompanyName,
      purchaseOrderDate,
      expectedDeliveryDate,
      subTotal,
      shippingCost,
      discount,
      totalAmount,
      termsAndConditions,
      filePath
    } = req.body;

    // Create Vendor PO in database
    const vendorPo = await VendorPO.create({
      vendor_po_no: vendorPoNo,
      vendor_id: vendorId || null,
      system_po_id: systemPoId || null,
      buyer_po_number: buyerPoNumber || null,
      order_type: orderType || 'standard',
      status: 'pending',
      vendor_company_name: vendorCompanyName || null,
      vendor_name: vendorName,
      vendor_code: vendorCode || null,
      primary_email_id: primaryEmailId || null,
      payment_terms: paymentTerms,
      requested_by: requestedBy || null,
      buyer_company_name: buyerCompanyName || null,
      purchase_order_date: purchaseOrderDate,
      expected_delivery_date: expectedDeliveryDate || null,
      sub_total: subTotal || 0,
      shipping_cost: shippingCost || 0,
      discount: discount || 0,
      total_amount: totalAmount,
      terms_and_conditions: termsAndConditions || null
    });

    res.json({
      success: true,
      message: 'Vendor PO saved successfully',
      data: vendorPo
    });

  } catch (error) {
    console.error('Save Vendor PO error:', error);
    res.status(500).json({ 
      error: 'Failed to save Vendor PO',
      message: error.message 
    });
  }
});

/**
 * POST /api/ocr/save-buyer-po
 * Save verified Buyer PO data to database
 */
router.post('/save-buyer-po', async (req, res) => {
  try {
    const {
      poNumber,
      customerId,
      merchandiser,
      department,
      uploadBuyerPo,
      buyerName,
      customerCode,
      buyerOrderDate,
      expectedDeliveryDate,
      buyerPoReferenceNumber,
      typeOfBuyerPo,
      discountAmount,
      subTotalAmount,
      gstAmount,
      shippingCost,
      totalAmount,
      billingAddress,
      shippingAddress,
      filePath
    } = req.body;

    // Create System PO (Buyer PO) in database
    const systemPo = await SystemPO.create({
      po_number: poNumber,
      customer_id: customerId || null,
      status: 'pending',
      merchandiser: merchandiser || null,
      department: department || null,
      upload_buyer_po: uploadBuyerPo || null,
      buyer_name: buyerName,
      customer_code: customerCode || null,
      buyer_order_date: buyerOrderDate,
      expected_delivery_date: expectedDeliveryDate || null,
      buyer_po_reference_number: buyerPoReferenceNumber || null,
      type_of_buyer_po: typeOfBuyerPo || null,
      discount_amount: discountAmount || 0,
      sub_total_amount: subTotalAmount || 0,
      gst_amount: gstAmount || 0,
      shipping_cost: shippingCost || 0,
      total_amount: totalAmount,
      billing_address: billingAddress || null,
      shipping_address: shippingAddress || null
    });

    res.json({
      success: true,
      message: 'Buyer PO saved successfully',
      data: systemPo
    });

  } catch (error) {
    console.error('Save Buyer PO error:', error);
    res.status(500).json({ 
      error: 'Failed to save Buyer PO',
      message: error.message 
    });
  }
});

/**
 * GET /api/ocr/test
 * Test endpoint to verify OCR routes are working
 */
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'OCR routes are working!',
    endpoints: [
      'POST /api/ocr/upload-vendor-po',
      'POST /api/ocr/upload-buyer-po',
      'POST /api/ocr/save-vendor-po',
      'POST /api/ocr/save-buyer-po'
    ]
  });
});

module.exports = router;