// ==========================================
// 「万能教 Jack 老师」中央电商状态引擎 (app.js)
// ==========================================

// Safe localStorage wrapper to prevent crashes in file:/// and privacy-blocked environments
window.safeLocalStorage = (function() {
  let isAvailable = false;
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    isAvailable = true;
  } catch (e) {
    isAvailable = false;
  }
  
  if (isAvailable) {
    return window.localStorage;
  } else {
    console.warn("localStorage is blocked or not available in this environment. Using secure in-memory storage fallback.");
    // High-fidelity in-memory fallback
    const storageMap = {};
    return {
      getItem: function(key) {
        return key in storageMap ? storageMap[key] : null;
      },
      setItem: function(key, value) {
        storageMap[key] = String(value);
      },
      removeItem: function(key) {
        delete storageMap[key];
      },
      clear: function() {
        for (let k in storageMap) {
          delete storageMap[k];
        }
      },
      key: function(index) {
        return Object.keys(storageMap)[index] || null;
      },
      get length() {
        return Object.keys(storageMap).length;
      }
    };
  }
})();

// Shadow standard localStorage with the safe wrapper
const localStorage = window.safeLocalStorage;

// 1. 初始化模拟本地数据库 (LocalStorage Seeds)
const DEFAULT_COURSES = [
  {
    id: "sej-regular",
    title: "Sejarah 正课班",
    subject: "Sejarah",
    type: "Live Class",
    teacher: "Jack 老师",
    coverImage: "images/Card_Photo/IMG_7567 (1).png",
    imgBack: "images/Card_Photo/IMG_7567 (1).png",
    imgFront: 'images/Card_Photo/60.png',
    notes: "Best Seller · 冲刺提分神器",
    badge: "Best Seller",
    badgeClass: "badge-hot",
    targetAudience: "Form 1 - Form 5",
    pricingOptions: [
      { name: "1个月体验", price: 89, originalPrice: 159 },
      { name: "3个月套餐", price: 229, originalPrice: 477 }
    ],
    formOptions: ["Form 4", "Form 5"],
    timeOptions: ["星期四 8:00PM", "星期六 10:00AM"],
    contentSections: [
      {
        title: "关于本课程",
        content: "这是一门专为想要冲刺高分的同学设计的精品课。由 Jack 老师主讲，通过独特的故事化教学方法，帮助基础薄弱的学生快速提分。"
      },
      {
        title: "上课大纲",
        content: "第一阶段：核心概念重点剖析\n第二阶段：历年考题解题模板套路讲解\n第三阶段：丢分盲区及考场答题注意事项"
      }
    ],
    faqs: [
      { q: "如果有课程冲突没法看直播怎么办？", a: "不用担心，所有直播课程在结束后都会上传高清回放。" }
    ]
  },
  {
    id: "sej-bundle",
    title: "Sejarah VIP 万能宝典",
    subject: "Sejarah",
    type: "VIP Bundle",
    teacher: "Jack 老师",
    coverImage: "images/product-bundle.png",
    imgBack: "images/product-bundle.png",
    imgFront: "images/Jack Ler2 (1).png",
    notes: "SPM 历史终极大礼包，超高性价比",
    badge: "VIP Save 50%",
    badgeClass: "badge-hot",
    targetAudience: "Form 4 & Form 5 学生",
    pricingOptions: [
      { name: "VIP 全包 (含笔记+录播)", price: 199, originalPrice: 399 }
    ],
    formOptions: ["Form 4", "Form 5"],
    timeOptions: ["随买随看，无需固定时间"],
    contentSections: [
      {
        title: "套餐包含什么？",
        content: "包含《乱乱写》与《历史秘笈》两本实体精美笔记本直邮，以及中四中五核心专题包。"
      }
    ],
    faqs: []
  }
];

const DEFAULT_ORDERS = [
  {
    id: "JK-20260520-001",
    studentName: "张小明",
    parentName: "张建国",
    whatsapp: "+60123456789",
    email: "xiaoming@gmail.com",
    grade: "Form 5",
    school: "槟城中华中学",
    courses: ["SPM Sejarah Trial Attack (中五考前冲刺班)"],
    total: 49.00,
    method: "Touch 'n Go eWallet",
    status: "Paid",
    date: "2026-05-20 18:30"
  },
  {
    id: "JK-20260520-002",
    studentName: "Lim Wei Han",
    parentName: "Lim Kok Seng",
    whatsapp: "+60177654321",
    email: "weihan.lim@gmail.com",
    grade: "Form 4",
    school: "SMK Damansara Utama",
    courses: ["Form 4 Sejarah Topic Focus (中四核心专题突破班)"],
    total: 39.00,
    method: "FPX Online Banking",
    status: "Pending",
    date: "2026-05-21 09:15"
  }
];

