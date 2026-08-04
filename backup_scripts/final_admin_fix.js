const fs = require('fs');

let adminHtml = fs.readFileSync('c:/Users/keong/Desktop/Jack Website/admin.html', 'utf8');

// 1. Remove teaching method, duration, target audience HTML
adminHtml = adminHtml.replace(/<div class="grid grid-cols-1 md:grid-cols-3 gap-4">[\s\S]*?<label class="text-xs font-medium text-zinc-300" for="add-teaching-method">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');

// 2. Add Pricing HTML
const pricingSearch = /<div class="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?add-price1month[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<div class="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?add-price3month[\s\S]*?<\/div>\s*<\/div>/;
const pricingReplace = `              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-pink-500">2. Pricing Options (价格变体)</h3>
                <button type="button" onclick="window.addPricingRow()" class="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 bg-pink-500/10 px-2 py-1 rounded">
                  <i data-lucide="plus" class="w-3 h-3"></i> 加新配套
                </button>
              </div>
              <div id="pricing-container" class="space-y-2"></div>`;
adminHtml = adminHtml.replace(pricingSearch, pricingReplace);

// 3. Add window.addPricingRow
const helperScript = `
      // ---- Pricing Options Helper ----
      window.addPricingRow = function(name = "", price = "", originalPrice = "") {
        const container = document.getElementById('pricing-container');
        const id = 'price-' + Date.now() + Math.random().toString(36).substr(2,5);
        const div = document.createElement('div');
        div.className = "flex gap-2 items-center p-2 border border-zinc-800 rounded bg-zinc-900";
        div.id = id;
        div.innerHTML = \`
          <div class="flex-1 space-y-1">
            <input type="text" data-pricing-name class="flex h-8 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 placeholder:text-zinc-500" placeholder="Variant Name (e.g. 1个月套餐)" value="\${name.replace(/"/g, '&quot;')}">
          </div>
          <div class="w-24 space-y-1">
            <input type="number" step="0.01" data-pricing-price class="flex h-8 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 placeholder:text-zinc-500" placeholder="Price" value="\${price}">
          </div>
          <div class="w-24 space-y-1">
            <input type="number" step="0.01" data-pricing-orig class="flex h-8 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 placeholder:text-zinc-500" placeholder="Orig. Price" value="\${originalPrice}">
          </div>
          <button type="button" onclick="document.getElementById('\${id}').remove()" class="text-zinc-500 hover:text-red-400 p-1 mt-1">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        \`;
        container.appendChild(div);
        if(window.lucide) window.lucide.createIcons();
      };
`;
if (!adminHtml.includes('window.addPricingRow')) {
  adminHtml = adminHtml.replace('// ---- Modal Controls ----', helperScript + '\n// ---- Modal Controls ----');
}

// 4. handleEditCourse JS
const handleEditSearch = /document\.getElementById\("add-price1month"\)\.value[\s\S]*?document\.getElementById\("add-target-audience"\)\.value = course\.targetAudience \|\| "";/;
const handleEditReplace = `document.getElementById('pricing-container').innerHTML = '';
        if(course.pricingOptions && course.pricingOptions.length > 0) {
          course.pricingOptions.forEach(p => window.addPricingRow(p.name, p.price, p.originalPrice));
        } else {
          window.addPricingRow('1个月通行证', course.price1Month || course.price || 0, course.originalPrice1Month || course.originalPrice || 0);
          if (course.price3Month > 0) window.addPricingRow('3个月通行证', course.price3Month, course.originalPrice3Month || 0);
        }`;
adminHtml = adminHtml.replace(handleEditSearch, handleEditReplace);

fs.writeFileSync('c:/Users/keong/Desktop/Jack Website/admin.html', adminHtml, 'utf8');
console.log('Update finished.');
