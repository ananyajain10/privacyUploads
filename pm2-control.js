const pm2 = require('pm2');

pm2.connect(function(err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start({
    script: 'index.js',  // Your main application file
    name: 'image-upload-app',  // An arbitrary name for your app
    exec_mode: 'fork',  // You can use 'cluster' for multiple instances
    instances: 1,  // Number of instances to run (use 0 for max instances in cluster mode)
    max_memory_restart: '100M',  // Restart if it exceeds 100MB
    watch: false  // Set to true to watch for file changes and restart
  }, function(err, apps) {
    if (err) {
      console.error(err);
      return pm2.disconnect();
    }

    pm2.list((err, list) => {
      console.log(err, list);

      pm2.restart('image-upload-app', (err, proc) => {
        // Disconnects from PM2
        pm2.disconnect();
      });
    });
  });
});