// 初始化本地数据库并自动合并更新
// 初始化本地数据库并自动合并升级更新
function initDatabase() {
  let needsReset = false;
  try {
    const currentCourses = JSON.parse(localStorage.getItem("jack_courses"));
    if (!currentCourses || !Array.isArray(currentCourses) || currentCourses.length === 0) {
      needsReset = true;
    } else {
      // 检查任何一门课是否缺失新版的 pricingOptions 或 timeOptions 字段
      needsReset = currentCourses.some(c => !c.pricingOptions || !c.timeOptions);
    }
  } catch (e) {
    needsReset = true;
  }

  if (needsReset) {
    localStorage.setItem("jack_courses", JSON.stringify(DEFAULT_COURSES));
  }

  try {
    const currentOrders = JSON.parse(localStorage.getItem("jack_orders"));
    if (!currentOrders || !Array.isArray(currentOrders)) {
      localStorage.setItem("jack_orders", JSON.stringify(DEFAULT_ORDERS));
    } else {
      // 防御：确保每个已有订单都具有 total 字段和 courses 数组，防止 toFixed 报错
      let ordersChanged = false;
      currentOrders.forEach(o => {
        if (o.total === undefined || o.total === null) {
          o.total = 0;
          ordersChanged = true;
        }
        if (!o.courses) {
          o.courses = [];
          ordersChanged = true;
        }
      });
      if (ordersChanged) {
        localStorage.setItem("jack_orders", JSON.stringify(currentOrders));
      }
    }
  } catch (e) {
    localStorage.setItem("jack_orders", JSON.stringify(DEFAULT_ORDERS));
  }

  if (!localStorage.getItem("jack_cart")) {
    localStorage.setItem("jack_cart", JSON.stringify([]));
  }
  if (!localStorage.getItem("jack_applied_promo")) {
    localStorage.setItem("jack_applied_promo", JSON.stringify(null));
  }
}

initDatabase();

