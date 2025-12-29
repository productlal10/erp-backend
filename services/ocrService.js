

//////////////////////////////////////////////


// const Tesseract = require('tesseract.js');
// const sharp = require('sharp');
// const fs = require('fs').promises;

// class OCRService {
//   /**
//    * Pre-process image for better OCR accuracy
//    */
//   async preprocessImage(imagePath) {
//     const outputPath = `${imagePath}_processed.png`;
    
//     try {
//       await sharp(imagePath)
//         .greyscale()
//         .normalize()
//         .sharpen()
//         .threshold(128)
//         .toFile(outputPath);
      
//       return outputPath;
//     } catch (error) {
//       console.error('Image preprocessing error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Extract text from image using Tesseract OCR
//    */
//   async extractTextFromImage(imagePath) {
//     let worker = null;
    
//     try {
//       console.log('🔍 Starting OCR processing:', imagePath);
      
//       // Preprocess image
//       const processedImage = await this.preprocessImage(imagePath);
      
//       // Create worker
//       worker = await Tesseract.createWorker('eng', 1, {
//         logger: m => {
//           if (m.status === 'recognizing text') {
//             console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
//           }
//         }
//       });

//       console.log('✅ Worker created, starting recognition...');

//       // Perform OCR
//       const { data } = await worker.recognize(processedImage);
      
//       console.log('✅ OCR completed!');
//       console.log('📝 Extracted text length:', data.text.length);
      
//       // Log first 500 characters for debugging
//       console.log('📄 Text preview:', data.text.substring(0, 500));

//       // Cleanup
//       await worker.terminate();
//       await fs.unlink(processedImage);

//       return { 
//         text: data.text, 
//         confidence: data.confidence || 85 
//       };

//     } catch (error) {
//       console.error('❌ OCR Error:', error);
      
//       // Make sure to terminate worker even on error
//       if (worker) {
//         try {
//           await worker.terminate();
//         } catch (e) {
//           console.error('Error terminating worker:', e);
//         }
//       }
      
//       throw error;
//     }
//   }

//   /**
//    * Parse Vendor PO data from extracted text
//    */
//   parseVendorPO(text) {
//     console.log('📋 Parsing PO data from text...');
    
//     const poData = {
//       vendorPoNo: null,
//       vendorName: null,
//       vendorCode: null,
//       poDate: null,
//       totalAmount: null,
//       paymentTerms: null,
//       extractedText: text
//     };

//     // ✅ IMPROVED: Extract Purchase Order Number (format: VPO-XXXX)
//     const poNumberMatch = text.match(/(?:Purchase\s+Order\s+No|Purchase\s+order\s+No|PO\s+No)[:\s]*[:\-]?\s*([A-Z]{2,4}\-\d+)/i);
//     if (poNumberMatch) {
//       poData.vendorPoNo = poNumberMatch[1].trim();
//       console.log('✓ Found PO Number:', poData.vendorPoNo);
//     } else {
//       // Fallback: Look for VPO-XXXX pattern anywhere
//       const fallbackPO = text.match(/VPO\-\d+/i);
//       if (fallbackPO) {
//         poData.vendorPoNo = fallbackPO[0].trim();
//         console.log('✓ Found PO Number (fallback):', poData.vendorPoNo);
//       }
//     }

//     // ✅ IMPROVED: Extract Vendor Name (from "Vendor Address" section)
//     // Look for text after "Vendor Address" and before GSTIN or address
//     const vendorAddressSection = text.match(/Vendor\s+Address[:\s]+([\s\S]*?)(?:Delivered\s+To|GSTIN|Noida|[0-9]{2}[A-Z]{5})/i);
//     if (vendorAddressSection) {
//       const vendorLines = vendorAddressSection[1].trim().split('\n');
//       // First line is usually the vendor name
//       poData.vendorName = vendorLines[0].trim();
//       console.log('✓ Found Vendor Name:', poData.vendorName);
//     }

