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
    price1Month: 89,
    originalPrice1Month: 159,
    price3Month: 229,
    originalPrice3Month: 477,
    teachingMethod: "Zoom 直播课",
    duration: "1.5 小时",
    features: [
      "配套高画质彩色 PDF 与实体资料邮寄",
      "课后提供高清录像回放复习",
      "专属 WhatsApp 学习答疑辅导"
    ],
    descAboutTitle: "关于本课程",
    descAboutText: "这是一门专为想要冲刺高分的同学设计的精品课。由 Jack 老师主讲，通过独特的故事化教学方法 and 口诀记忆法，将硬核大纲简化，帮助基础薄弱的学生在最短的时间内理清逻辑、快速提分。",
    descSyllabusTitle: "上课大纲",
    descSyllabusText: "第一阶段：核心概念重点剖析\n第二阶段：历年考题解题模板套路讲解\n第三阶段：丢分盲区及考场答题注意事项",
    testimonials: [
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
    faqs: [
      { q: "如果有课程冲突没法看直播怎么办？", a: "不用担心，所有直播课程在结束后都会上传高清回放。" }
    ]
  },
  {
    id: "sej-obj-200",
    title: "「会说话」Sejarah OBJ 200题宝典",
    subject: "Sejarah",
    type: "Study Material",
    teacher: "Jack 老师",
    coverImage: "images/product-book.png",
    imgBack: "images/product-book.png",
    imgFront: "images/Card_Photo/2.png",
    notes: "选择题速提宝典",
    badge: "OBJ 必刷题",
    badgeClass: "badge-new",
    targetAudience: "Form 5 学生",
    pricingOptions: [
      { name: "200题实体宝典 (附带声波扫码教学)", price: 45, originalPrice: 79 }
    ],
    formOptions: ["Form 5"],
    timeOptions: ["随买随看，随时温习"],
    price1Month: 45,
    originalPrice1Month: 79,
    price3Month: 0,
    originalPrice3Month: 0,
    teachingMethod: "扫码音频解题",
    duration: "随时自主温习",
    features: [
      "精选 200 道 SPM 必刷选择题",
      "独家声波二维码，扫码即听老师音频详解",
      "高品质纸张印刷直邮寄送"
    ],
    descAboutTitle: "关于本宝典",
    descAboutText: "「会说话」历史客观选择题 200 题宝典是由 Jack 老师倾力打造的备考神器。精选了 200 道历年最经典、最具代表性的客观题。不仅有详尽的纸质解析，每道题旁边更印有专属声波二维码，微信扫码即可播放 Jack 老师亲述的秒杀技巧与背景故事，随时随地开启高效复习！",
    descSyllabusTitle: "宝典大纲",
    descSyllabusText: "第一篇章：中四核心考点选择题精炼\n第二篇章：中五核心考点选择题精炼\n第三篇章：选择题常见陷阱与快速排除法",
    testimonials: [
      {
        type: "image",
        src: 'images/Card_Photo/60.png',
        text: "“这本选择题宝典太方便了，扫一下就能听老师讲解，以前选择题拿不到15分，这次模拟考直接拿了32分！”",
        name: "李同学 (Form 5)"
      }
    ],
    faqs: [
      { q: "付款后如何收到实体宝典？", a: "我们将在您下单后的 2-3 个工作日内安排快递寄送书本到您填写的地址。" }
    ]
  },
  {
    id: "sej-trial-f5",
    title: "Sejarah SPM 攻攻班",
    subject: "Sejarah",
    type: "Live Class",
    teacher: "Jack 老师",
    coverImage: "images/product-course.png",
    imgBack: "images/product-course.png",
    imgFront: "images/Card_Photo/60.png",
    notes: "SPM 考前冲刺拿分神班",
    badge: "Hot Release",
    badgeClass: "badge-hot",
    targetAudience: "Form 5 学生",
    pricingOptions: [
      { name: "1个月体验", price: 49, originalPrice: 99 },
      { name: "3个月全包特惠", price: 119, originalPrice: 297 }
    ],
    formOptions: ["Form 5"],
    timeOptions: ["星期日 8:00PM - 9:30PM"],
    price1Month: 49,
    originalPrice1Month: 99,
    price3Month: 119,
    originalPrice3Month: 297,
    teachingMethod: "Zoom 直播课",
    duration: "1.5 小时",
    features: [
      "精准锁定 2026 各州预测试卷热门考点",
      "传授独家‘乱乱写’满分得分点套路",
      "无限次高清重播回放权限至考试结束"
    ],
    descAboutTitle: "关于本课程",
    descAboutText: "专为 Form 5 学生打造的考前冲刺攻攻班！紧扣 SPM 官方最新命题大纲，精选全国各州考前模拟卷，直击出题人逻辑。通过高强度的互动直播和核心得分模板套路，让基础在低分徘徊的学生能在最短的考前冲刺阶段掌握拿分绝招，打破不及格的宿命，稳拿 A-！",
    descSyllabusTitle: "冲刺大纲",
    descSyllabusText: "中四重要篇章预测考点攻关与 KBAT 解法\n中五热门章节论述题高分万能模板默写\nSPM 历史 Paper 2 结构题答题结构剖析",
    testimonials: [
      {
        type: "image",
        src: 'images/Card_Photo/2.png',
        text: "“跟着老师攻攻班两个星期，原本完全不会写的 KBAT 题突然知道怎么下笔了，写的句式考官直接给满分！”",
        name: "陈同学 (Form 5)"
      }
    ],
    faqs: [
      { q: "错过了直播可以看回放吗？", a: "可以的，所有的直播在课程结束后的 24 小时内均会上传高清无插水录播回放，并且支持无限次重播。" }
    ]
  },
  {
    id: "sej-bundle",
    title: "Sejarah 万能宝典",
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
    price1Month: 199,
    originalPrice1Month: 399,
    price3Month: 0,
    originalPrice3Month: 0,
    teachingMethod: "随买随看",
    duration: "自主掌握进度",
    features: [
      "包含《历史秘笈》与《乱乱写》两本实体笔记本直邮",
      "中四中五核心专题网课包随买随看",
      "永久加入助教极速答疑群"
    ],
    descAboutTitle: "关于本套餐",
    descAboutText: "最划算的选择！一次拿齐 Jack 老师专属实体笔记本与核心专题录像网课，节省更多，学习更系统。无论是平时复习还是考前救命，都是您 SPM 历史拿 A 的终极全包选择！",
    descSyllabusTitle: "学习内容",
    descSyllabusText: "《Jack老师历史秘笈》专属笔记本一册\n《万能乱乱写》核心 KBAT 笔记本一册\n中四专题 1–10 网课与讲座回放资源包\n中五专题 1–10 网课与讲座回放资源包",
    testimonials: [
      {
        type: "image",
        src: 'images/Card_Photo/60.png',
        text: "“两本实体笔记本真的设计得太漂亮了，配着老师的专题网课学习，以前觉得最难的一章，20分钟就通透了！”",
        name: "徐同学 (Form 5)"
      }
    ],
    faqs: [
      { q: "讲义是实体寄送的吗？", a: "是的，VIP 套餐中包含的专属《历史秘笈》与《乱乱写》笔记本是实体彩色印刷的，下单后 2-3 个工作日内会包邮快递到您家。" }
    ]
  }
];

