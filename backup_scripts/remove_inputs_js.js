const fs = require('fs');

const adminPath = 'c:/Users/keong/Desktop/Jack Website/admin.html';
let adminHtml = fs.readFileSync(adminPath, 'utf8');

adminHtml = adminHtml.replace('const targetAudience = document.getElementById("add-target-audience").value.trim();', '');
adminHtml = adminHtml.replace('document.getElementById("add-target-audience").value = course.targetAudience || "";', '');

fs.writeFileSync(adminPath, adminHtml, 'utf8');
console.log('Removed');