//     // ✅ IMPROVED: Extract Vendor Code (GSTIN format)
//     const gstinMatch = text.match(/([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1})/);
//     if (gstinMatch) {
//       poData.vendorCode = gstinMatch[1].trim();
//       console.log('✓ Found Vendor GSTIN:', poData.vendorCode);
//     }

//     // ✅ IMPROVED: Extract Purchase Order Date (format: DD-MMM-YYYY)
//     const dateMatch = text.match(/Purchase\s+order\s+Date[:\s]*(\d{1,2}[\-\/][A-Za-z]{3}[\-\/]\d{4})/i);
//     if (dateMatch) {
//       poData.poDate = dateMatch[1].trim();
//       console.log('✓ Found PO Date:', poData.poDate);
//     } else {
//       // Fallback: Look for any date pattern
//       const fallbackDate = text.match(/(\d{1,2}[\-\/][A-Za-z]{3}[\-\/]\d{4})/);
//       if (fallbackDate) {
//         poData.poDate = fallbackDate[1].trim();
//         console.log('✓ Found PO Date (fallback):', poData.poDate);
//       }
//     }

//     // ✅ IMPROVED: Extract Total Amount (look for "Total :" or "Sub Total :")
//     const totalMatch = text.match(/(?:Total|Sub\s+Total)\s*[:\-]\s*(?:₹|Rs\.?)?\s*([\d,]+\.?\d*)/i);
//     if (totalMatch) {
//       poData.totalAmount = parseFloat(totalMatch[1].replace(/,/g, ''));
//       console.log('✓ Found Total Amount:', poData.totalAmount);
//     }

//     // ✅ IMPROVED: Extract Payment Terms
//     const paymentMatch = text.match(/Payment\s+Terms\s*[:\-]\s*([^\n]+)/i);
//     if (paymentMatch) {
//       poData.paymentTerms = paymentMatch[1].trim();
//       console.log('✓ Found Payment Terms:', poData.paymentTerms);
//     }

//     return poData;
//   }

//   /**
//    * Main OCR processing method for Vendor PO
//    */
//   async processVendorPO(filePath) {
//     console.log('🚀 Processing Vendor PO:', filePath);
    
//     const { text, confidence } = await this.extractTextFromImage(filePath);
//     const parsedData = this.parseVendorPO(text);
    
//     console.log('✅ Processing complete!');
//     console.log('📊 Confidence:', confidence);
    
//     return {
//       ...parsedData,
//       confidence: confidence.toFixed(2),
//       status: confidence > 80 ? 'auto_approved' : 'needs_review'
//     };
//   }
// }

// module.exports = new OCRService();


/////////////////////////////

const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs').promises;

class OCRService {
  /**
   * Pre-process image for better OCR accuracy
   */
  async preprocessImage(imagePath) {
    const outputPath = `${imagePath}_processed.png`;
    
    try {
      await sharp(imagePath)
        .greyscale()
        .normalize()
        .sharpen()
        .threshold(128)
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw error;
    }
  }

  /**
   * Extract text from image using Tesseract OCR
   */
  async extractTextFromImage(imagePath) {
    let worker = null;
    
    try {
      console.log('🔍 Starting OCR processing:', imagePath);
      
      // Preprocess image
      const processedImage = await this.preprocessImage(imagePath);
      
      // Create worker
      worker = await Tesseract.createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      console.log('✅ Worker created, starting recognition...');

      // Perform OCR
      const { data } = await worker.recognize(processedImage);
      
      console.log('✅ OCR completed!');
      console.log('📝 Extracted text length:', data.text.length);
      
      // Log first 500 characters for debugging
      console.log('📄 Text preview:', data.text.substring(0, 500));

      // Cleanup
      await worker.terminate();
      await fs.unlink(processedImage);

      return { 
        text: data.text, 
        confidence: data.confidence || 85 
      };

    } catch (error) {
      console.error('❌ OCR Error:', error);
      
      // Make sure to terminate worker even on error
      if (worker) {
        try {
          await worker.terminate();
        } catch (e) {
          console.error('Error terminating worker:', e);
        }
      }
      
      throw error;
    }
  }

