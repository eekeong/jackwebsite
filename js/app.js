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

// Razorpay 付款网关全局配置
window.RazorpayConfig = {
  key_id: "rzp_test_Sgr2dt2LBq1SIm",
  merchant_name: "万能教Jack老师",
  currency: "MYR",
  theme_color: "#fc0c97"
};

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
    imgFront: "images/Card_Photo/IMG_7567 (1).png",
    notes: "打好基础最好的选择!",
    subtitle: "打好基础最好的选择!",
    badge: "Best Seller",
    badgeClass: "badge-hot",
    targetAudience: "Form 1, Form 2, Form 3, Form 4, Form 5",
    form: "Form 1, Form 2, Form 3, Form 4, Form 5",
    pricingOptions: [
      { name: "1个月", price: 88, originalPrice: 108 },
      { name: "3个月", price: 229, originalPrice: 477 }
    ],
    formOptions: ["Form 1", "Form 2", "Form 3", "Form 4", "Form 5"],
    timeOptions: ["星期四 8:00PM", "星期六 10:00AM"],
    price1Month: 88,
    originalPrice1Month: 108,
    price3Month: 229,
    originalPrice3Month: 477,
    price: 88,
    originalPrice: 108,
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
    testimonials: [],
    faqs: [],
    galleryMedia: [
      { type: "image", src: "images/Card_Photo/IMG_7567 (1).png" }
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
          c.pricingOptions.push({ name: "1个月", price: p1, originalPrice: o1 });
          
          const p3 = c.price3Month || 0;
          const o3 = c.originalPrice3Month || 0;
          if (p3 > 0) {
            c.pricingOptions.push({ name: "3个月", price: p3, originalPrice: o3 });
          }
          changed = true;
        } else {
          c.pricingOptions.forEach(opt => {
            if (opt.name === "1个月通行证" || opt.name === "1个月体验") { opt.name = "1个月"; changed = true; }
            if (opt.name === "3个月通行证" || opt.name === "3个月套餐") { opt.name = "3个月"; changed = true; }
          });
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
      // Normalize option names for display consistency
      raw.pricingOptions.forEach(opt => {
        if (opt.name === "1个月通行证" || opt.name === "1个月体验") opt.name = "1个月";
        if (opt.name === "3个月通行证" || opt.name === "3个月套餐") opt.name = "3个月";
      });
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
          ...window.SupabaseConfig.authHeaders(),
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(course)
      }).then(res => {
        if (!res.ok) {
          res.text().then(t => console.error("Supabase course save FAILED — this course only saved locally, not to the cloud:", res.status, t));
          if (typeof window.showToast === 'function') {
            window.showToast('⚠️', '课程未能同步到云端，其他人暂时看不到这次修改，请重新登录管理员账号后再试一次');
          }
        }
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
          ...window.SupabaseConfig.authHeaders()
        }
      }).catch(e => console.warn("Supabase course delete warning:", e));

      if (baseId !== id) {
        fetch(`${window.SupabaseConfig.url}/rest/v1/jack_courses?id=eq.${encodeURIComponent(baseId)}`, {
          method: "DELETE",
          headers: {
          ...window.SupabaseConfig.authHeaders()
          }
        }).catch(e => console.warn("Supabase course delete warning:", e));
      }
    }
  },
  syncFromCloud: async function() {
    if (!window.SupabaseConfig) return;
    try {
      const res = await fetch(`${window.SupabaseConfig.url}/rest/v1/jack_courses?select=*`, {
        headers: {
          ...window.SupabaseConfig.authHeaders()
        }
      });
      if (res.ok) {
        const cloudCourses = await res.json();
        if (Array.isArray(cloudCourses) && cloudCourses.length > 0) {
          localStorage.setItem("jack_courses", JSON.stringify(cloudCourses));
          window.dispatchEvent(new CustomEvent("jack_courses_synced", { detail: cloudCourses }));
          if (typeof window.renderShopCards === 'function') {
            window.renderShopCards();
          }
          if (typeof window.renderCourseDetailData === 'function') {
            window.renderCourseDetailData();
          }
          if (typeof window.renderAdminDashboard === 'function') {
            window.renderAdminDashboard();
          }
        }
      }
    } catch(e) {
      console.warn("Supabase courses sync warning:", e);
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
  add: (courseId, silent = false) => {
    const cart = Cart.get();
    if (cart.includes(courseId)) {
      if (!silent) alert("该课程已经在您的购物车中！");
      return true;
    }
    cart.push(courseId);
    Cart.save(cart);
    if (!silent) showFloatingNotification("已成功加入购物车！");
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
  create: (studentInfo, cartItems, totalAmount, paymentMethod, status = "Pending") => {
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
      courseIds: cartItems.map(c => c.id || ""),
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
    
    if (status === "Paid") {
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
    }
    
    return newOrder;
  },
  updateStatus: (orderId, status) => {
    const orders = OrderDB.getAll() || [];
    const index = orders.findIndex(o => o.id === orderId);
    if (index >= 0) {
      orders[index].status = status;
      localStorage.setItem("jack_orders", JSON.stringify(orders));

      if (status === "Paid" && orders[index].email) {
        const email = orders[index].email.toLowerCase();
        let studentCourses = [];
        try {
          studentCourses = JSON.parse(localStorage.getItem(`student_courses_${email}`)) || [];
        } catch(e) {}
        if (Array.isArray(orders[index].courseIds)) {
          orders[index].courseIds.forEach(id => {
            if (id && !studentCourses.includes(id)) studentCourses.push(id);
          });
        }
        localStorage.setItem(`student_courses_${email}`, JSON.stringify(studentCourses));
      }

      if (window.SupabaseConfig) {
        fetch(`${window.SupabaseConfig.url}/rest/v1/jack_orders?id=eq.${encodeURIComponent(orderId)}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          ...window.SupabaseConfig.authHeaders()
          },
          body: JSON.stringify({ status: status })
        }).catch(e => console.warn("Supabase order status update warning:", e));
      }
      return true;
    }
    return false;
  },
  delete: (orderId) => {
    let orders = OrderDB.getAll() || [];
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem("jack_orders", JSON.stringify(orders));
    if (window.SupabaseConfig) {
      fetch(`${window.SupabaseConfig.url}/rest/v1/jack_orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: "DELETE",
        headers: {
          ...window.SupabaseConfig.authHeaders()
        }
      }).catch(e => console.warn("Supabase order delete warning:", e));
    }
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
        parsed = parsed.filter(c => c && c.id && c.title && c.desc && c.image);
        if (parsed.length > 0) {
          return parsed;
        }
      }
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
      if (window.SupabaseConfig) {
        fetch(`${window.SupabaseConfig.url}/rest/v1/jack_hero_cards`, {
          method: "POST",
          headers: {
          ...window.SupabaseConfig.authHeaders(),
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
          },
          body: JSON.stringify(card)
        }).catch(e => console.warn("Supabase hero save warning:", e));
      }
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
    if (window.SupabaseConfig) {
      fetch(`${window.SupabaseConfig.url}/rest/v1/jack_hero_cards?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          ...window.SupabaseConfig.authHeaders()
        }
      }).catch(e => console.warn("Supabase hero delete warning:", e));
    }
  },
  syncFromCloud: async function() {
    if (!window.SupabaseConfig) return;
    try {
      const res = await fetch(`${window.SupabaseConfig.url}/rest/v1/jack_hero_cards?select=*`, {
        headers: {
          ...window.SupabaseConfig.authHeaders()
        }
      });
      if (res.ok) {
        const cloudData = await res.json();
        if (Array.isArray(cloudData) && cloudData.length > 0) {
          localStorage.setItem("jack_hero_cards", JSON.stringify(cloudData));
          window.dispatchEvent(new CustomEvent("jack_hero_cards_synced", { detail: cloudData }));
          if (typeof window.initAchCardSlider === 'function') {
            window.initAchCardSlider();
          }
        }
      }
    } catch(e) {}
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
      if (window.SupabaseConfig) {
        fetch(`${window.SupabaseConfig.url}/rest/v1/jack_schedules`, {
          method: "POST",
          headers: {
          ...window.SupabaseConfig.authHeaders(),
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
          },
          body: JSON.stringify(item)
        }).catch(e => console.warn("Supabase schedule save warning:", e));
      }
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
    if (window.SupabaseConfig) {
      fetch(`${window.SupabaseConfig.url}/rest/v1/jack_schedules?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          ...window.SupabaseConfig.authHeaders()
        }
      }).catch(e => console.warn("Supabase schedule delete warning:", e));
    }
  },
  syncFromCloud: async function() {
    if (!window.SupabaseConfig) return;
    try {
      const res = await fetch(`${window.SupabaseConfig.url}/rest/v1/jack_schedules?select=*`, {
        headers: {
          ...window.SupabaseConfig.authHeaders()
        }
      });
      if (res.ok) {
        const cloudData = await res.json();
        if (Array.isArray(cloudData) && cloudData.length > 0) {
          localStorage.setItem("jack_schedules", JSON.stringify(cloudData));
          window.dispatchEvent(new CustomEvent("jack_schedules_synced", { detail: cloudData }));
          if (typeof window.renderWeeklyTimetable === 'function') {
            window.renderWeeklyTimetable();
          }
          if (typeof window.initDynamicSchedule === 'function') {
            window.initDynamicSchedule();
          }
        }
      }
    } catch(e) {}
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
      if (window.SupabaseConfig) {
        fetch(`${window.SupabaseConfig.url}/rest/v1/jack_testimonials`, {
          method: "POST",
          headers: {
          ...window.SupabaseConfig.authHeaders(),
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
          },
          body: JSON.stringify(testi)
        }).catch(e => console.warn("Supabase testi save warning:", e));
      }
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
    if (window.SupabaseConfig) {
      fetch(`${window.SupabaseConfig.url}/rest/v1/jack_testimonials?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          ...window.SupabaseConfig.authHeaders()
        }
      }).catch(e => console.warn("Supabase testi delete warning:", e));
    }
  },
  syncFromCloud: async function() {
    if (!window.SupabaseConfig) return;
    try {
      const res = await fetch(`${window.SupabaseConfig.url}/rest/v1/jack_testimonials?select=*`, {
        headers: {
          ...window.SupabaseConfig.authHeaders()
        }
      });
      if (res.ok) {
        const cloudData = await res.json();
        if (Array.isArray(cloudData) && cloudData.length > 0) {
          localStorage.setItem("jack_testimonials", JSON.stringify(cloudData));
          window.dispatchEvent(new CustomEvent("jack_testimonials_synced", { detail: cloudData }));
        }
      }
    } catch(e) {}
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
      if (window.SupabaseConfig) {
        fetch(`${window.SupabaseConfig.url}/rest/v1/jack_scrolling_testimonials`, {
          method: "POST",
          headers: {
          ...window.SupabaseConfig.authHeaders(),
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
          },
          body: JSON.stringify(testi)
        }).catch(e => console.warn("Supabase scrolling save warning:", e));
      }
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
    if (window.SupabaseConfig) {
      fetch(`${window.SupabaseConfig.url}/rest/v1/jack_scrolling_testimonials?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          ...window.SupabaseConfig.authHeaders()
        }
      }).catch(e => console.warn("Supabase scrolling delete warning:", e));
    }
  },
  syncFromCloud: async function() {
    if (!window.SupabaseConfig) return;
    try {
      const res = await fetch(`${window.SupabaseConfig.url}/rest/v1/jack_scrolling_testimonials?select=*`, {
        headers: {
          ...window.SupabaseConfig.authHeaders()
        }
      });
      if (res.ok) {
        const cloudData = await res.json();
        if (Array.isArray(cloudData) && cloudData.length > 0) {
          localStorage.setItem("jack_scrolling_testimonials", JSON.stringify(cloudData));
          window.dispatchEvent(new CustomEvent("jack_scrolling_testimonials_synced", { detail: cloudData }));
        }
      }
    } catch(e) {}
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
  
  setTimeout(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateY(0)";
  }, 10);
  
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
  apiKey: "sb_publishable_Xo9854KTwiPDgpPeFUJtzQ_JfJWQFZf",
  // Returns the headers to use for a Supabase REST call. If an admin session is
  // active, its access token is sent so the request runs as the authenticated
  // (admin) role; otherwise it falls back to the public anon key. Server-side
  // RLS policies are the real enforcement boundary — this only picks the token.
  authHeaders: function(extra) {
    const token = window.sessionStorage.getItem("jack_admin_access_token");
    return Object.assign({
      "apikey": this.apiKey,
      "Authorization": `Bearer ${token || this.apiKey}`
    }, extra || {});
  }
};

