const fs = require('fs');

const adminPath = 'c:/Users/keong/Desktop/Jack Website/admin.html';
let adminHtml = fs.readFileSync(adminPath, 'utf8');

// 1. Remove the 3 teaching method inputs
const targetInputsSearch = `              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-zinc-300" for="add-teaching-method">授课方式 *</label>
                  <input type="text" id="add-teaching-method"
                    class="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    placeholder="如：Zoom 直播课" required>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-zinc-300" for="add-duration">单次授课时长 *</label>
                  <input type="text" id="add-duration"
                    class="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    placeholder="如：1.5 小时" required>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-zinc-300" for="add-target-audience">适合对象 *</label>
                  <input type="text" id="add-target-audience"
                    class="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    placeholder="如：Form 1 - Form 5" required>
                </div>
              </div>`;

adminHtml = adminHtml.replace(targetInputsSearch, '');

// JS helpers to add pricing row
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
  adminHtml = adminHtml.replace('// ---- Features Highlights Helper ----', helperScript + '\n      // ---- Features Highlights Helper ----');
}

// Update HandleCreateCourse
const handleCreateOld = `      const price1Month = parseFloat(document.getElementById("add-price1month").value) || 0;
      const originalPrice1Month = parseFloat(document.getElementById("add-price1month-orig").value) || 0;
      const price3Month = parseFloat(document.getElementById("add-price3month").value) || 0;
      const originalPrice3Month = parseFloat(document.getElementById("add-price3month-orig").value) || 0;

      const teachingMethod = document.getElementById("add-teaching-method").value.trim();
      const duration = document.getElementById("add-duration").value.trim();
      const targetAudience = document.getElementById("add-target-audience").value.trim();`;

const handleCreateNew = `      const pricingOptions = [];
      document.querySelectorAll('#pricing-container > div').forEach(row => {
        const name = row.querySelector('[data-pricing-name]').value.trim();
        const price = parseFloat(row.querySelector('[data-pricing-price]').value) || 0;
        const originalPrice = parseFloat(row.querySelector('[data-pricing-orig]').value) || 0;
        if (name) {
          pricingOptions.push({ name, price, originalPrice });
        }
      });`;

adminHtml = adminHtml.replace(handleCreateOld, handleCreateNew);

// In HandleCreateCourse, update newCourse object
adminHtml = adminHtml.replace(/price1Month,\s*originalPrice1Month,\s*price3Month,\s*originalPrice3Month,\s*teachingMethod,\s*duration,\s*targetAudience,/, 'pricingOptions,\n        price: pricingOptions.length > 0 ? pricingOptions[0].price : 0,\n        originalPrice: pricingOptions.length > 0 ? pricingOptions[0].originalPrice : 0,');

// Replace newCourse.price where it is duplicated
adminHtml = adminHtml.replace(/price:\s*price1Month,/, 'price: pricingOptions.length > 0 ? pricingOptions[0].price : 0,');
adminHtml = adminHtml.replace(/originalPrice:\s*originalPrice1Month,/, 'originalPrice: pricingOptions.length > 0 ? pricingOptions[0].originalPrice : 0,');

// HandleEditCourse update
const handleEditOld = `      document.getElementById("add-price1month").value = course.price1Month || course.price || 0;
      document.getElementById("add-price1month-orig").value = course.originalPrice1Month || course.originalPrice || 0;
      document.getElementById("add-price3month").value = course.price3Month || 0;
      document.getElementById("add-price3month-orig").value = course.originalPrice3Month || 0;

      document.getElementById("add-teaching-method").value = course.teachingMethod || "";
      document.getElementById("add-duration").value = course.duration || "";
      document.getElementById("add-target-audience").value = course.targetAudience || "";`;

const handleEditNew = `      document.getElementById('pricing-container').innerHTML = '';
      if(course.pricingOptions && course.pricingOptions.length > 0) {
        course.pricingOptions.forEach(p => window.addPricingRow(p.name, p.price, p.originalPrice));
      } else {
        // Fallback for old courses
        window.addPricingRow('1个月套餐', course.price1Month || course.price || 0, course.originalPrice1Month || course.originalPrice || 0);
        if (course.price3Month > 0) window.addPricingRow('3个月套餐', course.price3Month, course.originalPrice3Month || 0);
      }`;

adminHtml = adminHtml.replace(handleEditOld, handleEditNew);

fs.writeFileSync(adminPath, adminHtml, 'utf8');
console.log('Update complete');
