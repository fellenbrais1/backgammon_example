const fs = require('fs');
const browserify = require('browserify');

// Ensure the output directory exists
fs.mkdirSync('./dist', { recursive: true });

browserify('src/index.js', { debug: true }) //  Entry point
  .bundle()
  .on('error', (err) => {
    console.error(err);
    process.exit(1);
  })
  .pipe(fs.createWriteStream('dist/bundle.js')); // Output file