// 2. 课程数据库管理函数
const CourseDB = {
  getAll: () => {
    try {
      return JSON.parse(localStorage.getItem("jack_courses")) || [];
    } catch (e) {
      console.error("Failed to parse jack_courses", e);
      return [];
    }
  },
  getRawById: (id) => {
    if (!id) return null;
    let baseId = id;
    const optMatch = typeof id === "string" && id.match(/-opt-(\d+)$/);
    if (optMatch) {
      baseId = id.slice(0, -optMatch[0].length);
    } else if (typeof id === "string" && id.endsWith("-3m")) {
      baseId = id.slice(0, -3);
    }
    return (CourseDB.getAll() || []).find(c => c.id === baseId) || null;
  },
  getById: (id) => {
    if (!id) return null;
    let baseId = id;
    let optIndex = -1;

    // Check if it ends with -opt-[index] (e.g. sej-regular-opt-0)
    const optMatch = typeof id === "string" && id.match(/-opt-(\d+)$/);
    if (optMatch) {
      optIndex = parseInt(optMatch[1], 10);
      baseId = id.slice(0, -optMatch[0].length);
    } else if (typeof id === "string" && id.endsWith("-3m")) {
      optIndex = 1;
      baseId = id.slice(0, -3);
    }

    const raw = (CourseDB.getAll() || []).find(c => c.id === baseId);
    if (!raw) return null;
    
    // Apply dynamic variant mapping or fallback to old fields
    let price = raw.price || 0;
    let originalPrice = raw.originalPrice || 0;
    let title = raw.title || "";

    if (raw.pricingOptions && raw.pricingOptions.length > 0) {
      const idx = (optIndex >= 0 && optIndex < raw.pricingOptions.length) ? optIndex : 0;
      const opt = raw.pricingOptions[idx];
      price = opt.price;
      originalPrice = opt.originalPrice;
      title = `${raw.title} (${opt.name})`;
    } else {
      const price1Month = typeof raw.price1Month === "number" ? raw.price1Month : (raw.price || 0);
      const originalPrice1Month = typeof raw.originalPrice1Month === "number" ? raw.originalPrice1Month : (raw.originalPrice || 0);
      const price3Month = typeof raw.price3Month === "number" ? raw.price3Month : 0;
      const originalPrice3Month = typeof raw.originalPrice3Month === "number" ? raw.originalPrice3Month : 0;

      if (optIndex === 1 || (typeof id === "string" && id.endsWith("-3m"))) {
        price = price3Month;
        originalPrice = originalPrice3Month;
        title = raw.title + " (3个月套餐)";
      } else {
        price = price1Month;
        originalPrice = originalPrice1Month;
        title = raw.title;
      }
    }

    return {
      ...raw,
      price,
      originalPrice,
      title,
      subtitle: raw.subtitle || raw.notes || "独家提分精品课程",
      teachingMethod: raw.teachingMethod || raw.format || "Zoom 直播授课",
      duration: raw.duration || "1.5 小时",
      targetAudience: raw.targetAudience || raw.form || "Form 1 - Form 5",
      features: raw.features && raw.features.length > 0 ? raw.features : [
        "配套高画质彩色 PDF 与实体资料邮寄",
        "课后提供高清录像回放复习",
        "专属 WhatsApp 学习答疑辅导"
      ],
      galleryMedia: raw.galleryMedia || [
        { type: "image", src: raw.image || "images/product-course.png" }
      ],
      descAboutTitle: raw.descAboutTitle || "关于本课程",
      descAboutText: raw.descAboutText || "这是一门专为想要冲刺高分的同学设计的精品课。由 Jack 老师主讲，通过独特的故事化教学方法 and 口诀记忆法，将硬核大纲简化，帮助基础薄弱的学生在最短的时间内理清逻辑、快速提分。",
      descSyllabusTitle: raw.descSyllabusTitle || "上课大纲",
      descSyllabusText: raw.descSyllabusText || (raw.syllabus ? raw.syllabus.map(s => s.replace(/<[^>]*>/g, '')).join("\n") : "第一阶段：核心概念重点剖析\n第二阶段：历年考题解题模板套路讲解\n第三阶段：丢分盲区及考场答题注意事项"),
      testimonials: raw.testimonials || [
        {
          type: "image",
          src: 'images/Card_Photo/60.png',
          text: "“老师的故事法太好玩了，口诀也非常顺口。本来不及格的历史这次竟然拿到了A-，真的太不可思议了！”",
          name: "张同学 (Form 5)"
        },
        {
          type: "image",
          src: "images/Card_Photo/2.png",
          text: "“以前总觉得Sejarah要背很多字，上完课后发现其实是有套路的，写少少字拿满分的感觉太棒了！”",
          name: "林同学 (Form 5)"
        }
      ],
      faqs: raw.faqs || [
        {
          q: "付款成功后，何时能收到 WhatsApp 上课资料通知？",
          a: "系统会在付款成功后的 24 小时内（通常只需几小时）自动给您的注册电话发送专属的上课链接、WhatsApp答疑群链接和电子版彩色讲义。"
        },
        {
          q: "如果错过了直播，有没有录像回放可以观看？",
          a: "不用担心！所有的直播班次都会提供 1080P 高清无插水录播包回放，课后 24 小时内上传，有效期持续到当年 SPM 考试结束，支持无限次反复温习。"
        },
        {
          q: "课程的讲义是实体资料还是 PDF 格式？",
          a: "本课程默认提供精心设计的高质量彩色 PDF 电子版讲义。如购买了包含实体的特惠套餐，实体资料和笔记本通常会在下单后 2-3 个工作日内通过快递直邮到您填写的地址。"
        }
      ],
      id: id
    };
  },
  save: (course) => {
    const courses = CourseDB.getAll() || [];
    const index = courses.findIndex(c => c.id === course.id);
    if (index >= 0) {
      courses[index] = course;
    } else {
      courses.push(course);
    }
    localStorage.setItem("jack_courses", JSON.stringify(courses));
    return course;
  },
  delete: (id) => {
    let courses = CourseDB.getAll() || [];
    courses = courses.filter(c => c.id !== id);
    localStorage.setItem("jack_courses", JSON.stringify(courses));
  }
};

