const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Simpan file secara lokal di folder uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Route untuk upload CSV
router.post('/', upload.single('file'), (req, res) => {
  const results = [];
  const filePath = path.join(__dirname, '..', req.file.path);

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.json({
        message: 'CSV uploaded & parsed!',
        data: results
      });
    });
});

module.exports = router;
