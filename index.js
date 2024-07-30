const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pm2 = require('pm2');

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

// PM2 process management
function startPM2() {
  pm2.connect(function(err) {
    if (err) {
      console.error(err);
      process.exit(2);
    }

    pm2.start({
      script: 'index.js',
      name: 'image-upload-app',
      exec_mode: 'cluster',
      instances: 2
    }, function(err, apps) {
      if (err) {
        console.error(err);
        return pm2.disconnect();
      }

      console.log('PM2 started');
      pm2.disconnect();
    });
  });
}

if (require.main === module) {
  // Start the Express server
  app.listen(port, function() {
    console.log('Server is running on port 3000');
  });

  // Start PM2
  startPM2();
} else {
  // Export for PM2
  module.exports = app;
}

process.on('message', function(packet) {
  console.log('Received message:', packet);
  // You can handle the received message here
  process.send({
    type: 'process:msg',
    data: {
      success: true
    }
  });
});