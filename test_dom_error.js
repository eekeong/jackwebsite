const fs = require('fs');
const vm = require('vm');

// Mock all DOM elements and operations
const elementMock = {
  addEventListener: () => {},
  setAttribute: () => {},
  removeAttribute: () => {},
  classList: {
    toggle: () => {},
    add: () => {},
    remove: () => {},
    contains: () => false
  },
  style: {},
  children: [],
  appendChild: function(el) { this.children.push(el); },
  querySelectorAll: function() { return []; },
  querySelector: function() { return null; },
  cloneNode: function() { return this; }
};

const documentMock = {
  addEventListener: () => {},
  createElement: function() { return elementMock; },
  getElementById: function(id) {
    console.log(`  getElementById('${id}') called`);
    return elementMock;
  },
  querySelector: function(sel) {
    console.log(`  querySelector('${sel}') called`);
    return elementMock;
  },
  querySelectorAll: function(sel) {
    console.log(`  querySelectorAll('${sel}') called`);
    return [];
  }
};

const mockWindow = {
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  },
  document: documentMock,
  addEventListener: () => {},
  performance: {
    now: () => Date.now()
  },
  innerWidth: 1024,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  requestAnimationFrame: (cb) => { cb(); },
  console: {
    log: console.log,
    error: console.error,
    warn: console.warn
  }
};
mockWindow.window = mockWindow;

const context = vm.createContext(mockWindow);

try {
  const appCode = fs.readFileSync('js/app.js', 'utf8');
  vm.runInContext(appCode, context);
  console.log("app.js loaded.");
  
  const mainCode = fs.readFileSync('js/main.js', 'utf8');
  vm.runInContext(mainCode, context);
  console.log("main.js loaded.");
  
  // Test each DOMContentLoaded function one by one!
  const functions = [
    'initNavbar',
    'initMobileMenu',
    'initScrollAnimations',
    'initCountUp',
    'initFaq',
    'initTestimonialSlider',
    'initCourseSlider',
    'initScrollTop',
    'initWaLinks',
    'loadCart',
    'updateCartBadges',
    'initSchoolVideo',
    'initAchCardSlider',
    'initChallengeBubbles'
  ];
  
  console.log("\nTesting DOMContentLoaded init sequence functions:");
  functions.forEach(fn => {
    try {
      console.log(`Running ${fn}()...`);
      if (typeof context[fn] === 'function') {
        context[fn]();
        console.log(`  ${fn}() passed successfully!`);
      } else {
        console.log(`  ${fn} is not a function in context!`);
      }
    } catch (e) {
      console.error(`💥 ERROR inside ${fn}():`, e.message);
      console.error(e.stack);
    }
  });
  
} catch (e) {
  console.error("Test framework error:", e.message);
}