// 3. 购物车管理函数
const Cart = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem("jack_cart")) || [];
    } catch (e) {
      console.error("Failed to parse jack_cart", e);
      return [];
    }
  },
  save: (cart) => {
    localStorage.setItem("jack_cart", JSON.stringify(cart));
    Cart.updateUI();
  },
  add: (courseId) => {
    const cart = Cart.get();
    if (cart.includes(courseId)) {
      alert("该课程已经在您的购物车中！");
      return false;
    }
    cart.push(courseId);
    Cart.save(cart);
    showFloatingNotification("已成功加入购物车！");
    return true;
  },
  remove: (courseId) => {
    let cart = Cart.get();
    cart = cart.filter(id => id !== courseId);
    Cart.save(cart);
  },
  clear: () => {
    Cart.save([]);
    localStorage.setItem("jack_applied_promo", JSON.stringify(null));
  },
  getDetails: () => {
    const cart = Cart.get();
    return cart.map(id => CourseDB.getById(id)).filter(Boolean);
  },
  getSubtotal: () => {
    const items = Cart.getDetails();
    return items.reduce((sum, item) => sum + (item.price || 0), 0);
  },
  getTotal: () => {
    const subtotal = Cart.getSubtotal();
    const promo = Cart.getPromo();
    if (!promo) return subtotal;
    if (promo.type === "flat") {
      return Math.max(0, subtotal - (promo.value || 0));
    } else if (promo.type === "percent") {
      return subtotal * (1 - (promo.value || 0) / 100);
    }
    return subtotal;
  },
  applyPromo: (code) => {
    const cleanCode = code.toUpperCase().trim();
    let promo = null;
    if (cleanCode === "JACKEARLY") {
      promo = { code: "JACKEARLY", type: "flat", value: 10, label: "早鸟立减 RM10" };
    } else if (cleanCode === "JACK50") {
      promo = { code: "JACK50", type: "percent", value: 50, label: "50% 砍价折扣" };
    } else {
      return { success: false, message: "无效的优惠券代码" };
    }
    localStorage.setItem("jack_applied_promo", JSON.stringify(promo));
    Cart.updateUI();
    return { success: true, message: `成功应用优惠券：${promo.label}` };
  },
  getPromo: () => {
    try {
      const stored = localStorage.getItem("jack_applied_promo");
      if (stored && stored !== "undefined") {
        return JSON.parse(stored);
      }
      return null;
    } catch (e) {
      console.error("Failed to parse jack_applied_promo", e);
      return null;
    }
  },
  removePromo: () => {
    localStorage.setItem("jack_applied_promo", JSON.stringify(null));
    Cart.updateUI();
  },
  updateUI: () => {
    const cart = Cart.get();
    const validItems = cart.filter(id => CourseDB.getById(id));
    
    if (validItems.length !== cart.length) {
      localStorage.setItem("jack_cart", JSON.stringify(validItems));
    }

    document.querySelectorAll(".cart-count").forEach(badge => {
      badge.textContent = validItems.length;
      badge.style.display = validItems.length > 0 ? "flex" : "none";
    });
  }
};

