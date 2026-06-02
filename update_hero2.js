const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Update the background div
html = html.replace(/<!-- Tinted Collage Overlay Background -->\s*<div style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url\('images\/teacher\/hero_collage_bg\.png'\) [^>]+><\/div>/g, 
  '<!-- Main Hero Background Image -->\n    <div style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url(\\'images/teacher/hero_final_bg.png\\') center center / cover no-repeat; z-index: 1;\"></div>');

// 2. Remove Jack Ler2 image
html = html.replace(/<div class=\"hero-image-wrapper\"[^>]+>\s*<img src=\"images\/teacher\/Jack%20Ler2%20\(1\)\.png\"[^>]+>\s*<\/div>/g, 
  '<div class=\"hero-image-wrapper\" style=\"display: none;\"></div>');

// 3. Update Text and Transparency
html = html.replace(/<span style=\"color: #ffffff; text-shadow: 0 4px 15px rgba\(252,12,151,0\.5\); background: none; -webkit-background-clip: border-box;\">当你足够想要时<\/span>/g, 
  '<span style=\"color: rgba(255,255,255,0.7); text-shadow: none; background: none; -webkit-background-clip: border-box;\">当你足够想要时</span>');
html = html.replace(/<span style=\"color: var\(--text-main\); background: none; -webkit-background-clip: border-box; text-shadow: 2px 2px 0px rgba\(255,255,255,0\.5\);\">世界会听你的<\/span>/g, 
  '<span style=\"color: var(--text-main); background: none; -webkit-background-clip: border-box; text-shadow: none;\">世界会听你的</span>');

// 4. Update Button text and add btn-float class
html = html.replace(/<a href=\"shop\.html\" class=\"btn\"([^>]+)>立即挑选冲刺课程<\/a>/g, 
  '<a href=\"shop.html\" class=\"btn btn-float\"$1>选择你想要的课程</a>');
html = html.replace(/<a href=\"https:\/\/wa\.me\/[^\"]+\" target=\"_blank\" class=\"btn\"([^>]+)>\s*(<svg[^>]+>.*?<\/svg>)\s*WhatsApp 咨询\s*<\/a>/gs, 
  '<a href=\"https://wa.me/60123456789?text=我想咨询Jack老师的历史冲刺班\" target=\"_blank\" class=\"btn btn-float\"$1>\n            $2\n          WhatsApp 咨询\n          </a>');

fs.writeFileSync('index.html', html);

// 5. Add btn-float CSS
let css = fs.readFileSync('css/style.css', 'utf8');
if (!css.includes('.btn-float')) {
  css += '\n/* Floating Button Effect */\n.btn-float {\n  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease !important;\n}\n.btn-float:hover {\n  transform: translateY(-8px) !important;\n  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25) !important;\n}\n';
  fs.writeFileSync('css/style.css', css);
}

console.log('Update complete');