  /**
   * Parse Vendor PO data from extracted text
   */
  parseVendorPO(text) {
    console.log('📋 Parsing Vendor PO data from text...');
    
    const poData = {
      vendorPoNo: null,
      vendorName: null,
      vendorCode: null,
      poDate: null,
      totalAmount: null,
      paymentTerms: null,
      extractedText: text
    };

    // Extract Purchase Order Number (format: VPO-XXXX)
    const poNumberMatch = text.match(/(?:Purchase\s+Order\s+No|PO\s+No)[:\s]*[:\-]?\s*([A-Z]{2,4}\-\d+)/i);
    if (poNumberMatch) {
      poData.vendorPoNo = poNumberMatch[1].trim();
      console.log('✓ Found PO Number:', poData.vendorPoNo);
    }

    // Extract Vendor Name (from "Vendor Address" section)
    const vendorAddressSection = text.match(/Vendor\s+Address[:\s]+([\s\S]*?)(?:Delivered\s+To|GSTIN|Noida|[0-9]{2}[A-Z]{5})/i);
    if (vendorAddressSection) {
      const vendorLines = vendorAddressSection[1].trim().split('\n');
      poData.vendorName = vendorLines[0].trim();
      console.log('✓ Found Vendor Name:', poData.vendorName);
    }

    // Extract Vendor Code (GSTIN)
    const gstinMatch = text.match(/([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1})/);
    if (gstinMatch) {
      poData.vendorCode = gstinMatch[1].trim();
      console.log('✓ Found Vendor GSTIN:', poData.vendorCode);
    }

    // Extract Purchase Order Date
    const dateMatch = text.match(/Purchase\s+order\s+Date[:\s]*(\d{1,2}[\-\/][A-Za-z]{3}[\-\/]\d{4})/i);
    if (dateMatch) {
      poData.poDate = dateMatch[1].trim();
      console.log('✓ Found PO Date:', poData.poDate);
    }

    // Extract Total Amount
    const totalMatch = text.match(/(?:Total|Sub\s+Total)\s*[:\-]\s*(?:₹|Rs\.?)?\s*([\d,]+\.?\d*)/i);
    if (totalMatch) {
      poData.totalAmount = parseFloat(totalMatch[1].replace(/,/g, ''));
      console.log('✓ Found Total Amount:', poData.totalAmount);
    }

    // Extract Payment Terms
    const paymentMatch = text.match(/Payment\s+Terms\s*[:\-]\s*([^\n]+)/i);
    if (paymentMatch) {
      poData.paymentTerms = paymentMatch[1].trim();
      console.log('✓ Found Payment Terms:', poData.paymentTerms);
    }

    return poData;
  }

