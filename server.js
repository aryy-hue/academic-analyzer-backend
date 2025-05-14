const express = require('express');
const uploadRoute = require('./routes/upload');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use('/upload', uploadRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
