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
    form: "Form 1-5 全Form适用",
    type: "Live Class",
    teacher: "Jack 老师",
    price: 49.00,
    originalPrice: 99.00,
    time: "每周固定直播授课 1.5 小时",
    format: "Zoom 直播授课 + 独家彩色电子版讲义",
    notes: "Best Seller · 冲刺提分神器",
    badge: "Best Seller",
    badgeClass: "badge-hot",
    image: "images/Card_Photo/IMG_7567 (1).png",
    imgBack: "images/Card_Photo/IMG_7567 (1).png",
    imgFront: "images/Card_Photo/card4-students-A.png",
    price1Month: 49.00,
    originalPrice1Month: 99.00,
    price3Month: 129.00,
    originalPrice3Month: 297.00,
    teachingMethod: "Zoom 直播课",
    duration: "1.5 小时",
    targetAudience: "Form 1 - Form 5",
    features: [
      "配套高画质彩色 PDF 与实体资料邮寄",
      "课后提供高清录像回放复习",
      "专属 WhatsApp 学习答疑辅导"
    ],
    galleryMedia: [
      { type: "image", src: "images/Card_Photo/IMG_7567 (1).png" },
      { type: "video", src: "images/SMJK HWA LIAN JACK CROP.mp4" },
      { type: "image", src: "images/Card_Photo/card4-students-A.png" }
    ],
    descAboutTitle: "关于本课程",
    descAboutText: "死记硬背记不住、主观大题不会拆解、感觉历史拿不到方向？这是专为基础薄弱以及想要冲刺A+的同学设计的Sejarah冲刺正课班。\nJack 老师通过15年的教学经验，总结出“万能解题法”，用最接地气的小故事把硬核大纲讲活，让你一听就会，做题思路爆棚。",
    descSyllabusTitle: "上课大纲",
    descSyllabusText: "第一阶段：核心历史事件梳理与脉络构建\n第二阶段：高频考点预测与 KBAT 答题套路解析\n第三阶段：历年真题实战演练与丢分盲区排雷",
    testimonials: [
      {
        type: "image",
        src: "images/Card_Photo/card4-students-A.png",
        text: "“这是我上过最轻松的历史课！不用再死背年份了，老师的口诀和故事太有效了，这次 Trial 直接从不及格跳到了 A-。”",
        name: "王同学 (Form 5)"
      },
      {
        type: "video",
        src: "images/SMJK HWA LIAN JACK CROP.mp4",
        text: "“以前看到 KBAT 题就头痛，现在完全知道该怎么下笔拿满分，感谢老师的套路解析。”",
        name: "李同学 (Form 5)"
      }
    ],
    faqs: [
      {
        q: "购买后什么时候可以开始上课？",
        a: "付款成功后，您将在24小时内收到带有专属学习链接 and 材料的 WhatsApp 通知，点击即可接入课堂系统。"
      },
      {
        q: "如果有课程冲突没法看直播怎么办？",
        a: "不用担心，所有直播课程在结束后都会上传高清回放，您可以随时随地反复观看，直到 SPM 考试结束。"
      },
      {
        q: "讲义是实体书还是 PDF？",
        a: "我们会提供高画质彩色 PDF 供您下载。如果您选择了包含实体材料的套餐，我们也会安排邮寄到您家。"
      }
    ]
  },
  {
    id: "sej-obj-200",
    title: "「会说话」Sejarah OBJ 200题宝典",
    subject: "Sejarah",
    form: "Form 5",
    type: "Objective Booster",
    teacher: "Jack 老师",
    price: 29.00,
    originalPrice: 59.00,
    time: "随买随看，即时解锁",
    format: "极速提分选择题详解视频课 + 实体教材",
    notes: "高频高产预测，轻松吃透200大必背大题",
    badge: "Hot",
    badgeClass: "badge-hot",
    image: "images/product-book.png",
    imgBack: "images/product-book.png",
    imgFront: "images/Card_Photo/2.png",
    price1Month: 29.00,
    originalPrice1Month: 59.00,
    price3Month: 0,
    originalPrice3Month: 0,
    teachingMethod: "录播精讲课 + 线上练习",
    duration: "共 5 小时提分视频",
    targetAudience: "Form 5 / SPM 考生",
    features: [
      "200 道独家研发的高产提分选择题精讲",
      "配合专属手绘图解讲义，秒杀易错点",
      "专为选择题零基础及冲刺满分的同学定制"
    ]
  },
  {
    id: "sej-bundle",
    title: "Sejarah 万能宝典",
    subject: "Sejarah",
    form: "Form 4–5",
    type: "VIP Bundle",
    teacher: "Jack 老师",
    price: 199.00,
    originalPrice: 399.00,
    time: "一次购买，全系列解锁",
    format: "含两本实体秘笈直邮 + 全套预测视频课 + 专属VIP群答疑",
    notes: "SPM 历史终极大礼包，超高性价比",
    badge: "VIP Save 50%",
    badgeClass: "badge-hot",
    image: "images/product-bundle.png",
    imgBack: "images/product-bundle.png",
    imgFront: "images/Jack Ler2 (1).png",
    price1Month: 199.00,
    originalPrice1Month: 399.00,
    price3Month: 0,
    originalPrice3Month: 0,
    teachingMethod: "直播课 + 录播课 + 实体教材",
    duration: "半年超长伴学体系",
    targetAudience: "Form 4 & Form 5 学生",
    features: [
      "包含《乱乱写》与《历史秘笈》两本实体精美笔记本直邮",
      "中四中五核心专题包、冲刺包、选择题突破包一键全包解锁",
      "专享 Jack 老师团队 1对1 答疑和作文精细批改服务"
    ]
  },
  {
    id: "sej-trial-f5",
    title: "SPM Sejarah Trial Attack (中五考前冲刺班)",
    subject: "Sejarah",
    form: "Form 5",
    type: "Trial Attack",
    teacher: "Jack 老师",
    price: 49.00,
    originalPrice: 99.00,
    time: "2026年5月28日 (星期四) 8:00PM - 10:00PM",
    format: "Zoom 直播授课 (含无限高清回放)",
    notes: "含 Jack 老师独家预测考题 PDF 讲义",
    badge: "Hot",
    badgeClass: "badge-hot",
    image: "images/courses/sejarah_trial_f5.jpg",
    syllabus: [
      "<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='vertical-align:-2px;margin-right:4px;'><polyline points='20 6 9 17 4 12'></polyline></svg> 第一部分：中五高频热门 Trial 历史大题预测与核心采分点",
      "<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='vertical-align:-2px;margin-right:4px;'><polyline points='20 6 9 17 4 12'></polyline></svg> 第二部分：Section B 简答题与 Section C 问答题“万能拆解套路”",
      "<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='vertical-align:-2px;margin-right:4px;'><polyline points='20 6 9 17 4 12'></polyline></svg> 第三部分：Sejarah 关键词极速联想记忆法（0基础也能听懂）"
    ]
  },
  {
    id: "sej-revision-f4",
    title: "Form 4 Sejarah Topic Focus (中四核心专题突破班)",
    subject: "Sejarah",
    form: "Form 4",
    type: "Topic Focus",
    teacher: "Jack 老师",
    price: 39.00,
    originalPrice: 79.00,
    time: "2026年5月30日 (星期六) 10:00AM - 12:00PM",
    format: "Zoom 直播授课 (含无限高清回放)",
    notes: "提供中四基础重点核心 PDF 精美笔记",
    badge: "Enrollment Open",
    badgeClass: "badge-new",
    image: "images/courses/sejarah_revision_f4.jpg",
    syllabus: [
      "📌 核心剖析：中四常考文明与建国基础（Sejarah 最深痛点）",
      "📌 经典高频：如何用“思维导图”3步攻破常考核心主观题",
      "📌 考场纠错：学生经常丢分的 Sejarah 陷阱词大揭秘"
    ]
  },
  {
    id: "sej-objective-f5",
    title: "SPM Sejarah Objective Booster Pack (中五选择题通关秘籍)",
    subject: "Sejarah",
    form: "Form 5",
    type: "Objective Booster",
    teacher: "Jack 老师",
    price: 29.00,
    originalPrice: 59.00,
    time: "随买随看 (无限录像重温)",
    format: "高清录制包 + 在线巩固测验",
    notes: "附赠 200 道精心编写的高频预测选择题 PDF",
    badge: "Limited Seats",
    badgeClass: "badge-limited",
    image: "images/courses/sejarah_obj_f5.jpg",
    syllabus: [
      "⚡ 选择题秒杀：Sejarah 10 大必背选择题秒杀技巧",
      "⚡ 易混词归纳：全网独家“考点易混词对比清单”",
      "⚡ 模拟实战：30分钟极速模拟冲刺训练解析"
    ]
  },
  {
    id: "sej-basic-f13",
    title: "Form 1-3 Sejarah Foundation Core (初中历史地基巩固大课)",
    subject: "Sejarah",
    form: "Form 3",
    type: "Revision Class",
    teacher: "Jack 老师",
    price: 19.00,
    originalPrice: 49.00,
    time: "随买随看 (永久回放)",
    format: "数码录播包 (共 8 节课精编版)",
    notes: "全套初中历史手绘漫画版 PDF 笔记",
    badge: "New",
    badgeClass: "badge-new",
    image: "images/courses/sejarah_basic_f13.jpg",
    syllabus: [
      "📚 故事学历史：把初中无聊的历史人物编成故事，听懂就会做！",
      "📚 架构建立：帮初一至初三的学生快速理清 Sejarah 历史时间轴",
      "📚 预备进阶：为接轨中四中五高强度 SPM 考试做好地基储备"
    ]
  },
  {
    id: "wanneng-book",
    title: "《Jack 老师历史秘笈》专属笔记本",
    subject: "Sejarah",
    form: "Form 1-5 全Form适用",
    type: "Study Material",
    teacher: "Jack 老师",
    price: 45.00,
    originalPrice: 89.00,
    time: "下单后 24 小时内发货",
    format: "精美彩色实体印刷笔记本",
    notes: "赠全套电子版思维导图大纲",
    badge: "Limited",
    badgeClass: "badge-limited",
    image: "images/book.jpg",
    syllabus: [
      "📌 精编考点：Form 4 & Form 5 所有重要历史事件与核心考点高度精炼归纳",
      "📌 提分模板：独家研发的“Sejarah 万能答题框架及 Fakta/Huraian 填空套路”",
      "📌 随书赠品：扫码直达配书的 Jack 老师专属解题视频精讲讲解库"
    ]
  },
  {
    id: "sej-live-1m",
    title: "Jack 老师 SPM 历史线上直播课 (1个月方案)",
    subject: "Sejarah",
    form: "Form 5",
    type: "Live Class",
    teacher: "Jack 老师",
    price: 89.00,
    originalPrice: 89.00,
    time: "每周固定直播授课 2 小时",
    format: "Zoom 直播授课 (含回放)",
    notes: "按月分发独家高频预测 PDF 讲义",
    badge: "Monthly",
    badgeClass: "badge-new",
    image: "images/courses/sejarah_live.jpg",
    syllabus: [
      "⚡ 核心大题：Sejarah 主观简答及 Section C 问答题“故事解题拆法”",
      "⚡ 巩固冲刺：每月高频考点针对性冲刺提分串讲",
      "⚡ 互动解答：专属班级答疑社群 + 顾问老师 1对1 答疑温习"
    ]
  },
  {
    id: "sej-live-3m",
    title: "Jack 老师 SPM 历史线上直播课 (3个月特惠方案)",
    subject: "Sejarah",
    form: "Form 5",
    type: "Live Class",
    teacher: "Jack 老师",
    price: 229.00,
    originalPrice: 267.00,
    time: "每周固定直播授课 2 小时",
    format: "Zoom 直播授课 (含回放)",
    notes: "分发全套中五精品预测考题 PDF 讲义",
    badge: "Save RM38",
    badgeClass: "badge-hot",
    image: "images/courses/sejarah_live.jpg",
    syllabus: [
      "⚡ 核心大题：Sejarah 主观简答及 Section C 问答题“故事解题拆法”",
      "⚡ 巩固冲刺：每月高频考点针对性冲刺提分串讲",
      "⚡ 互动解答：专属班级答疑社群 + 顾问老师 1对1 答疑温习"
    ]
  },
  {
    id: "sej-live-6m",
    title: "Jack 老师 SPM 历史线上直播课 (6个月半学期方案)",
    subject: "Sejarah",
    form: "Form 5",
    type: "Live Class",
    teacher: "Jack 老师",
    price: 399.00,
    originalPrice: 534.00,
    time: "每周固定直播授课 2 小时",
    format: "Zoom 直播授课 (含回放)",
    notes: "直邮赠送《历史秘笈》专属实体笔记本",
    badge: "Best Value",
    badgeClass: "badge-hot",
    image: "images/courses/sejarah_live.jpg",
    syllabus: [
      "⚡ 核心大题：Sejarah 主观简答及 Section C 问答题“故事解题拆法”",
      "⚡ 巩固冲刺：每月高频考点针对性冲刺提分串讲",
      "⚡ 互动解答：专属班级答疑社群 + 顾问老师 1对1 答疑温习"
    ]
  },
  {
    id: "sej-live-1x",
    title: "Jack 老师 SPM 历史线上直播课 (一次性买断方案)",
    subject: "Sejarah",
    form: "Form 5",
    type: "Live Class",
    teacher: "Jack 老师",
    price: 159.00,
    originalPrice: 159.00,
    time: "全套课程一次性解锁",
    format: "高清录课包 + 在线测验",
    notes: "附赠 200 道精选高频选择题通关 PDF",
    badge: "Lifetime",
    badgeClass: "badge-new",
    image: "images/courses/sejarah_live.jpg",
    syllabus: [
      "⚡ 核心大题：Sejarah 主观简答及 Section C 问答题“故事解题拆法”",
      "⚡ 巩固冲刺：每月高频考点针对性冲刺提分串讲",
      "⚡ 互动解答：专属班级答疑社群 + 顾问老师 1对1 答疑温习"
    ]
  },
  {
    id: "wanneng-vip-bundle",
    title: "VIP 全包提分通关特惠套餐",
    subject: "Sejarah",
    form: "Form 1-5 全包",
    type: "VIP Bundle",
    teacher: "Jack 老师",
    price: 259.00,
    originalPrice: 599.00,
    time: "永久有效 (全套通关)",
    format: "直播课 + 实体教材 + 专属 VIP 咨询",
    notes: "包含《历史秘笈》特惠配书 + 全套录屏/讲义库",
    badge: "VIP Save 56%",
    badgeClass: "badge-hot",
    image: "images/courses/vip_bundle.jpg",
    syllabus: [
      "⭐ 豪华权益 1：直邮赠送《Jack 老师历史秘笈》专属实体印刷笔记本一本",
      "⭐ 豪华权益 2：中五冲刺班、选择题通关课、初中/高中地基巩固课全覆盖解锁",
      "⭐ 豪华权益 3：享 1 对 1 独家班主任考前心理辅导及 Sejarah 专属高分规划"
    ]
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
function initDatabase() {
  // 仅在首次访问（不存在 jack_courses）时才植入默认数据
  if (!localStorage.getItem("jack_courses")) {
    localStorage.setItem("jack_courses", JSON.stringify(DEFAULT_COURSES));
  }

  if (!localStorage.getItem("jack_orders")) {
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
  getById: (id) => {
    const is3m = typeof id === "string" && id.endsWith("-3m");
    const baseId = is3m ? id.slice(0, -3) : id;
    const raw = (CourseDB.getAll() || []).find(c => c.id === baseId);
    if (!raw) return null;
    
    // Apply safe defaults for dynamic course details if missing
    const price1Month = typeof raw.price1Month === "number" ? raw.price1Month : (raw.price || 0);
    const originalPrice1Month = typeof raw.originalPrice1Month === "number" ? raw.originalPrice1Month : (raw.originalPrice || 0);
    const price3Month = typeof raw.price3Month === "number" ? raw.price3Month : 0;
    const originalPrice3Month = typeof raw.originalPrice3Month === "number" ? raw.originalPrice3Month : 0;

    return {
      subtitle: raw.subtitle || raw.notes || "独家提分精品课程",
      price1Month,
      originalPrice1Month,
      price3Month,
      originalPrice3Month,
      teachingMethod: raw.teachingMethod || raw.format || "Zoom 直播授课",
      duration: raw.duration || "1.5 小时",
      targetAudience: raw.targetAudience || raw.form || "Form 1 - Form 5",
      features: raw.features || (raw.notes ? [raw.notes] : [
        "配套高画质彩色 PDF 讲义与线上资料",
        "提供高清录像回放，随时随地复习",
        "专属导师答疑群，遇到不懂即时提问"
      ]),
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
          src: "images/Card_Photo/card4-students-A.png",
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
      ...raw,
      price: is3m ? price3Month : price1Month,
      originalPrice: is3m ? originalPrice3Month : originalPrice1Month,
      title: is3m ? (raw.title + " (3个月套餐)") : raw.title,
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
    // 更新所有购物车徽章数量
    document.querySelectorAll(".cart-count").forEach(badge => {
      badge.textContent = cart.length;
      badge.style.display = cart.length > 0 ? "flex" : "none";
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
  { id: "hero-9", title: "全班提分榜样！🌟", desc: "用最聪明的《合心法》复习笔记，带领全班掀起 Sejarah 冲 A 狂潮！", image: "images/Card_Photo/card4-students-A.png" },
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
    screenshot: "images/Card_Photo/card4-students-A.png"
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
