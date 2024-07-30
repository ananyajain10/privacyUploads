const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.get('/', function(req, res) {
  res.send('hello');
});

app.get('/upload', function(req, res) {
  const uploadedImages = fs.readdirSync('public/uploads/');
  res.render('uploadImages', { images: uploadedImages });
});

app.post('/upload', upload.array('images', 5), function(req, res) {
  res.redirect('/upload');
});

app.listen(port, function() {
  console.log('Server is running on port 3000');
});