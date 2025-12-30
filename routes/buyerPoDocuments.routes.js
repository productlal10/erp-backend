const express = require("express");
const router = express.Router();
const multer = require("multer");
const sequelize = require("../database"); // ⚠️ Sequelize instance
const { createStorage } = require("../config/multer");
const fs = require("fs");

const upload = multer({
  storage: createStorage("buyer-po"),
});

/**
 * 1️⃣ Upload Buyer PO document
 * POST /api/buyer-po/documents
 */
router.post("/buyer-po/documents", upload.single("file"), async (req, res) => {
  console.log("🟢 /buyer-po/documents POST called");
  console.log("REQ BODY:", req.body);
  console.log("REQ FILE:", req.file);

  try {
    const { buyer_po_id } = req.body;
    const file = req.file;

    if (!buyer_po_id) {
      console.warn("⚠️ buyer_po_id is missing");
      return res.status(400).json({ message: "buyer_po_id is required" });
    }

    if (!file) {
      console.warn("⚠️ File is missing");
      return res.status(400).json({ message: "File is required" });
    }

    console.log("💾 Inserting file into DB...");

    await sequelize.query(
      `INSERT INTO buyer_po_documents
       (buyer_po_id, file_name, original_name, file_path, file_type, file_size)
       VALUES (:buyer_po_id, :file_name, :original_name, :file_path, :file_type, :file_size)`,
      {
        replacements: {
          buyer_po_id,
          file_name: file.filename,
          original_name: file.originalname,
          file_path: file.path,
          file_type: file.mimetype,
          file_size: file.size,
        },
      }
    );

    console.log("✅ File saved to DB successfully");
    res.json({ message: "Buyer PO document uploaded successfully" });
  } catch (err) {
    console.error("❌ UPLOAD ERROR:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

/**
 * 2️⃣ Get documents by Buyer PO
 * GET /api/buyer-po/:id/documents
 */
router.get("/buyer-po/:id/documents", async (req, res) => {
  console.log("🟢 /buyer-po/:id/documents GET called with id:", req.params.id);

  try {
    const { id } = req.params;

    const [rows] = await sequelize.query(
      `SELECT *
       FROM buyer_po_documents
       WHERE buyer_po_id = :id
       ORDER BY uploaded_at DESC`,
      {
        replacements: { id },
      }
    );

    console.log(`📄 Found ${rows.length} documents for buyer_po_id ${id}`);
    res.json(rows);
  } catch (err) {
    console.error("❌ FETCH DOCS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch documents", error: err.message });
  }
});

/**
 * 3️⃣ Delete document
 * DELETE /api/buyer-po/documents/:docId
 */
router.delete("/buyer-po/documents/:docId", async (req, res) => {
  console.log("🟢 /buyer-po/documents/:docId DELETE called with docId:", req.params.docId);

  try {
    const { docId } = req.params;

    const [docs] = await sequelize.query(
      `SELECT file_path FROM buyer_po_documents WHERE id = :docId`,
      {
        replacements: { docId },
      }
    );

    if (!docs.length) {
      console.warn("⚠️ Document not found in DB");
      return res.status(404).json({ message: "Document not found" });
    }

    if (fs.existsSync(docs[0].file_path)) {
      fs.unlinkSync(docs[0].file_path);
      console.log("🗑️ File deleted from disk:", docs[0].file_path);
    } else {
      console.warn("⚠️ File path does not exist on disk:", docs[0].file_path);
    }

    await sequelize.query(
      `DELETE FROM buyer_po_documents WHERE id = :docId`,
      { replacements: { docId } }
    );

    console.log("✅ Document deleted from DB successfully");
    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error("❌ DELETE DOC ERROR:", err);
    res.status(500).json({ message: "Failed to delete document", error: err.message });
  }
});

module.exports = router;
