const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const images = [
  { src: path.join(__dirname, 'panda.JPG'), dest: 'panda.JPG' },
  { src: path.join(__dirname, 'monk.JPG'), dest: 'monk.JPG' },
  { src: path.join(__dirname, 'monster.JPG'), dest: 'monster.JPG' },
  { src: path.join(__dirname, 'panda.JPG'), dest: 'panda.jpg' },
  { src: path.join(__dirname, 'monk.JPG'), dest: 'monk.jpg' },
  { src: path.join(__dirname, 'monster.JPG'), dest: 'monster.jpg' },
  { src: path.join(__dirname, 'panda.JPG'), dest: 'panda.png' },
  { src: path.join(__dirname, 'monk.JPG'), dest: 'monk.png' },
  { src: path.join(__dirname, 'monster.JPG'), dest: 'monster.png' }
];

images.forEach(img => {
  if (fs.existsSync(img.src)) {
    fs.copyFileSync(img.src, path.join(assetsDir, img.dest));
    console.log(`Copied ${img.dest} to assets/`);
  } else {
    console.log(`Source not found: ${img.src}`);
  }
});
