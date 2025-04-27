const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create the icons directory if it doesn't exist
const iconsDir = __dirname;
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes to generate
const sizes = [16, 32, 48, 128];

// Generate an icon for each size
sizes.forEach(size => {
  // Create a canvas with the specified size
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Draw a purple rounded rectangle background
  ctx.fillStyle = '#a17be0';
  ctx.beginPath();
  const radius = size / 8;
  ctx.moveTo(size, radius);
  ctx.arcTo(size, 0, size - radius, 0, radius);
  ctx.lineTo(radius, 0);
  ctx.arcTo(0, 0, 0, radius, radius);
  ctx.lineTo(0, size - radius);
  ctx.arcTo(0, size, radius, size, radius);
  ctx.lineTo(size - radius, size);
  ctx.arcTo(size, size, size, size - radius, radius);
  ctx.lineTo(size, radius);
  ctx.fill();

  // Draw "AI" text
  const fontSize = Math.floor(size * 0.6);
  ctx.fillStyle = 'white';
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI', size / 2, size / 2);

  // Save the canvas as a PNG file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), buffer);
  
  console.log(`Generated icon-${size}.png`);
});

// Generate manifest icons object
const manifestIcons = {};
sizes.forEach(size => {
  manifestIcons[size] = `icons/icon-${size}.png`;
});

// Write manifest icons object to a JSON file
fs.writeFileSync(
  path.join(iconsDir, 'icons.json'),
  JSON.stringify(manifestIcons, null, 2)
);

console.log('Generated icons.json for manifest'); 