// ==========================================
// SUPABASE AUTH — real backend-verified admin login
// ==========================================
window.SupabaseAuth = {
  ADMIN_EMAIL: "admin@eduhero.com.my",
  signIn: async function(email, password) {
    try {
      const res = await fetch(`${window.SupabaseConfig.url}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "apikey": window.SupabaseConfig.apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.access_token) return false;
      window.sessionStorage.setItem("jack_admin_access_token", data.access_token);
      window.sessionStorage.setItem("jack_admin_refresh_token", data.refresh_token || "");
      return true;
    } catch (e) {
      console.warn("Supabase admin sign-in warning:", e);
      return false;
    }
  },
  signOut: function() {
    const token = window.sessionStorage.getItem("jack_admin_access_token");
    if (token) {
      fetch(`${window.SupabaseConfig.url}/auth/v1/logout`, {
        method: "POST",
        headers: {
          "apikey": window.SupabaseConfig.apiKey,
          "Authorization": `Bearer ${token}`
        }
      }).catch(() => {});
    }
    window.sessionStorage.removeItem("jack_admin_access_token");
    window.sessionStorage.removeItem("jack_admin_refresh_token");
  },
  isLoggedIn: function() {
    return !!window.sessionStorage.getItem("jack_admin_access_token");
  }
};

window.SupabaseSync = {
  pushOrder: function(orderObj) {
    if (!orderObj || !orderObj.id) return;
    fetch(`${window.SupabaseConfig.url}/rest/v1/jack_orders`, {
      method: "POST",
      headers: window.SupabaseConfig.authHeaders({
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      }),
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
        status: orderObj.status || "Pending"
      })
    }).catch(e => console.warn("Supabase order push async warning:", e));
  }
};

// ==========================================
// UNIFIED STUDENT AUTHENTICATION & SESSION ENGINE
// Registration/login are verified server-side via SECURITY DEFINER RPCs
// (register_student / login_student) — passwords are hashed in the database
// and are never fetched to or compared on the client.
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
  // Returns the student profile (no password) on success, or throws an Error
  // with a short code (EMAIL_REQUIRED / PASSWORD_TOO_SHORT / EMAIL_ALREADY_REGISTERED).
  registerAsync: async function(userObj) {
    const res = await fetch(`${window.SupabaseConfig.url}/rest/v1/rpc/register_student`, {
      method: "POST",
      headers: window.SupabaseConfig.authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        p_name: userObj.studentName || userObj.name || "学员",
        p_whatsapp: userObj.whatsapp || userObj.phone || "",
        p_email: (userObj.email || "").toLowerCase(),
        p_password: userObj.password || "",
        p_grade: userObj.grade || "Form 5",
        p_provider: userObj.provider || "系统注册"
      })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const code = (data && data.message) || "REGISTER_FAILED";
      throw new Error(code);
    }
    const profile = { studentName: data.name, whatsapp: data.whatsapp, email: data.email, grade: data.grade, provider: data.provider };
    this.set(profile);
    return profile;
  },
  // Returns the student profile (no password) on success, or null on invalid credentials.
  loginAsync: async function(email, password) {
    const res = await fetch(`${window.SupabaseConfig.url}/rest/v1/rpc/login_student`, {
      method: "POST",
      headers: window.SupabaseConfig.authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ p_email: (email || "").toLowerCase(), p_password: password || "" })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) return null;
    const profile = { studentName: data.name, whatsapp: data.whatsapp, email: data.email, grade: data.grade, provider: data.provider };
    this.set(profile);
    return profile;
  },
  // Admin-only: full student directory, readable only with a valid admin session
  // (RLS returns an empty list for anyone without the authenticated/admin role).
  adminCache: [],
  fetchAllForAdmin: async function() {
    try {
      const res = await fetch(`${window.SupabaseConfig.url}/rest/v1/jack_students?select=*`, {
        headers: window.SupabaseConfig.authHeaders()
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          this.adminCache = rows.map(r => ({
            studentName: r.name || "系统学员",
            whatsapp: r.whatsapp || "-",
            email: r.email,
            grade: r.grade || "Form 5"
          }));
        }
      }
    } catch (e) {
      console.warn("Admin student directory fetch warning:", e);
    }
    return this.adminCache;
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

// 页面加载时自动执行全站多端云同步
async function syncAllDataFromCloud() {
  if (CourseDB.syncFromCloud) CourseDB.syncFromCloud();
  if (ScheduleDB.syncFromCloud) ScheduleDB.syncFromCloud();
  if (HeroCardDB.syncFromCloud) HeroCardDB.syncFromCloud();
  if (TestimonialDB.syncFromCloud) TestimonialDB.syncFromCloud();
  if (ScrollingTestimonialDB.syncFromCloud) ScrollingTestimonialDB.syncFromCloud();
  // Student directory is no longer synced client-side; register_student/login_student RPCs handle it server-side.
}

document.addEventListener("DOMContentLoaded", () => {
  Cart.updateUI();
  window.updateStudentLoginButtons();
  syncAllDataFromCloud();

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
      <img src="images/whatsapp-logo.png" alt="WhatsApp 客服咨询" class="whatsapp-float-img" />
    `;
    document.body.appendChild(waBtn);
  }
});
