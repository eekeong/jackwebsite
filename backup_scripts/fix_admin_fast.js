const fs = require('fs');

const adminPath = 'c:/Users/keong/Desktop/Jack Website/admin.html';
let adminHtml = fs.readFileSync(adminPath, 'utf8');

// 1. Logo Name
adminHtml = adminHtml.replace('Jack Jack 老师', '万能教Jack老师');
adminHtml = adminHtml.replace('Jack Jack 老师', '万能教Jack老师');

// 2. Remove teaching method, duration, target audience inputs
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

// JS removals for teaching methods
const removeJSRead = `      const teachingMethod = document.getElementById("add-teaching-method").value.trim();
      const duration = document.getElementById("add-duration").value.trim();
      const targetAudience = document.getElementById("add-target-audience").value.trim();`;
adminHtml = adminHtml.replace(removeJSRead, '');

const removeJSEdit = `      document.getElementById("add-teaching-method").value = course.teachingMethod || "";
      document.getElementById("add-duration").value = course.duration || "";
      document.getElementById("add-target-audience").value = course.targetAudience || "";`;
adminHtml = adminHtml.replace(removeJSEdit, '');

const removeJSNew1 = `        teachingMethod,
        duration,
        targetAudience,`;
adminHtml = adminHtml.replace(removeJSNew1, '');

const removeJSNew2 = `        format: teachingMethod + " + " + duration,`;
adminHtml = adminHtml.replace(removeJSNew2, `        format: "",`);

// 3. Dynamic Pricing UI
const pricingSearch = `              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-zinc-300" for="add-price1month">1 个月套餐优惠价 (RM) *</label>
                  <input type="number" step="0.01" id="add-price1month"
                    class="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    placeholder="例：49.00" required>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-zinc-300" for="add-price1month-orig">1 个月套餐原价 (RM) *</label>
                  <input type="number" step="0.01" id="add-price1month-orig"
                    class="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    placeholder="例：99.00" required>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-zinc-300" for="add-price3month">3 个月套餐优惠价 (RM) <span>(非套餐填0)</span> *</label>
                  <input type="number" step="0.01" id="add-price3month"
                    class="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    value="0" required>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-zinc-300" for="add-price3month-orig">3 个月套餐原价 (RM) <span>(非套餐填0)</span> *</label>
                  <input type="number" step="0.01" id="add-price3month-orig"
                    class="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    value="0" required>
                </div>
              </div>`;

const pricingReplace = `              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-pink-500">2. Pricing Options (价格变体)</h3>
                <button type="button" onclick="window.addPricingRow()" class="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 bg-pink-500/10 px-2 py-1 rounded">
                  <i data-lucide="plus" class="w-3 h-3"></i> 加新配套
                </button>
              </div>
              <div id="pricing-container" class="space-y-2"></div>`;

adminHtml = adminHtml.replace(pricingSearch, pricingReplace);

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

adminHtml = adminHtml.replace('// ---- Modal Controls ----', helperScript + '\n// ---- Modal Controls ----');

const handleCreatePricingOld = `      const price1Month = parseFloat(document.getElementById("add-price1month").value) || 0;
      const originalPrice1Month = parseFloat(document.getElementById("add-price1month-orig").value) || 0;
      const price3Month = parseFloat(document.getElementById("add-price3month").value) || 0;
      const originalPrice3Month = parseFloat(document.getElementById("add-price3month-orig").value) || 0;`;

const handleCreatePricingNew = `      const pricingOptions = [];
      document.querySelectorAll('#pricing-container > div').forEach(row => {
        const name = row.querySelector('[data-pricing-name]').value.trim();
        const price = parseFloat(row.querySelector('[data-pricing-price]').value) || 0;
        const originalPrice = parseFloat(row.querySelector('[data-pricing-orig]').value) || 0;
        if (name) {
          pricingOptions.push({ name, price, originalPrice });
        }
      });`;

adminHtml = adminHtml.replace(handleCreatePricingOld, handleCreatePricingNew);

adminHtml = adminHtml.replace(/price1Month,\s*originalPrice1Month,\s*price3Month,\s*originalPrice3Month,/, 'pricingOptions,');
adminHtml = adminHtml.replace(/price:\s*price1Month,/, 'price: pricingOptions.length > 0 ? pricingOptions[0].price : 0,');
adminHtml = adminHtml.replace(/originalPrice:\s*originalPrice1Month,/, 'originalPrice: pricingOptions.length > 0 ? pricingOptions[0].originalPrice : 0,');

const handleEditPricingOld = `      document.getElementById("add-price1month").value = course.price1Month || course.price || 0;
      document.getElementById("add-price1month-orig").value = course.originalPrice1Month || course.originalPrice || 0;
      document.getElementById("add-price3month").value = course.price3Month || 0;
      document.getElementById("add-price3month-orig").value = course.originalPrice3Month || 0;`;

const handleEditPricingNew = `      document.getElementById('pricing-container').innerHTML = '';
      if(course.pricingOptions && course.pricingOptions.length > 0) {
        course.pricingOptions.forEach(p => window.addPricingRow(p.name, p.price, p.originalPrice));
      } else {
        window.addPricingRow('1个月通行证', course.price1Month || course.price || 0, course.originalPrice1Month || course.originalPrice || 0);
        if (course.price3Month > 0) window.addPricingRow('3个月通行证', course.price3Month, course.originalPrice3Month || 0);
      }`;

adminHtml = adminHtml.replace(handleEditPricingOld, handleEditPricingNew);


fs.writeFileSync(adminPath, adminHtml, 'utf8');
console.log('Update complete');
