const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const port = 3000;

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    !fs.existsSync(uploadDir) && fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `csv-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname) === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Hanya file CSV yang diperbolehkan!'));
    }
  }
});

// Middleware
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada file yang diupload' });
  }

  const results = [];
  const studentData = [];
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      results.forEach(student => {
        const scores = [];
        let total = 0;
        
        // Ekstrak nilai
        Object.entries(student).forEach(([key, value]) => {
          if (!isNaN(value) && !['nis', 'nama'].includes(key)) {
            const score = parseInt(value);
            scores.push(score);
            total += score;
          }
        });

        const average = total / scores.length;
        
        // Klasifikasi
        let classification = '';
        if (average >= 90) classification = 'Excellent';
        else if (average >= 80) classification = 'Good';
        else if (average >= 70) classification = 'Average';
        else classification = 'Need Improvement';

        studentData.push({
          id: student.nis,
          name: student.nama,
          scores: scores,
          total: total,
          average: average.toFixed(2),
          classification: classification
        });
      });

      res.json({
        fileInfo: {
          originalName: req.file.originalname,
          size: (req.file.size / 1024).toFixed(2) + ' KB'
        },
        students: studentData
      });
      
      // Hapus file setelah diproses
      fs.unlinkSync(req.file.path);
    })
    .on('error', error => {
      res.status(500).json({ error: 'Gagal memproses file CSV' });
    });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});