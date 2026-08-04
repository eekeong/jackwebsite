const fs = require('fs');

const path = 'c:/Users/keong/Desktop/Jack Website/course-detail.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Inject Quill CSS in <head>
if (!content.includes('quill.snow.css')) {
  const headEnd = content.indexOf('</head>');
  content = content.slice(0, headEnd) + `  <!-- Quill CSS for rendering rich text -->\n  <link href="css/quill.snow.css" rel="stylesheet">\n` + content.slice(headEnd);
}

// 2. Replace tabDesc rendering logic
const oldTabDesc = `const tabDesc = document.getElementById("tab-desc");
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

const newTabDesc = `const tabDesc = document.getElementById("tab-desc");
        if (tabDesc) {
          tabDesc.innerHTML = "";
          
          if (course.contentSections && course.contentSections.length > 0) {
            course.contentSections.forEach(sec => {
              const secTitle = document.createElement("h3");
              secTitle.textContent = sec.title;
              tabDesc.appendChild(secTitle);
              
              const contentContainer = document.createElement("div");
              // Add ql-editor to adopt Quill's CSS reset and list styling
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
            if (!htmlContent.includes('<') && htmlContent.includes('\\n')) {
              htmlContent = htmlContent.replace(/\\n/g, '<br>');
            }
            contentContainer.innerHTML = htmlContent;
            tabDesc.appendChild(contentContainer);
          }
        }`;

// Using bounds to safely replace
const oldTabDescStart = `const tabDesc = document.getElementById("tab-desc");`;
const oldTabDescEndStr = `// 12. Tab 2: Testimonials grid`;

const startIndex = content.indexOf(oldTabDescStart);
const endIndex = content.indexOf(oldTabDescEndStr);

if (startIndex !== -1 && endIndex !== -1 && !content.includes('ql-editor')) {
  content = content.slice(0, startIndex) + newTabDesc + "\\n\\n        " + content.slice(endIndex);
}

// 3. Add some custom css for .ql-editor
if (!content.includes('.ql-editor { padding: 0; }')) {
    const styleEnd = content.indexOf('</style>');
    content = content.slice(0, styleEnd) + `    .ql-editor { padding: 0; font-family: inherit; font-size: inherit; line-height: 1.8; }\n  ` + content.slice(styleEnd);
}

fs.writeFileSync(path, content, 'utf8');
console.log("Restored Quill in course-detail.html");
