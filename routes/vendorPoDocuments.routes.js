const express = require("express");
const router = express.Router();
const multer = require("multer");
const sequelize = require("../database"); // Sequelize instance
const { createStorage } = require("../config/multer");
const fs = require("fs");

const upload = multer({
  storage: createStorage("vendor-po"),
});

/**
 * 1️⃣ Upload Vendor PO document
 * POST /api/vendor-po/documents
 */
router.post("/vendor-po/documents", upload.single("file"), async (req, res) => {
  console.log("🟢 /vendor-po/documents POST called");
  console.log("REQ BODY:", req.body);
  console.log("REQ FILE:", req.file);

  try {
    const { vendor_po_id } = req.body;
    const file = req.file;

    if (!vendor_po_id) {
      console.warn("⚠️ vendor_po_id is missing");
      return res.status(400).json({ message: "vendor_po_id is required" });
    }

    if (!file) {
      console.warn("⚠️ File is missing");
      return res.status(400).json({ message: "File is required" });
    }

    console.log("💾 Inserting vendor PO file into DB...");

    await sequelize.query(
      `INSERT INTO vendor_po_documents
       (vendor_po_id, file_name, original_name, file_path, file_type, file_size)
       VALUES (:vendor_po_id, :file_name, :original_name, :file_path, :file_type, :file_size)`,
      {
        replacements: {
          vendor_po_id,
          file_name: file.filename,
          original_name: file.originalname,
          file_path: file.path,
          file_type: file.mimetype,
          file_size: file.size,
        },
      }
    );

    console.log("✅ Vendor PO document saved successfully");
    res.json({ message: "Vendor PO document uploaded successfully" });
  } catch (err) {
    console.error("❌ VENDOR PO UPLOAD ERROR:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

/**
 * 2️⃣ Get documents by Vendor PO
 * GET /api/vendor-po/:id/documents
 */
router.get("/vendor-po/:id/documents", async (req, res) => {
  console.log(
    "🟢 /vendor-po/:id/documents GET called with id:",
    req.params.id
  );

  try {
    const { id } = req.params;

    const [rows] = await sequelize.query(
      `SELECT *
       FROM vendor_po_documents
       WHERE vendor_po_id = :id
       ORDER BY uploaded_at DESC`,
      {
        replacements: { id },
      }
    );

    console.log(`📄 Found ${rows.length} documents for vendor_po_id ${id}`);
    res.json(rows);
  } catch (err) {
    console.error("❌ FETCH VENDOR DOCS ERROR:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch documents", error: err.message });
  }
});

/**
 * 3️⃣ Delete Vendor PO document
 * DELETE /api/vendor-po/documents/:docId
 */
router.delete("/vendor-po/documents/:docId", async (req, res) => {
  console.log(
    "🟢 /vendor-po/documents/:docId DELETE called with docId:",
    req.params.docId
  );

  try {
    const { docId } = req.params;

    const [docs] = await sequelize.query(
      `SELECT file_path
       FROM vendor_po_documents
       WHERE id = :docId`,
      {
        replacements: { docId },
      }
    );

    if (!docs.length) {
      console.warn("⚠️ Vendor document not found");
      return res.status(404).json({ message: "Document not found" });
    }

    if (fs.existsSync(docs[0].file_path)) {
      fs.unlinkSync(docs[0].file_path);
      console.log("🗑️ File deleted from disk:", docs[0].file_path);
    }

    await sequelize.query(
      `DELETE FROM vendor_po_documents WHERE id = :docId`,
      { replacements: { docId } }
    );

    console.log("✅ Vendor PO document deleted successfully");
    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error("❌ DELETE VENDOR DOC ERROR:", err);
    res
      .status(500)
      .json({ message: "Failed to delete document", error: err.message });
  }
});

module.exports = router;