// 4. 订单与 CRM 数据库管理
const OrderDB = {
  getAll: () => {
    try {
      const stored = localStorage.getItem("jack_orders");
      if (stored && stored !== "undefined") {
        return JSON.parse(stored) || [];
      }
      return [];
    } catch (e) {
      console.error("Failed to parse jack_orders", e);
      return [];
    }
  },
  getById: (id) => (OrderDB.getAll() || []).find(o => o.id === id),
  create: (studentInfo, cartItems, totalAmount, paymentMethod, status = "Paid") => {
    const orders = OrderDB.getAll() || [];
    const newOrderId = `JK-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(orders.length + 1).padStart(3, '0')}`;
    
    const newOrder = {
      id: newOrderId,
      studentName: studentInfo.studentName,
      parentName: studentInfo.parentName,
      whatsapp: studentInfo.whatsapp,
      email: studentInfo.email,
      grade: studentInfo.grade,
      school: studentInfo.school || "无学校备注",
      courses: cartItems.map(c => c.title || ""),
      total: parseFloat(totalAmount.toFixed(2)),
      method: paymentMethod,
      status: status,
      date: new Date().toLocaleString()
    };
    
    orders.unshift(newOrder); // 最新订单放在最前
    localStorage.setItem("jack_orders", JSON.stringify(orders));
    
    // 如果是成功支付，需要更新该学生的已购课程资料到已登录状态，以便在 Student Dashboard 浏览
    let studentCourses = [];
    try {
      studentCourses = JSON.parse(localStorage.getItem(`student_courses_${studentInfo.email}`)) || [];
    } catch(e) {
      studentCourses = [];
    }
    cartItems.forEach(item => {
      if (item && item.id && !studentCourses.includes(item.id)) {
        studentCourses.push(item.id);
      }
    });
    localStorage.setItem(`student_courses_${studentInfo.email}`, JSON.stringify(studentCourses));
    
    // 设置为当前激活的学生会话
    localStorage.setItem("jack_current_student", JSON.stringify({
      email: studentInfo.email,
      name: studentInfo.studentName,
      grade: studentInfo.grade
    }));
    
    return newOrder;
  },
  updateStatus: (orderId, status) => {
    const orders = OrderDB.getAll() || [];
    const index = orders.findIndex(o => o.id === orderId);
    if (index >= 0) {
      orders[index].status = status;
      localStorage.setItem("jack_orders", JSON.stringify(orders));
      return true;
    }
    return false;
  },
  delete: (orderId) => {
    let orders = OrderDB.getAll() || [];
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem("jack_orders", JSON.stringify(orders));
  }
};

// ==========================================
// 首页卡片数据库 (HeroCardDB)
// ==========================================
const DEFAULT_HERO_CARDS = [
  { id: "hero-1", title: "9分逆袭97分！🔥", desc: "就算9分，我们都不定义他是弱生！找到适合的方法，半年突变97分！", image: "images/见证/1.png" },
  { id: "hero-2", title: "历史全班第一！🏆", desc: "停学2年，本来只希望全科PASS，两个月蜕变8个A！我们让学生看见【我是可以的】！", image: "images/见证/23.png" },
  { id: "hero-3", title: "不及格到稳拿 A！✨", desc: "万能口诀与答题模板加持，抛弃死记硬背，Sejarah 拿 A 原来这么轻松！", image: "images/见证/30.png" },
  { id: "hero-4", title: "从 G 逆袭到 A-！📉", desc: "从不及格边缘到傲人成绩，每一次提分都是对努力最好的证明！", image: "images/见证/37.png" },
  { id: "hero-5", title: "双位数暴涨奇迹！📈", desc: "运用心理学记忆曲线，把历史章节变成追剧故事，提分势不可挡！", image: "images/见证/39.png" },
  { id: "hero-6", title: "考前冲刺稳夺 A！💪", desc: "最后两个月加入特训班，精准切中满分得分点，写短短也能拿满分！", image: "images/见证/48.png" },
  { id: "hero-7", title: "零基础完美跨越！🎓", desc: "不用担心基础差，Jack 老师带你从零梳理脉络，考试信心加倍！", image: "images/见证/50.png" },
  { id: "hero-8", title: "满分答题套路！🎯", desc: "掌握考官最爱的满分关键词模板，直击得分要害，拒绝枯燥死记！", image: "images/见证/54.png" },
  { id: "hero-9", title: "全班提分榜样！🌟", desc: "用最聪明的《合心法》复习笔记，带领全班掀起 Sejarah 冲 A 狂潮！", image: 'images/Card_Photo/60.png' },
  { id: "hero-10", title: "创造及格奇迹！💎", desc: "曾经最头疼的科目变成拿分王牌，用实力证明：我也绝对做得到！", image: "images/Card_Photo/2.png" }
];

