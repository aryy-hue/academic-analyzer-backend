// app.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

const csv = require('csv-parser');

// Konfigurasi penyimpanan file dengan Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    
    // Membuat folder uploads jika belum ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Format nama file: originalname + timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter untuk hanya menerima file CSV
const csvFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || path.extname(file.originalname) === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Hanya file CSV yang diperbolehkan!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: csvFilter
});

// Route untuk halaman upload form
app.get('/', (req, res) => {
  res.send(`
    <h2>Upload File CSV</h2>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="csvFile" accept=".csv">
      <button type="submit">Upload</button>
    </form>
  `);
});

// Route untuk handle upload
app.post('/upload', upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Tidak ada file yang diupload');
  }
  
  // Informasi file yang diupload
  const fileInfo = {
    originalName: req.file.originalname,
    fileName: req.file.filename,
    size: req.file.size,
    path: req.file.path
  };

  res.send(`
    <h2>File berhasil diupload!</h2>
    <pre>${JSON.stringify(fileInfo, null, 2)}</pre>
    <a href="/">Kembali</a>
  `);
  // Di dalam route POST /upload
const results = [];
fs.createReadStream(req.file.path)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log('Data CSV:', results);
    // Lakukan sesuatu dengan data
  });
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});