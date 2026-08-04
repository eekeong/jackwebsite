const fs = require('fs');

const adminPath = 'c:/Users/keong/Desktop/Jack Website/admin.html';
let adminHtml = fs.readFileSync(adminPath, 'utf8');

const regex = /<div class="grid grid-cols-1 md:grid-cols-3 gap-4">[\s\S]*?<label class="text-xs font-medium text-zinc-300" for="add-teaching-method">授课方式 \*<\/label>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

adminHtml = adminHtml.replace(regex, '');

fs.writeFileSync(adminPath, adminHtml, 'utf8');
console.log('Removed');
