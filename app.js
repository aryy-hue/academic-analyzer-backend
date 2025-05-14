const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Pastikan folder uploads ada
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Multer untuk CSV
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter hanya menerima file CSV
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'text/csv',
    'application/vnd.ms-excel',
    'text/plain'
  ];
  
  const isCSV = allowedMimes.includes(file.mimetype) || 
              path.extname(file.originalname).toLowerCase() === '.csv';

  if (isCSV) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file CSV yang diperbolehkan'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  fileFilter: fileFilter
});

// Endpoint upload CSV
app.post('/upload-csv', upload.single('csvfile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diupload'
      });
    }

    res.status(200).json({
      success: true,
      message: 'File CSV berhasil diupload',
      details: {
        originalName: req.file.originalname,
        savedName: req.file.filename,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan server'
  });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});