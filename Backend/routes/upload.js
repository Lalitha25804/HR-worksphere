const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Store images in the uploads folder
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// @route   POST /upload
// @desc    Upload an image
router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Return the URL for the uploaded file
    res.json({
      message: "File Uploaded Successfully",
      imageUrl: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Server Error during upload" });
  }
});

// Init document upload
const uploadDoc = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /csv|xlsx|xls|pdf|doc|docx|ppt|pptx|txt|rtf|zip|rar|png|jpg|jpeg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    } else {
      cb("Error: Unsupported file type!");
    }
  },
});

// @route   POST /upload/document
// @desc    Upload a document (csv/xlsx)
router.post("/document", uploadDoc.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Return the URL for the uploaded file
    res.json({
      message: "Document Uploaded Successfully",
      fileUrl: `/uploads/${req.file.filename}`,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Server Error during upload" });
  }
});

module.exports = router;
