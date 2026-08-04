const fs = require('fs');
const path = 'c:/Users/keong/Desktop/Jack Website/course-detail.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Restore Quill CSS
if (!content.includes('quill.snow.css')) {
  const headEnd = content.indexOf('</head>');
  content = content.slice(0, headEnd) + `  <link href="css/quill.snow.css" rel="stylesheet">\n` + content.slice(headEnd);
}
if (!content.includes('.ql-editor { padding: 0; }')) {
  const styleEnd = content.indexOf('</style>');
  content = content.slice(0, styleEnd) + `    .ql-editor { padding: 0; font-family: inherit; font-size: inherit; line-height: 1.8; }\n  ` + content.slice(styleEnd);
}

// 3. Fix Features Logic
content = content.replace(
  /const features = course\.features \|\| \[\];/,
  'const features = course.features && course.features.length > 0 ? course.features : ["配套高画质彩色 PDF 与实体资料邮寄", "课后提供高清录像回放复习", "专属 WhatsApp 学习答疑辅导"];'
);

// 4. Update Pricing Logic
const pricingSearch = `        // 9. Tiered Pricing toggles setup
        const planContainer = document.querySelector(".plan-options");
        if (planContainer) {
          planContainer.innerHTML = "";
          
          const price1 = course.price1Month || course.price || 0;
          const orig1 = course.originalPrice1Month || course.originalPrice || 0;
          const price3 = course.price3Month || 0;
          const orig3 = course.originalPrice3Month || 0;
  
          // Create 1 month button
          const btn1 = document.createElement("button");
          btn1.className = \`plan-btn \${selectedPlanTier === "1m" ? 'active' : ''}\`;
          btn1.textContent = "1个月通行证";
          btn1.onclick = () => selectPlan(btn1, "1m", price1, orig1);
          planContainer.appendChild(btn1);
  
          // Create 3 month button if configured (>0)
          if (price3 > 0) {
            const btn3 = document.createElement("button");
            btn3.className = \`plan-btn \${selectedPlanTier === "3m" ? 'active' : ''}\`;
            btn3.textContent = "3个月通行证";
            btn3.onclick = () => selectPlan(btn3, "3m", price3, orig3);
            planContainer.appendChild(btn3);
            
            planContainer.style.display = "flex";
          } else {
            // If no 3-month package, hide plan container
            planContainer.style.display = "none";
          }
  
          // Initialize Price display values
          const currentP = selectedPlanTier === "3m" ? price3 : price1;
          const origP = selectedPlanTier === "3m" ? orig3 : orig1;
          const currentPriceEl = document.querySelector('.current-price');
          const originalPriceEl = document.querySelector('.original-price');
          if (currentPriceEl) currentPriceEl.textContent = \`RM\${currentP.toFixed(2)}\`;
          if (originalPriceEl) originalPriceEl.textContent = \`RM\${origP.toFixed(2)}\`;
        }`;

const pricingReplace = `        // 9. Tiered Pricing toggles setup
        const planContainer = document.querySelector(".plan-options");
        if (planContainer) {
          planContainer.innerHTML = "";
          let plans = course.pricingOptions || [];
          if (plans.length === 0) {
            plans = [{ name: "1个月通行证", price: course.price1Month || course.price || 0, originalPrice: course.originalPrice1Month || course.originalPrice || 0 }];
            if (course.price3Month > 0) plans.push({ name: "3个月通行证", price: course.price3Month, originalPrice: course.originalPrice3Month || 0 });
          }
          
          planContainer.style.display = plans.length > 1 ? "flex" : "none";
          plans.forEach((plan, idx) => {
            const btn = document.createElement("button");
            btn.className = \`plan-btn \${idx === 0 ? 'active' : ''}\`;
            btn.textContent = plan.name;
            btn.onclick = () => selectPlan(btn, plan.name, parseFloat(plan.price) || 0, parseFloat(plan.originalPrice) || 0);
            planContainer.appendChild(btn);
          });
          if (plans.length > 0) {
            selectPlan(planContainer.children[0], plans[0].name, parseFloat(plans[0].price) || 0, parseFloat(plans[0].originalPrice) || 0);
          }
        }`;

if (content.includes(pricingSearch)) {
  content = content.replace(pricingSearch, pricingReplace);
}

// 5. Restore Quill Content Sections in Tab 1
const tabDescSearch = `// 11. Tab 1: Description render
      const tabDesc = document.getElementById("tab-desc");
        if (tabDesc) {
          tabDesc.innerHTML = "";
          
          const aboutTitle = document.createElement("h3");
          aboutTitle.textContent = course.descAboutTitle || "关于本课程";
          tabDesc.appendChild(aboutTitle);
  
          const contentContainer = document.createElement("div");
          contentContainer.className = "rich-text-content";
          // Convert \\n to <br> if it's plaintext (fallback for old courses), otherwise render HTML
          let htmlContent = course.descAboutText || "";
          if (!htmlContent.includes('<') && htmlContent.includes('\\n')) {
            htmlContent = htmlContent.replace(/\\n/g, '<br>');
          }
          contentContainer.innerHTML = htmlContent;
          tabDesc.appendChild(contentContainer);
  
  
        }`;

const tabDescReplace = `// 11. Tab 1: Description render
      const tabDesc = document.getElementById("tab-desc");
        if (tabDesc) {
          tabDesc.innerHTML = "";
          if (course.contentSections && course.contentSections.length > 0) {
            course.contentSections.forEach(sec => {
              const secTitle = document.createElement("h3");
              secTitle.textContent = sec.title;
              tabDesc.appendChild(secTitle);
              const contentContainer = document.createElement("div");
              contentContainer.className = "rich-text-content ql-editor p-0";
              contentContainer.innerHTML = sec.content;
              tabDesc.appendChild(contentContainer);
            });
          } else {
            const aboutTitle = document.createElement("h3");
            aboutTitle.textContent = course.descAboutTitle || "关于本课程";
            tabDesc.appendChild(aboutTitle);
            const contentContainer = document.createElement("div");
            contentContainer.className = "rich-text-content ql-editor p-0";
            let htmlContent = course.descAboutText || "";
            if (!htmlContent.includes('<') && htmlContent.includes('\\n')) htmlContent = htmlContent.replace(/\\n/g, '<br>');
            contentContainer.innerHTML = htmlContent;
            tabDesc.appendChild(contentContainer);
          }
        }`;

if (content.includes(tabDescSearch)) {
  content = content.replace(tabDescSearch, tabDescReplace);
}

// 6. Remove Related Products Section
const relatedSearch = `    <!-- Related Products -->
    <section class="related-section" style="padding-bottom: 60px;">
      <div class="container" style="max-width: 900px;">
        <h2 class="related-title" style="text-align:center; font-size:28px; margin-bottom:30px; border-bottom:none;">你可能也需要</h2>
        <div class="services-grid" id="relatedCardsGrid"></div>
      </div>
    </section>`;
content = content.replace(relatedSearch, "");

// 7. Remove meta-grid HTML
const metaGridRegex = /<div class="meta-grid">[\s\S]*?<\/div>/;
content = content.replace(metaGridRegex, "");

// 8. Remove metaVals script assignment (we don't need it anyway)
const metaValsScriptRegex = /const metaVals = document\.querySelectorAll\("\.meta-value"\);[\s\S]*?\}/;
content = content.replace(metaValsScriptRegex, "");

fs.writeFileSync(path, content, 'utf8');
console.log('course-detail.html fully restored and cleaned');
