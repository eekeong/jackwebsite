const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Remove the old .hero-image-bg
content = content.replace(/<div class=\"hero-image-bg\"><\/div>\s*/g, '');

// 2. Fix the inline styles for the h1 spans to disable background clip
content = content.replace(/<span style=\"color: #ffffff; text-shadow: 0 4px 15px rgba\(252,12,151,0\.5\);\">/g, 
  '<span style=\"color: #ffffff; text-shadow: 0 4px 15px rgba(252,12,151,0.5); background: none; -webkit-background-clip: border-box;\">');
content = content.replace(/<span style=\"color: var\(--text-main\);\">/g, 
  '<span style=\"color: var(--text-main); background: none; -webkit-background-clip: border-box; text-shadow: 2px 2px 0px rgba(255,255,255,0.5);\">');

// 3. Make the overlay collage cover the entire area
content = content.replace(/<div style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url\('images\/teacher\/hero_collage_bg\.png'\) center center \/ cover no-repeat; mix-blend-mode: multiply; opacity: 0\.85; z-index: 1;\"><\/div>/g,
  '<div style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url(\'images/teacher/hero_collage_bg.png\') center center / cover no-repeat; mix-blend-mode: multiply; opacity: 0.85; z-index: 1;\"></div>');

// 4. Also fix the CSS file to remove the old .hero-image-bg completely
let cssContent = fs.readFileSync('css/style.css', 'utf8');
cssContent = cssContent.replace(/\.hero-image-bg \{[\s\S]*?opacity: 1;\n\}/g, '');
cssContent = cssContent.replace(/\@media \(min-width: 768px\) \{\s*\.hero-image-bg \{[\s\S]*?\}\s*\}/g, '');
fs.writeFileSync('css/style.css', cssContent);

fs.writeFileSync('index.html', content);
console.log('Fixed index.html and style.css');