  /**
   * Parse Buyer PO data from extracted text
   */
  parseBuyerPO(text) {
    console.log('📋 Parsing Buyer PO data from text...');
    
    const poData = {
      buyerPoNumber: null,
      buyerName: null,
      customerCode: null,
      orderDate: null,
      deliveryDate: null,
      totalAmount: null,
      poReferenceNumber: null,
      paymentTerms: null,
      extractedText: text
    };

    // ✅ IMPROVED: Extract PO Number (multiple patterns)
    // Pattern 1: "PO No :" format
    let poMatch = text.match(/PO\s+No\s*[:\-]\s*([A-Z0-9\-]+)/i);
    if (poMatch) {
      poData.buyerPoNumber = poMatch[1].trim();
      console.log('✓ Found PO Number (Pattern 1):', poData.buyerPoNumber);
    }
    
    // Pattern 2: Look for alphanumeric codes near "PO"
    if (!poData.buyerPoNumber) {
      const fallbackPO = text.match(/(?:MW|PO)[0-9]{6,}/i);
      if (fallbackPO) {
        poData.buyerPoNumber = fallbackPO[0].trim();
        console.log('✓ Found PO Number (Pattern 2):', poData.buyerPoNumber);
      }
    }

    // ✅ IMPROVED: Extract Vendor/Buyer Name
    // Look for "Vendor Name :" section
    const vendorNameMatch = text.match(/Vendor\s+Name\s*[:\-]\s*([^\n]+)/i);
    if (vendorNameMatch) {
      poData.buyerName = vendorNameMatch[1].trim();
      console.log('✓ Found Buyer Name:', poData.buyerName);
    } else {
      // Fallback: Look for company names with "Private Limited" or "Pvt Ltd"
      const companyMatch = text.match(/([A-Za-z\s]+(?:Private\s+Limited|Pvt\.?\s*Ltd\.?))/i);
      if (companyMatch) {
        poData.buyerName = companyMatch[1].trim();
        console.log('✓ Found Buyer Name (fallback):', poData.buyerName);
      }
    }

    // ✅ IMPROVED: Extract Extern PO No
    const externPOMatch = text.match(/Extern\s+PO\s+No\.?\s*[:\-]\s*([A-Z0-9\-]+)/i);
    if (externPOMatch) {
      poData.poReferenceNumber = externPOMatch[1].trim();
      console.log('✓ Found Extern PO Number:', poData.poReferenceNumber);
    }

    // ✅ IMPROVED: Extract PO Date (multiple formats)
    const poDateMatch = text.match(/PO\s+Date\s*[:\-]\s*([A-Za-z]{3}\s+\d{1,2},?\s+\d{4}|\d{1,2}[\-\/][A-Za-z]{3}[\-\/]\d{4})/i);
    if (poDateMatch) {
      poData.orderDate = poDateMatch[1].trim();
      console.log('✓ Found PO Date:', poData.orderDate);
    }

    // ✅ IMPROVED: Extract Expected Delivery Date
    const deliveryMatch = text.match(/Expected\s+Delivery\s+Date\s*[:\-]\s*([A-Za-z]{3}\s+\d{1,2},?\s+\d{4}|\d{1,2}[\-\/][A-Za-z]{3}[\-\/]\d{4})/i);
    if (deliveryMatch) {
      poData.deliveryDate = deliveryMatch[1].trim();
      console.log('✓ Found Delivery Date:', poData.deliveryDate);
    }

    // ✅ IMPROVED: Extract Payment Terms
    const paymentMatch = text.match(/Payment\s+Terms\s*[:\-]\s*([^\n]+)/i);
    if (paymentMatch) {
      poData.paymentTerms = paymentMatch[1].trim();
      console.log('✓ Found Payment Terms:', poData.paymentTerms);
    }

    // ✅ IMPROVED: Extract Total Amount (from table or summary)
    // Look for large numbers that could be totals
    const totalMatches = text.match(/(\d{5,}\.?\d{0,2})/g);
    if (totalMatches && totalMatches.length > 0) {
      // Get the largest number (likely the total)
      const amounts = totalMatches.map(n => parseFloat(n.replace(/,/g, '')));
      poData.totalAmount = Math.max(...amounts);
      console.log('✓ Found Total Amount:', poData.totalAmount);
    }

    return poData;
  }

  /**
   * Main OCR processing method for Vendor PO
   */
  async processVendorPO(filePath) {
    console.log('🚀 Processing Vendor PO:', filePath);
    
    const { text, confidence } = await this.extractTextFromImage(filePath);
    const parsedData = this.parseVendorPO(text);
    
    console.log('✅ Processing complete!');
    console.log('📊 Confidence:', confidence);
    
    return {
      ...parsedData,
      confidence: confidence.toFixed(2),
      status: confidence > 80 ? 'auto_approved' : 'needs_review'
    };
  }

  /**
   * Main OCR processing method for Buyer PO
   */
  async processBuyerPO(filePath) {
    console.log('🚀 Processing Buyer PO:', filePath);
    
    const { text, confidence } = await this.extractTextFromImage(filePath);
    const parsedData = this.parseBuyerPO(text);
    
    console.log('✅ Processing complete!');
    console.log('📊 Confidence:', confidence);
    
    return {
      ...parsedData,
      confidence: confidence.toFixed(2),
      status: confidence > 80 ? 'auto_approved' : 'needs_review'
    };
  }
}

module.exports = new OCRService();