const HeroCardDB = {
  init: function() {
    const data = localStorage.getItem("jack_hero_cards");
    if (!data || data === "undefined" || data === "[]") {
      localStorage.setItem("jack_hero_cards", JSON.stringify(DEFAULT_HERO_CARDS));
    }
  },
  getAll: function() {
    this.init();
    try {
      const data = localStorage.getItem("jack_hero_cards");
      let parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Strict filter to discard any null, undefined, or incomplete cards
        parsed = parsed.filter(c => c && c.id && c.title && c.desc && c.image);
        if (parsed.length > 0) {
          return parsed;
        }
      }
      // Auto self-heal if the storage is corrupted or empty
      localStorage.setItem("jack_hero_cards", JSON.stringify(DEFAULT_HERO_CARDS));
      return DEFAULT_HERO_CARDS;
    } catch (e) {
      console.error("Failed to parse hero cards, resetting:", e);
      localStorage.setItem("jack_hero_cards", JSON.stringify(DEFAULT_HERO_CARDS));
      return DEFAULT_HERO_CARDS;
    }
  },
  save: function(card) {
    const cards = this.getAll();
    const index = cards.findIndex(c => c.id === card.id);
    if (index >= 0) {
      cards[index] = card;
    } else {
      cards.push(card);
    }
    try {
      localStorage.setItem("jack_hero_cards", JSON.stringify(cards));
      return card;
    } catch (e) {
      console.error("Storage quota exceeded inside HeroCardDB.save:", e);
      return false;
    }
  },
  delete: function(id) {
    let cards = this.getAll();
    cards = cards.filter(c => c.id !== id);
    localStorage.setItem("jack_hero_cards", JSON.stringify(cards));
  }
};

// ==========================================
// 首页上课时间数据库 (ScheduleDB)
// ==========================================
const DEFAULT_SCHEDULES = [
  {
    id: "sch-1",
    day: "Thursday (星期四)",
    time: "8:00 PM - 10:00 PM",
    courseId: "sej-trial-f5",
    courseTitle: "SPM Sejarah Trial Attack (中五考前冲刺班)",
    teacher: "Jack 老师",
    format: "Zoom 直播授课 (含无限高清回放)",
    status: "Enrollment Open",
    statusClass: "badge-new",
    notes: "含 Jack 老师独家预测考题 PDF 讲义"
  },
  {
    id: "sch-2",
    day: "Saturday (星期六)",
    time: "10:00 AM - 12:00 PM",
    courseId: "sej-revision-f4",
    courseTitle: "Form 4 Sejarah Topic Focus (中四核心专题突破班)",
    teacher: "Jack 老师",
    format: "Zoom 直播授课 (含无限高清回放)",
    status: "Hot",
    statusClass: "badge-hot",
    notes: "提供中四基础重点核心 PDF 精美笔记"
  },
  {
    id: "sch-3",
    day: "Every Sunday (每周日)",
    time: "2:00 PM - 4:00 PM",
    courseId: "sej-live-1m",
    courseTitle: "Jack 老师 SPM 历史线上直播课 (定期班)",
    teacher: "Jack 老师",
    format: "Zoom 直播授课 (含无限高清回放)",
    status: "Limited Seats",
    statusClass: "badge-limited",
    notes: "按月分发独家高频预测 PDF 讲义"
  }
];