const DEFAULT_ORDERS = [];

// 初始化本地数据库并自动合并更新
// 初始化本地数据库并自动合并升级更新 (采用无损就地升级，避免覆盖用户自定义录入的课程)
function initDatabase() {
  try {
    const currentCourses = JSON.parse(localStorage.getItem("jack_courses"));
    const needsReset = !currentCourses || !Array.isArray(currentCourses);
    if (needsReset) {
      localStorage.setItem("jack_courses", JSON.stringify(DEFAULT_COURSES));
    } else {
      let changed = false;
      currentCourses.forEach(c => {
        if (!c || typeof c !== "object") return;
        // 1. 补全 pricingOptions
        if (!c.pricingOptions || !Array.isArray(c.pricingOptions)) {
          c.pricingOptions = [];
          const p1 = c.price1Month || c.price || 0;
          const o1 = c.originalPrice1Month || c.originalPrice || 0;
          c.pricingOptions.push({ name: "1个月通行证", price: p1, originalPrice: o1 });
          
          const p3 = c.price3Month || 0;
          const o3 = c.originalPrice3Month || 0;
          if (p3 > 0) {
            c.pricingOptions.push({ name: "3个月通行证", price: p3, originalPrice: o3 });
          }
          changed = true;
        }
        // 2. 补全 timeOptions
        if (!c.timeOptions || !Array.isArray(c.timeOptions)) {
          if (c.time) {
            c.timeOptions = [c.time];
          } else {
            c.timeOptions = ["星期四 8:00PM", "星期六 10:00AM"];
          }
          changed = true;
        }
      });
      
      if (changed) {
        localStorage.setItem("jack_courses", JSON.stringify(currentCourses));
        console.log("Successfully migrated local course database schema losslessly.");
      }
    }
  } catch (e) {
    console.error("Course DB init error:", e);
  }

  try {
    let currentOrders = JSON.parse(localStorage.getItem("jack_orders") || "[]");
    if (Array.isArray(currentOrders)) {
      currentOrders = currentOrders.filter(o => o && o.id !== "JK-20260520-001" && o.id !== "JK-20260520-002" && o.email !== "xiaoming@gmail.com" && o.email !== "weihan.lim@gmail.com");
      localStorage.setItem("jack_orders", JSON.stringify(currentOrders));
    }
  } catch (e) {
    localStorage.setItem("jack_orders", JSON.stringify([]));
  }

  try {
    let currentRegs = JSON.parse(localStorage.getItem("jack_registered_users") || "[]");
    if (Array.isArray(currentRegs)) {
      currentRegs = currentRegs.filter(u => u && u.email !== "xiaoming@gmail.com" && u.email !== "weihan.lim@gmail.com");
      localStorage.setItem("jack_registered_users", JSON.stringify(currentRegs));
    }
  } catch (e) {
    localStorage.setItem("jack_registered_users", JSON.stringify([]));
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
  getRawAll: () => {
    try {
      return JSON.parse(localStorage.getItem("jack_courses")) || [];
    } catch (e) {
      console.error("Failed to parse jack_courses", e);
      return [];
    }
  },
  getAll: function() {
    const rawList = this.getRawAll();
    return rawList.map(c => this.getById(c.id)).filter(Boolean);
  },
  getRawById: function(id) {
    if (!id) return null;
    let baseId = id;
    if (baseId === 'wanneng-book' || baseId === 'book') baseId = 'sej-obj-200';
    if (baseId === 'wanneng-vip-bundle' || baseId === 'bundle') baseId = 'sej-bundle';
    if (typeof baseId === "string" && baseId.startsWith('sej-live')) baseId = 'sej-regular';

    const optMatch = typeof id === "string" && id.match(/-opt-(\d+)$/);
    if (optMatch) {
      baseId = id.slice(0, -optMatch[0].length);
    } else if (typeof id === "string" && id.endsWith("-3m")) {
      baseId = id.slice(0, -3);
    } else if (typeof id === "string" && id.endsWith("-1m")) {
      baseId = id.slice(0, -3);
    }
    if (typeof baseId === "string" && baseId.startsWith('sej-live')) baseId = 'sej-regular';
    return (this.getRawAll() || []).find(c => c.id === baseId) || null;
  },
  getById: function(id) {
    if (!id) return null;
    let baseId = id;
    let optIndex = -1;

    if (id === 'wanneng-book' || id === 'book') baseId = 'sej-obj-200';
    if (id === 'wanneng-vip-bundle' || id === 'bundle') baseId = 'sej-bundle';
    if (id === 'sej-live-1m') { baseId = 'sej-regular'; optIndex = 0; }
    if (id === 'sej-live-3m') { baseId = 'sej-regular'; optIndex = 1; }

    // Check if it ends with -opt-[index] (e.g. sej-regular-opt-0)
    const optMatch = typeof id === "string" && id.match(/-opt-(\d+)$/);
    if (optMatch) {
      optIndex = parseInt(optMatch[1], 10);
      baseId = id.slice(0, -optMatch[0].length);
    } else if (typeof id === "string" && id.endsWith("-3m")) {
      if (optIndex < 0) optIndex = 1;
      baseId = id.slice(0, -3);
    } else if (typeof id === "string" && id.endsWith("-1m")) {
      if (optIndex < 0) optIndex = 0;
      baseId = id.slice(0, -3);
    }
    if (typeof baseId === "string" && baseId.startsWith('sej-live')) baseId = 'sej-regular';

    const raw = (this.getRawAll() || []).find(c => c.id === baseId);
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
      if (optIndex > 0) {
        title = `${raw.title} (${opt.name})`;
      } else {
        title = raw.title;
      }
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
    let baseId = course.id;
    if (baseId === 'wanneng-book' || baseId === 'book') baseId = 'sej-obj-200';
    if (baseId === 'wanneng-vip-bundle' || baseId === 'bundle') baseId = 'sej-bundle';
    if (typeof baseId === "string" && baseId.startsWith('sej-live')) baseId = 'sej-regular';

    const courses = CourseDB.getRawAll() || [];
    const index = courses.findIndex(c => c && (c.id === course.id || c.id === baseId));
    if (index >= 0) {
      courses[index] = course;
    } else {
      courses.push(course);
    }
    localStorage.setItem("jack_courses", JSON.stringify(courses));

    if (window.SupabaseConfig) {
      fetch(`${window.SupabaseConfig.url}/rest/v1/jack_courses`, {
        method: "POST",
        headers: {
          "apikey": window.SupabaseConfig.apiKey,
          "Authorization": `Bearer ${window.SupabaseConfig.apiKey}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(course)
      }).catch(e => console.warn("Supabase course save warning:", e));
    }
    return course;
  },
  delete: function(id) {
    if (!id) return;
    let baseId = id;
    if (baseId === 'wanneng-book' || baseId === 'book') baseId = 'sej-obj-200';
    if (baseId === 'wanneng-vip-bundle' || baseId === 'bundle') baseId = 'sej-bundle';
    if (typeof baseId === "string" && baseId.startsWith('sej-live')) baseId = 'sej-regular';

    const optMatch = typeof id === "string" && id.match(/-opt-(\d+)$/);
    if (optMatch) {
      baseId = id.slice(0, -optMatch[0].length);
    } else if (typeof id === "string" && id.endsWith("-3m")) {
      baseId = id.slice(0, -3);
    } else if (typeof id === "string" && id.endsWith("-1m")) {
      baseId = id.slice(0, -3);
    }
    if (typeof baseId === "string" && baseId.startsWith('sej-live')) baseId = 'sej-regular';

    let courses = this.getRawAll() || [];
    courses = courses.filter(c => c && c.id !== id && c.id !== baseId);
    localStorage.setItem("jack_courses", JSON.stringify(courses));

    try {
      let shopCards = JSON.parse(localStorage.getItem("jackShopCards") || "[]");
      if (Array.isArray(shopCards)) {
        shopCards = shopCards.filter(card => card && card.id !== id && card.id !== baseId);
        localStorage.setItem("jackShopCards", JSON.stringify(shopCards));
      }
    } catch(e) {}

    if (window.SupabaseConfig) {
      fetch(`${window.SupabaseConfig.url}/rest/v1/jack_courses?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          "apikey": window.SupabaseConfig.apiKey,
          "Authorization": `Bearer ${window.SupabaseConfig.apiKey}`
        }
      }).catch(e => console.warn("Supabase course delete warning:", e));

      if (baseId !== id) {
        fetch(`${window.SupabaseConfig.url}/rest/v1/jack_courses?id=eq.${encodeURIComponent(baseId)}`, {
          method: "DELETE",
          headers: {
            "apikey": window.SupabaseConfig.apiKey,
            "Authorization": `Bearer ${window.SupabaseConfig.apiKey}`
          }
        }).catch(e => console.warn("Supabase course delete warning:", e));
      }
    }
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

    if (window.SupabaseSync) {
      window.SupabaseSync.pushOrder(newOrder);
    }
    
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
    name: "王佳莹",
    role: "Form 5 (Fail -> A+)",
    screenshot: "images/见证/1.png"
  },
  {
    id: "st-2",
    text: "老师整理的《乱乱写》魔法笔记太神奇了，考试时直接默写核心关键字，写少少字竟然拿了满分！",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "林伟瀚",
    role: "Form 5 (历史全班第一 🏆)",
    screenshot: "images/见证/23.png"
  },
  {
    id: "st-3",
    text: "历史本来是我最头疼的科目，上过Jack老师的第一堂课后，我发现Sejarah原来像看漫画剧集一样有趣！",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Siti Norhaliza",
    role: "Form 4 (兴趣激发 ✨)",
    screenshot: "images/见证/30.png"
  },
  {
    id: "st-4",
    text: "原本只希望全部科目都Pass，跟着Jack老师口诀学习两个月，SPM成绩放榜Sejarah稳拿A-！",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Tan Min Jie",
    role: "Form 5 (G级逆袭到A-)",
    screenshot: "images/见证/37.png"
  },
  {
    id: "st-5",
    text: "不仅教知识，还教满分思维和临考心态，简直是全马最棒的历史魔法老师！",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Lee Mei Kee",
    role: "Form 5 (提分榜样 🌟)",
    screenshot: "images/见证/39.png"
  },
  {
    id: "st-6",
    text: "考前两个月冲刺班，完全锁定了SPM的热门考点，让我在考场上胸有成竹，顺利拿到A！",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Nurul Aishah",
    role: "Form 5 (考前冲刺稳夺A)",
    screenshot: "images/见证/48.png"
  },
  {
    id: "st-7",
    text: "独家故事法授课超级幽默！不知不觉就记住了复杂的朝代和概念，考试时脑海里全画面！",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Wong Yew Choong",
    role: "Form 4 (故事趣味法记忆)",
    screenshot: "images/见证/50.png"
  },
  {
    id: "st-8",
    text: "不用怀疑，选Jack老师的课是今年最明智的决定，已经拉着全班闺蜜一起续费学习了！",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Zarith Sofia",
    role: "Form 5 (全员强烈力荐)",
    screenshot: "images/见证/54.png"
  },
  {
    id: "st-9",
    text: "用最聪明的思维导图做总结，别人在痛苦背书，我在轻松拿分，历史提分简直像开挂一样！",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Lau Yu Xuan",
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

        // Self-healing: Reset if the data contains old placeholders, ERP texts, or Saman Malik as Customer Support Lead
        const hasLegacyData = parsed.some(t => 
          t.text.includes("ERP") || 
          t.text.includes("exceptional") || 
          t.text.includes("支持团队非常出色") || 
          t.role === "Customer Support Lead" || 
          t.role === "客户支持负责人" ||
          t.name === "Briana Patton"
        );

        if (hasLegacyData) {
          localStorage.setItem("jack_scrolling_testimonials", JSON.stringify(DEFAULT_SCROLLING_TESTIMONIALS));
          return DEFAULT_SCROLLING_TESTIMONIALS;
        }

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

// ==========================================
// SUPABASE CLOUD DATABASE SYNC ENGINE
// ==========================================
window.SupabaseConfig = {
  url: "https://kgxphklbclfalmuclclw.supabase.co",
  apiKey: "sb_publishable_Xo9854KTwiPDgpPeFUJtzQ_JfJWQFZf"
};

window.SupabaseSync = {
  pushStudent: function(userObj) {
    if (!userObj || !userObj.email) return;
    fetch(`${window.SupabaseConfig.url}/rest/v1/jack_students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": window.SupabaseConfig.apiKey,
        "Authorization": `Bearer ${window.SupabaseConfig.apiKey}`,
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify({
        name: userObj.studentName || userObj.name || "学员",
        whatsapp: userObj.whatsapp || userObj.phone || "",
        email: userObj.email.toLowerCase(),
        password: userObj.password || "",
        grade: userObj.grade || "Form 5",
        provider: userObj.provider || "系统注册"
      })
    }).catch(e => console.warn("Supabase student push async warning:", e));
  },
  pushOrder: function(orderObj) {
    if (!orderObj || !orderObj.id) return;
    fetch(`${window.SupabaseConfig.url}/rest/v1/jack_orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": window.SupabaseConfig.apiKey,
        "Authorization": `Bearer ${window.SupabaseConfig.apiKey}`,
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify({
        id: orderObj.id,
        date: orderObj.date || new Date().toISOString().split('T')[0],
        student_name: orderObj.studentName || "学员",
        whatsapp: orderObj.whatsapp || orderObj.phone || "",
        email: orderObj.email || "",
        grade: orderObj.grade || "Form 5",
        courses: orderObj.courses || [],
        total: orderObj.total || 0,
        method: orderObj.method || "Online Payment",
        status: orderObj.status || "Paid"
      })
    }).catch(e => console.warn("Supabase order push async warning:", e));
  }
};

// ==========================================
// UNIFIED STUDENT AUTHENTICATION & SESSION ENGINE
// ==========================================
window.StudentAuth = {
  get: function() {
    try {
      const val = window.localStorage.getItem("jack_current_student");
      if (val && val !== "undefined" && val !== "null") {
        return JSON.parse(val);
      }
    } catch(e) {}
    return null;
  },
  set: function(userObj) {
    try {
      window.localStorage.setItem("jack_current_student", JSON.stringify(userObj));
    } catch(e) {}
    if (window.SupabaseSync && userObj) {
      window.SupabaseSync.pushStudent(userObj);
    }
    if (typeof window.updateStudentLoginButtons === 'function') {
      window.updateStudentLoginButtons();
    }
  },
  logout: function() {
    try {
      window.localStorage.removeItem("jack_current_student");
    } catch(e) {}
    if (typeof window.updateStudentLoginButtons === 'function') {
      window.updateStudentLoginButtons();
    }
  },
  getRegisteredUsers: function() {
    try {
      const users = window.localStorage.getItem("jack_registered_users");
      return users ? JSON.parse(users) : [];
    } catch(e) {
      return [];
    }
  },
  registerUser: function(userObj) {
    const users = this.getRegisteredUsers();
    const existingIndex = users.findIndex(u => u.email && u.email.toLowerCase() === userObj.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...userObj };
    } else {
      users.push(userObj);
    }
    try {
      window.localStorage.setItem("jack_registered_users", JSON.stringify(users));
    } catch(e) {}
    if (window.SupabaseSync) {
      window.SupabaseSync.pushStudent(userObj);
    }
    this.set(userObj);
  }
};

window.updateStudentLoginButtons = function() {
  const navLoginBtn = document.getElementById('navLoginBtn');
  if (!navLoginBtn) return;

  const currentStudent = window.StudentAuth ? window.StudentAuth.get() : null;

  if (currentStudent && (currentStudent.studentName || currentStudent.name)) {
    const studentName = currentStudent.studentName || currentStudent.name || '学员';
    navLoginBtn.innerHTML = `👤 ${studentName}`;
    navLoginBtn.setAttribute('aria-label', `查看 ${studentName} 的个人订单`);
    navLoginBtn.onclick = (e) => {
      e.preventDefault();
      window.location.href = 'student.html';
    };

    const bottomLoginSpan = document.querySelector('#bottomLogin span');
    if (bottomLoginSpan) {
      bottomLoginSpan.textContent = studentName;
    }
  } else {
    navLoginBtn.textContent = 'Login/Sign Up';
    navLoginBtn.setAttribute('aria-label', 'Login/Sign Up');
    navLoginBtn.onclick = (e) => {
      e.preventDefault();
      if (typeof openLogin === 'function') {
        openLogin();
      } else {
        window.location.href = 'student.html';
      }
    };
  }
};

// 页面加载时自动初始化购物车数量、学生状态与 WhatsApp 浮动按钮
document.addEventListener("DOMContentLoaded", () => {
  Cart.updateUI();
  window.updateStudentLoginButtons();

  // 自动添加右下角 WhatsApp Floating Button (管理后台隐藏)
  const isAdmin = window.location.pathname.includes("admin.html");
  if (!isAdmin && !document.getElementById("whatsappFloatBtn") && document.body) {
    const waBtn = document.createElement("a");
    waBtn.id = "whatsappFloatBtn";
    waBtn.href = "https://wa.link/yusvrp";
    waBtn.target = "_blank";
    waBtn.rel = "noopener noreferrer";
    waBtn.className = "whatsapp-float-btn";
    waBtn.setAttribute("aria-label", "WhatsApp 客服咨询");
    waBtn.setAttribute("title", "WhatsApp 客服咨询");
    waBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.66.986 3.288 1.488 4.674 1.49 5.345 0 9.771-4.342 9.774-9.673.002-2.583-1.002-5.01-2.827-6.837-1.823-1.826-4.249-2.83-6.834-2.831-5.345 0-9.769 4.341-9.773 9.671-.002 1.94.512 3.826 1.492 5.503l-.979 3.575 3.673-.963zm11.96-5.834c-.267-.134-1.583-.78-1.827-.869-.243-.088-.422-.132-.599.135-.178.266-.689.867-.844 1.045-.156.177-.311.199-.579.066-.268-.134-1.13-.417-2.153-1.328-.795-.71-1.333-1.586-1.489-1.854-.156-.266-.017-.41.117-.543.12-.12.267-.31.401-.466.133-.155.178-.266.266-.443.089-.178.045-.333-.022-.467-.067-.133-.599-1.442-.821-1.974-.216-.52-.452-.45-.623-.459-.16-.008-.344-.01-.527-.01-.184 0-.483.069-.735.345-.252.276-.962.94-.962 2.292 0 1.352.983 2.658 1.121 2.836.137.178 1.933 2.951 4.683 4.137.654.282 1.165.45 1.562.576.657.21 1.256.18 1.728.11.526-.078 1.583-.647 1.806-1.272.223-.625.223-1.162.156-1.272-.067-.11-.244-.199-.512-.332z"/>
      </svg>
    `;
    document.body.appendChild(waBtn);
  }
});
