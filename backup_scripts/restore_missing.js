const fs = require('fs');

const origHtml = fs.readFileSync('c:/Users/keong/Desktop/Jack Website/admin_original.html', 'utf8');
let currentHtml = fs.readFileSync('c:/Users/keong/Desktop/Jack Website/admin.html', 'utf8');

// The block starts just after the features input in Section 2, or specifically Section 3:
const startMarkerOrig = '            <!-- Section 3: Detailed Info -->';
const endMarkerOrig = '            <!-- Section 4: Media & Testimonials -->';

if (origHtml.includes(startMarkerOrig) && origHtml.includes(endMarkerOrig)) {
  const startIndex = origHtml.indexOf(startMarkerOrig);
  const endIndex = origHtml.indexOf(endMarkerOrig);
  const missingBlock = origHtml.slice(startIndex, endIndex);

  // In currentHtml, find where Section 4 starts and inject missingBlock before it
  if (currentHtml.includes(endMarkerOrig)) {
    const insertIndex = currentHtml.indexOf(endMarkerOrig);
    currentHtml = currentHtml.slice(0, insertIndex) + missingBlock + currentHtml.slice(insertIndex);
    
    // BUT wait! Does missingBlock contain missing </div> tags that close Section 2?
    // Let's look at the original structure.
    // Section 2: Pricing & Details is wrapped in <div class="course-form-panel..."> ... </div>
    // Section 3: Detailed Info is wrapped in <div class="course-form-panel..."> ... </div>
    // We need to make sure we don't duplicate or leave open tags.
    // Let's just do it and see.
    fs.writeFileSync('c:/Users/keong/Desktop/Jack Website/admin_fixed.html', currentHtml, 'utf8');
    console.log("Restored block");
  } else {
    console.log("Section 4 not found in currentHtml");
  }
} else {
  console.log("Markers not found in original html");
}