const ScheduleDB = {
  init: function() {
    const data = localStorage.getItem("jack_schedules");
    if (!data || data === "undefined" || data === "[]") {
      localStorage.setItem("jack_schedules", JSON.stringify(DEFAULT_SCHEDULES));
    }
  },
  getAll: function() {
    this.init();
    try {
      const data = localStorage.getItem("jack_schedules");
      let parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        parsed = parsed.filter(s => s && s.id && s.day && s.time && s.courseTitle);
        if (parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem("jack_schedules", JSON.stringify(DEFAULT_SCHEDULES));
      return DEFAULT_SCHEDULES;
    } catch (e) {
      console.error("Failed to parse schedules, resetting:", e);
      localStorage.setItem("jack_schedules", JSON.stringify(DEFAULT_SCHEDULES));
      return DEFAULT_SCHEDULES;
    }
  },
  save: function(item) {
    const items = this.getAll();
    const index = items.findIndex(s => s.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    try {
      localStorage.setItem("jack_schedules", JSON.stringify(items));
      return item;
    } catch (e) {
      console.error("Storage quota exceeded inside ScheduleDB.save:", e);
      return false;
    }
  },
  delete: function(id) {
    let items = this.getAll();
    items = items.filter(s => s.id !== id);
    localStorage.setItem("jack_schedules", JSON.stringify(items));
  }
};

// ==========================================
// 见证视频数据库 (TestimonialDB)
// ==========================================
const DEFAULT_TESTIMONIALS = [
  {
    id: "test-1",
    rating: 5,
    title: "9分逆袭97分！🔥",
    desc: "就算9分，我们都不定义他是弱生！找到适合的方法，半年突变97分！",
    video: "images/见证/video/SPM SEJARAH FAIL变A+见证.mp4#t=0.001",
    poster: "images/见证/1.png"
  },
  {
    id: "test-2",
    rating: 5,
    title: "历史全班第一！🏆",
    desc: "停学2年，本来只希望全科PASS，两个月蜕变8个A！我们让学生看见【我是可以的】！",
    video: "images/见证/video/Sin Jiun(1).mp4#t=0.001",
    poster: "images/见证/23.png"
  },
  {
    id: "test-3",
    rating: 5,
    title: "不及格到稳拿 A！✨",
    desc: "万能口诀与答题模板加持，抛弃死记硬背，Sejarah 拿 A 原来这么轻松！",
    video: "images/见证/video/4月6日.mp4#t=0.001",
    poster: "images/见证/30.png"
  },
  {
    id: "test-4",
    rating: 5,
    title: "从 G 逆袭到 A-！📉",
    desc: "从不及格边缘到傲人成绩，每一次提分都是对努力最好的证明！",
    video: "images/见证/video/FinalVideo_1629535396.551183.mov#t=0.001",
    poster: "images/见证/37.png"
  }
];

const TestimonialDB = {
  init: function() {
    const data = localStorage.getItem("jack_testimonials");
    if (!data || data === "undefined" || data === "[]") {
      localStorage.setItem("jack_testimonials", JSON.stringify(DEFAULT_TESTIMONIALS));
    }
  },
  getAll: function() {
    this.init();
    try {
      const data = localStorage.getItem("jack_testimonials");
      let parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        parsed = parsed.filter(t => t && t.id && t.title && t.desc && t.video);
        if (parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem("jack_testimonials", JSON.stringify(DEFAULT_TESTIMONIALS));
      return DEFAULT_TESTIMONIALS;
    } catch (e) {
      console.error("Failed to parse testimonials, resetting:", e);
      localStorage.setItem("jack_testimonials", JSON.stringify(DEFAULT_TESTIMONIALS));
      return DEFAULT_TESTIMONIALS;
    }
  },
  save: function(testi) {
    const testimonials = this.getAll();
    const index = testimonials.findIndex(t => t.id === testi.id);
    if (index >= 0) {
      testimonials[index] = testi;
    } else {
      testimonials.push(testi);
    }
    try {
      localStorage.setItem("jack_testimonials", JSON.stringify(testimonials));
      return testi;
    } catch (e) {
      console.error("Storage quota exceeded inside TestimonialDB.save:", e);
      return false;
    }
  },
  delete: function(id) {
    let testimonials = this.getAll();
    testimonials = testimonials.filter(t => t.id !== id);
    localStorage.setItem("jack_testimonials", JSON.stringify(testimonials));
  }
};

// ==========================================
// 文字滚动见证数据库 (ScrollingTestimonialDB)
// ==========================================
const DEFAULT_SCROLLING_TESTIMONIALS = [
  {
    id: "st-1",
    text: "跟着Jack老师的节奏，利用万能口诀，我的Sejarah直接从Fail冲到了A+！完全不用死记硬背！",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Briana Patton",
    role: "Form 5 (Fail -> A+)",
    screenshot: "images/见证/1.png"
  },
  {
    id: "st-2",
    text: "老师整理的《乱乱写》魔法笔记太神奇了，考试时直接默写核心关键字，写少少字竟然拿了满分！",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Bilal Ahmed",
    role: "Form 5 (历史全班第一 🏆)",
    screenshot: "images/见证/23.png"
  },
  {
    id: "st-3",
    text: "历史本来是我最头疼的科目，上过Jack老师的第一堂课后，我发现Sejarah原来像看漫画剧集一样有趣！",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Saman Malik",
    role: "Form 4 (兴趣激发 ✨)",
    screenshot: "images/见证/30.png"
  },
  {
    id: "st-4",
    text: "原本只希望全部科目都Pass，跟着Jack老师口诀学习两个月，SPM成绩放榜Sejarah稳拿A-！",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Omar Raza",
    role: "Form 5 (G级逆袭到A-)",
    screenshot: "images/见证/37.png"
  },
  {
    id: "st-5",
    text: "不仅教知识，还教满分思维和临考心态，简直是全马最棒的历史魔法老师！",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Zainab Hussain",
    role: "Form 5 (提分榜样 🌟)",
    screenshot: "images/见证/39.png"
  },
  {
    id: "st-6",
    text: "考前两个月冲刺班，完全锁定了SPM的热门考点，让我在考场上胸有成竹，顺利拿到A！",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Aliza Khan",
    role: "Form 5 (考前冲刺稳夺A)",
    screenshot: "images/见证/48.png"
  },
  {
    id: "st-7",
    text: "独家故事法授课超级幽默！不知不觉就记住了复杂的朝代和概念，考试时脑海里全画面！",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Farhan Siddiqui",
    role: "Form 4 (故事趣味法记忆)",
    screenshot: "images/见证/50.png"
  },
  {
    id: "st-8",
    text: "不用怀疑，选Jack老师的课是今年最明智的决定，已经拉着全班闺蜜一起续费学习了！",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Sana Sheikh",
    role: "Form 5 (全员强烈力荐)",
    screenshot: "images/见证/54.png"
  },
  {
    id: "st-9",
    text: "用最聪明的思维导图做总结，别人在痛苦背书，我在轻松拿分，历史提分简直像开挂一样！",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Hassan Ali",
    role: "Form 5 (满分答题套路)",
    screenshot: 'images/Card_Photo/60.png'
  }
];

const ScrollingTestimonialDB = {
  init: function() {
    const data = localStorage.getItem("jack_scrolling_testimonials");
    if (!data || data === "undefined" || data === "[]") {
      localStorage.setItem("jack_scrolling_testimonials", JSON.stringify(DEFAULT_SCROLLING_TESTIMONIALS));
    }
  },
  getAll: function() {
    this.init();
    try {
      const data = localStorage.getItem("jack_scrolling_testimonials");
      let parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        parsed = parsed.filter(t => t && t.id && t.text && t.name);
        if (parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem("jack_scrolling_testimonials", JSON.stringify(DEFAULT_SCROLLING_TESTIMONIALS));
      return DEFAULT_SCROLLING_TESTIMONIALS;
    } catch (e) {
      console.error("Failed to parse scrolling testimonials, resetting:", e);
      localStorage.setItem("jack_scrolling_testimonials", JSON.stringify(DEFAULT_SCROLLING_TESTIMONIALS));
      return DEFAULT_SCROLLING_TESTIMONIALS;
    }
  },
  save: function(testi) {
    const list = this.getAll();
    const index = list.findIndex(t => t.id === testi.id);
    if (index >= 0) {
      list[index] = testi;
    } else {
      list.push(testi);
    }
    try {
      localStorage.setItem("jack_scrolling_testimonials", JSON.stringify(list));
      return testi;
    } catch (e) {
      console.error("Storage quota exceeded inside ScrollingTestimonialDB.save:", e);
      return false;
    }
  },
  delete: function(id) {
    let list = this.getAll();
    list = list.filter(t => t.id !== id);
    localStorage.setItem("jack_scrolling_testimonials", JSON.stringify(list));
  }
};

// 显式挂载到 window 对象上确保万无一失
window.CourseDB = CourseDB;
window.Cart = Cart;
window.OrderDB = OrderDB;
window.HeroCardDB = HeroCardDB;
window.ScheduleDB = ScheduleDB;
window.TestimonialDB = TestimonialDB;
window.ScrollingTestimonialDB = ScrollingTestimonialDB;

// 5. 浮动通知效果
function showFloatingNotification(message) {
  const notification = document.createElement("div");
  notification.style.position = "fixed";
  notification.style.bottom = "80px";
  notification.style.right = "20px";
  notification.style.backgroundColor = "var(--pink)";
  notification.style.color = "var(--white)";
  notification.style.padding = "12px 24px";
  notification.style.borderRadius = "var(--radius-md)";
  notification.style.boxShadow = "var(--shadow-pink)";
  notification.style.zIndex = "3000";
  notification.style.fontFamily = "var(--font-title)";
  notification.style.fontWeight = "700";
  notification.style.fontSize = "14px";
  notification.style.opacity = "0";
  notification.style.transform = "translateY(10px)";
  notification.style.transition = "all 0.3s ease";
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // 触发动画
  setTimeout(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateY(0)";
  }, 10);
  
  // 消失淡出
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateY(-10px)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2500);
}

// 页面加载时自动初始化购物车数量
document.addEventListener("DOMContentLoaded", () => {
  Cart.updateUI();
});
