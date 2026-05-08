/**
 * i18n bundles — edit lists (highlights, courses, apps, awards) per locale as needed.
 * Scholar profile: replace SCHOLAR_ID in app.js or use full scholarUrl below.
 */
window.I18N = {
  en: {
    metaTitle: "Mohammad Khalooei — Teaching, Research & Interactive Learning",
    metaDesc:
      "Academic homepage: optimization, speech, AI, systems, Python — courses, interactive demos, publications, and collaboration.",
    nav: {
      spotlight: "Spotlight",
      teaching: "Teaching",
      apps: "Interactive labs",
      research: "Research & reading",
      awards: "Awards & recognition",
      collab: "Collaborate",
    },
    hero: {
      kicker: "Amirkabir University of Technology · Sharif University of Technology",
      title: "Mohammad Khalooei",
      subtitle:
        "Teaching and building interactive tools at the intersection of optimization, speech, intelligent systems, and programming.",
      ctaPrimary: "Explore courses",
      ctaSecondary: "Scholar profile",
    },
    spotlight: {
      title: "Recent courses & talks",
      subtitle:
        "A curated snapshot of the latest graduate/senior offerings and invited presentations — updated each term.",
      items: [
        {
          tag: "Course",
          title: "Advanced Python & scientific computing",
          desc: "Modern Python patterns, performance, and tooling for research-grade code.",
        },
        {
          tag: "Talk",
          title: "Interactive visualization of optimization landscapes",
          desc: "Live demos linking theory to geometric intuition in non-convex search.",
        },
        {
          tag: "Course",
          title: "Speech processing — representations to applications",
          desc: "From classical DSP to neural acoustic modeling and evaluation.",
        },
        {
          tag: "Course",
          title: "Principles of computer system design",
          desc: "Trade-offs across memory hierarchy, concurrency, and reliability.",
        },
      ],
    },
    teaching: {
      title: "Teaching portfolio",
      subtitle:
        "Representative graduate and undergraduate themes I deliver — syllabi and materials are shared with enrolled students.",
      courses: [
        {
          icon: "opt",
          name: "Optimization",
          topics: "Convex & non-convex analysis · algorithms · numerical aspects",
        },
        {
          icon: "speech",
          name: "Speech processing",
          topics: "Signal foundations · recognition · synthesis · evaluation",
        },
        {
          icon: "sys",
          name: "Computer systems design",
          topics: "Architecture · parallelism · correctness · measurement",
        },
        {
          icon: "ai",
          name: "Artificial intelligence",
          topics: "Search · learning · deployment considerations",
        },
        {
          icon: "py",
          name: "Advanced Python",
          topics: "Idioms · typing · packaging · performance engineering",
        },
      ],
    },
    apps: {
      title: "Interactive learning applications",
      subtitle:
        "Browser-based laboratories that make abstract methods tangible for learners worldwide.",
      items: [
        {
          title: "Visualize Optimization",
          desc: "3D cost landscapes, hill-climbing vs random search, bilingual UI — compare trajectories side by side.",
          href: "https://khalooei.github.io/visualize-optimization/",
          badge: "Live",
        },
        {
          title: "More labs (coming soon)",
          desc: "Additional interactive modules for speech and systems will be linked here as they are published.",
          href: "#apps",
          badge: "Roadmap",
        },
      ],
    },
    research: {
      title: "Research, citations & staying current",
      subtitle:
        "Follow peer-reviewed work and discover emerging ideas through curated channels — always verify claims against primary sources.",
      scholarLabel: "Google Scholar profile",
      scholarHint: "Aggregated citations and publication list.",
      scholarCta: "Open Scholar",
      arxivCta: "Latest on arXiv",
      feedLabel: "Latest from arXiv (CS / ML)",
      feedHint: "Preprints — treat as working papers until peer review.",
      alsRead: "Also read",
      alsItems: [
        { t: "IEEE Xplore", h: "https://ieeexplore.ieee.org/" },
        { t: "ACM Digital Library", h: "https://dl.acm.org/" },
        { t: "Semantic Scholar", h: "https://www.semanticscholar.org/" },
      ],
      legacyProject:
        "Historical project page (CVPR 2018): adversarially learned one-class classification — preserved for reproducibility.",
      legacyLink: "ALOCC project page",
    },
    awards: {
      title: "Awards & institutional recognition",
      subtitle:
        "Selected honors from industry and national partners — thank you to students and collaborators who made this possible.",
      items: [
        {
          org: "Apple",
          title: "Apple ecosystem & developer recognition",
          desc: "Acknowledgement through Apple’s developer and education programmes for outstanding technical work.",
        },
        {
          org: "Hamrah-e Avval (MCI)",
          title: "Telecom innovation context",
          desc: "Recognition within Iran’s leading mobile operator for applied research and product-aligned prototypes.",
        },
        {
          org: "University & national venues",
          title: "Best paper, poster, and teaching citations",
          desc: "Awards at conferences and university events — detailed CV available on request for committees.",
        },
      ],
    },
    collab: {
      title: "Scientific collaboration",
      subtitle:
        "If you are a student, researcher, or industry partner seeking joint supervision, datasets, or funded projects, reach out with a concise research abstract.",
      body:
        "Preferred contacts use verified academic mailboxes. Please include your affiliation, timeline, and expected contribution.",
      emailAut: "khalooei@aut.ac.ir",
      emailSharif: "mohammad.khalooei@sharif.edu",
      labelAut: "Amirkabir (AUT · CEIT)",
      labelSharif: "Sharif University of Technology",
      note:
        "For AUT CEIT matters use the AUT address; for Sharif-affiliated correspondence use the Sharif address — both are monitored.",
    },
    footer: {
      rights: "© Mohammad Khalooei. Academic use encouraged with attribution.",
      built: "Built as a static site for speed and accessibility.",
    },
  },

  fa: {
    metaTitle: "محمد خالوئی — آموزش، پژوهش و یادگیری تعاملی",
    metaDesc:
      "صفحهٔ علمی: بهینه‌سازی، پردازش گفتار، هوش مصنوعی، سیستم‌ها و پایتون — درس‌ها، ابزارهای تعاملی و همکاری پژوهشی.",
    nav: {
      spotlight: "ویژه",
      teaching: "درس‌ها",
      apps: "آزمایشگاه تعاملی",
      research: "پژوهش و مطالعه",
      awards: "جوایز و افتخارات",
      collab: "همکاری",
    },
    hero: {
      kicker: "دانشگاه صنعتی امیرکبیر · دانشگاه صنعتی شریف",
      title: "محمد خالوئی",
      subtitle:
        "تدریس و ساخت ابزارهای تعاملی در مرز بهینه‌سازی، پردازش گفتار، سیستم‌های هوشمند و برنامه‌نویسی.",
      ctaPrimary: "مشاهدهٔ درس‌ها",
      ctaSecondary: "پروفایل اسکولار",
    },
    spotlight: {
      title: "ارائه‌ها و درس‌های اخیر",
      subtitle:
        "نمایی از تازه‌ترین دوره‌ها و سخنرانی‌ها — هر ترم به‌روز می‌شود.",
      items: [
        {
          tag: "درس",
          title: "پایتون پیشرفته و محاسبات علمی",
          desc: "الگوهای مدرن پایتون، کارایی و ابزارها برای کد پژوهشی.",
        },
        {
          tag: "ارائه",
          title: "مصورسازی تعاملی منظر بهینه‌سازی",
          desc: "ارتباط نظریه با شهود هندسی در جستجوی غیرمحدب.",
        },
        {
          tag: "درس",
          title: "پردازش گفتار — از بازنمایی تا کاربرد",
          desc: "از پردازش کلاسیک تا مدل‌های عصبی و ارزیابی.",
        },
        {
          tag: "درس",
          title: "اصول طراحی سیستم‌های کامپیوتری",
          desc: "مصالحه در سلسله‌مراتب حافظه، هم‌زمانی و قابلیت اطمینان.",
        },
      ],
    },
    teaching: {
      title: "سبد دروس",
      subtitle:
        "موضوعات نمایندهٔ دوره‌های کارشناسی ارشد و کارشناسی — جزئیات برای دانشجویان ثبت‌نام‌شده ارائه می‌شود.",
      courses: [
        {
          icon: "opt",
          name: "بهینه‌سازی",
          topics: "تحلیل محدب و غیرمحدب · الگوریتم‌ها · جنبه‌های عددی",
        },
        {
          icon: "speech",
          name: "پردازش گفتار",
          topics: "پایه‌های سیگنال · تشخیص · ترکیب · ارزیابی",
        },
        {
          icon: "sys",
          name: "طراحی سیستم‌های کامپیوتری",
          topics: "معماری · موازی‌سازی · صحت · اندازه‌گیری",
        },
        {
          icon: "ai",
          name: "هوش مصنوعی",
          topics: "جستجو · یادگیری · ملاحظات استقرار",
        },
        {
          icon: "py",
          name: "پایتون پیشرفته",
          topics: "سبک کد · نوع‌دهی · بسته‌بندی · کارایی",
        },
      ],
    },
    apps: {
      title: "اپلیکیشن‌های آموزشی تعاملی",
      subtitle:
        "آزمایشگاه‌های مرورگر که مفاهیم انتزاعی را برای دانش‌پژوهان ملموس می‌کنند.",
      items: [
        {
          title: "Visualize Optimization",
          desc: "منظر سه‌بعدی هزینه، تپه‌نوردی در برابر جستجوی تصادفی — مقایسهٔ مسیرها.",
          href: "https://khalooei.github.io/visualize-optimization/",
          badge: "فعال",
        },
        {
          title: "آزمایشگاه‌های بیشتر (به‌زودی)",
          desc: "ماژول‌های تعاملی گفتار و سیستم‌ها پس از انتشار اینجا پیوند می‌خورند.",
          href: "#apps",
          badge: "نقشه راه",
        },
      ],
    },
    research: {
      title: "پژوهش، استناد و به‌روز ماندن",
      subtitle:
        "مقالات همتاپیشین و منابع نوظهور را دنبال کنید — همیشه با منبع اصلی سنجش کنید.",
      scholarLabel: "پروفایل گوگل اسکولار",
      scholarHint: "فهرست تجمیعی انتشارات و استنادها.",
      scholarCta: "ورود به اسکولار",
      arxivCta: "آخرین arXiv",
      feedLabel: "تازه‌ترین arXiv (CS / ML)",
      feedHint: "پیش‌چاپ — تا داوری همتا نهایی نشده است.",
      alsRead: "منابع دیگر",
      alsItems: [
        { t: "IEEE Xplore", h: "https://ieeexplore.ieee.org/" },
        { t: "ACM Digital Library", h: "https://dl.acm.org/" },
        { t: "Semantic Scholar", h: "https://www.semanticscholar.org/" },
      ],
      legacyProject:
        "صفحهٔ تاریخی پروژه (CVPR 2018): طبقه‌بندی یک‌کلاسه با یادگیری خصمانه — برای بازتولید حفظ شده است.",
      legacyLink: "صفحهٔ پروژه ALOCC",
    },
    awards: {
      title: "جوایز و همکاری‌های سازمانی",
      subtitle:
        "گزیده‌ای از افتخارات صنعتی و ملی — سپاس از دانشجویان و همکاران.",
      items: [
        {
          org: "اپل",
          title: "برنامه‌های توسعه‌دهنده و آموزش اپل",
          desc: "قدردانی در چارچوب برنامه‌های آموزشی و اکوسیستم توسعهٔ اپل.",
        },
        {
          org: "همراه اول",
          title: "نوآوری در بستر مخابرات",
          desc: "شناسایی در اپراتور پیشرو برای پژوهش کاربردی و نمونه‌های نزدیک به محصول.",
        },
        {
          org: "دانشگاه و رویدادهای ملی",
          title: "بهترین مقاله، پوستر و ارجاعات آموزشی",
          desc: "جوایز همایش‌ها و دانشگاه — رزومهٔ تفصیلی برای کمیته‌ها در دسترس است.",
        },
      ],
    },
    collab: {
      title: "همکاری علمی",
      subtitle:
        "برای راهنمایی مشترک، مجموعه‌داده یا پروژهٔ دارای بودجه، با چکیدهٔ کوتاه پژوهشی تماس بگیرید.",
      body:
        "ترجیحاً از ایمیل دانشگاهی معتبر استفاده کنید — وابستگی، زمان‌بندی و نقش پیشنهادی را ذکر کنید.",
      emailAut: "khalooei@aut.ac.ir",
      emailSharif: "mohammad.khalooei@sharif.edu",
      labelAut: "امیرکبیر (AUT)",
      labelSharif: "دانشگاه صنعتی شریف",
      note:
        "برای امور دانشکدهٔ مهندسی کامپیوتر امیرکبیر از آدرس AUT؛ برای مکاتبات وابسته به شریف از آدرس شریف — هر دو بررسی می‌شوند.",
    },
    footer: {
      rights: "© محمد خالوئی — استفادهٔ علمی با ذکر منبع.",
      built: "وب‌سایت ایستا برای سرعت و دسترس‌پذیری.",
    },
  },

  ar: {
    metaTitle: "محمد خلوئي — تدريس، بحث وتطبيقات تفاعلية",
    metaDesc:
      "التحسين، معالجة الكلام، الذكاء الاصطناعي، الأنظمة وبايثون — مقررات، معامل تفاعلية، وقراءة علمية.",
    nav: {
      spotlight: "مميز",
      teaching: "التدريس",
      apps: "مختبرات تفاعلية",
      research: "البحث والقراءة",
      awards: "الجوائز",
      collab: "تعاون",
    },
    hero: {
      kicker: "جامعة أميركبير للتكنولوجيا · جامعة شريف للتكنولوجيا",
      title: "محمد خلوئي",
      subtitle:
        "تدريس وبناء أدوات تفاعلية في تقاطع التحسين ومعالجة الكلام والأنظمة الذكية والبرمجة.",
      ctaPrimary: "استكشف المقررات",
      ctaSecondary: "ملف Scholar",
    },
    spotlight: {
      title: "مقررات ومحاضرات حديثة",
      subtitle:
        "لمحة عن أحدث العروض والدورات — يُحدَّث كل فصل.",
      items: [
        {
          tag: "مقرر",
          title: "بايثون المتقدم والحوسبة العلمية",
          desc: "أنماط بايثون الحديثة والأداء والأدوات للبحث.",
        },
        {
          tag: "محاضرة",
          title: "تصور تفاعلي لمناظر التحسين",
          desc: "ربط النظرية بالحدس الهندسي في البحث غير المحدب.",
        },
        {
          tag: "مقرر",
          title: "معالجة الكلام — من التمثيل إلى التطبيق",
          desc: "من المعالجة التقليدية إلى النماذج العصبية والتقييم.",
        },
        {
          tag: "مقرر",
          title: "مبادئ تصميم أنظمة الحاسوب",
          desc: "مفاضلات التسلسل الهرمي للذاكرة والتزامن والموثوقية.",
        },
      ],
    },
    teaching: {
      title: "محفظة التدريس",
      subtitle:
        "موضوعات تمثيلية للمرحلتين الجامعيتين — التفاصيل للطلاب المسجلين.",
      courses: [
        {
          icon: "opt",
          name: "التحسين",
          topics: "تحليل محدب وغير محدب · خوارزميات · جوانب عددية",
        },
        {
          icon: "speech",
          name: "معالجة الكلام",
          topics: "أساس الإشارة · التعرف · التوليف · التقييم",
        },
        {
          icon: "sys",
          name: "تصميم أنظمة الحاسوب",
          topics: "معمارية · توازٍ · صحة · قياس",
        },
        {
          icon: "ai",
          name: "الذكاء الاصطناعي",
          topics: "بحث · تعلم · اعتبارات النشر",
        },
        {
          icon: "py",
          name: "بايثون المتقدم",
          topics: "أسلوب · أنواع · حزم · أداء",
        },
      ],
    },
    apps: {
      title: "تطبيقات تعليمية تفاعلية",
      subtitle:
        "مختبرات متصفح تجعل المفاهيم المجردة ملموسة للمتعلمين.",
      items: [
        {
          title: "Visualize Optimization",
          desc: "مناظر ثلاثية الأبعاد للتكلفة، تسلق التلال مقابل البحث العشوائي.",
          href: "https://khalooei.github.io/visualize-optimization/",
          badge: "مباشر",
        },
        {
          title: "المزيد قريبًا",
          desc: "وحدات تفاعلية إضافية للكلام والأنظمة ستُربط عند النشر.",
          href: "#apps",
          badge: "خارطة طريق",
        },
      ],
    },
    research: {
      title: "البحث والاستشهادات والاطلاع",
      subtitle:
        "تابع الأعمال المحكمة والأفكار الناشئة — تحقق دائمًا من المصادر الأولية.",
      scholarLabel: "ملف Google Scholar",
      scholarHint: "قائمة مجمعة للمنشورات والاستشهادات.",
      scholarCta: "فتح Scholar",
      arxivCta: "أحدث arXiv",
      feedLabel: "أحدث arXiv (CS / ML)",
      feedHint: "مسودات ما قبل الطباعة — إلى أن تكتمل المراجعة الأقران.",
      alsRead: "اطلع أيضًا",
      alsItems: [
        { t: "IEEE Xplore", h: "https://ieeexplore.ieee.org/" },
        { t: "ACM Digital Library", h: "https://dl.acm.org/" },
        { t: "Semantic Scholar", h: "https://www.semanticscholar.org/" },
      ],
      legacyProject:
        "صفحة مشروع تاريخية (CVPR 2018): تصنيف أحادي الصنف بتعلم تنافسي — محفوظة لإعادة الإنتاج.",
      legacyLink: "صفحة مشروع ALOCC",
    },
    awards: {
      title: "الجوائز والتقدير المؤسسي",
      subtitle:
        "تكريمات مختارة من الصناعة والشركاء الوطنيين — شكرًا للطلاب والمتعاونين.",
      items: [
        {
          org: "Apple",
          title: "برامج المطورين والتعليم",
          desc: "تقدير ضمن برامج أبل التعليمية والتقنية.",
        },
        {
          org: "همراه أول",
          title: "سياق ابتكار الاتصالات",
          desc: "تقدير ضمن مشغل الرائد للبحث التطبيقي والنماذج القريبة من المنتج.",
        },
        {
          org: "الجامعة والفعاليات الوطنية",
          title: "أفضل ورقة وملصق وإشارات تدريسية",
          desc: "جوائز المؤتمرات والفعاليات — السيرة التفصيلية متاحة عند الطلب.",
        },
      ],
    },
    collab: {
      title: "التعاون العلمي",
      subtitle:
        "للإشراف المشترك أو مجموعات البيانات أو المشاريع الممولة، تواصل مع ملخص بحثي موجز.",
      body:
        "يُفضَّل البريد الأكاديمي الموثوق — أذكر الانتماء والجدول الزمني والمساهمة المتوقعة.",
      emailAut: "khalooei@aut.ac.ir",
      emailSharif: "mohammad.khalooei@sharif.edu",
      labelAut: "أميركبير (AUT)",
      labelSharif: "جامعة شريف للتكنولوجيا",
      note:
        "لشؤون AUT استخدم بريد AUT؛ لمراسلات شريف استخدم بريد شريف — يُراقَبان معًا.",
    },
    footer: {
      rights: "© محمد خلوئي — استخدام أكاديمي مع الإسناد.",
      built: "موقع ثابت للسرعة وإمكانية الوصول.",
    },
  },

  zh: {
    metaTitle: "Mohammad Khalooei — 教学、科研与交互式学习",
    metaDesc:
      "学术主页：优化、语音、人工智能、系统与 Python — 课程、交互实验、文献与合作。",
    nav: {
      spotlight: "焦点",
      teaching: "课程",
      apps: "交互实验",
      research: "研究与阅读",
      awards: "荣誉",
      collab: "合作",
    },
    hero: {
      kicker: "阿米尔卡比尔理工大学 · 谢里夫理工大学",
      title: "Mohammad Khalooei",
      subtitle:
        "在优化、语音、智能系统与编程交叉领域从事教学与交互式工具开发。",
      ctaPrimary: "浏览课程",
      ctaSecondary: "Scholar 主页",
    },
    spotlight: {
      title: "近期课程与报告",
      subtitle: "最新研究生与本科高年级课程、邀请报告的精选快照 — 每学期更新。",
      items: [
        {
          tag: "课程",
          title: "高级 Python 与科学计算",
          desc: "面向科研代码的现代 Python 模式、性能与工具链。",
        },
        {
          tag: "报告",
          title: "优化景观的可视化演示",
          desc: "将理论与非凸搜索中的几何直觉联系起来。",
        },
        {
          tag: "课程",
          title: "语音处理 — 从表示到应用",
          desc: "从经典信号处理到神经声学建模与评测。",
        },
        {
          tag: "课程",
          title: "计算机系统设计原理",
          desc: "存储层次、并发与可靠性之间的权衡。",
        },
      ],
    },
    teaching: {
      title: "教学目录",
      subtitle: "代表性本科与研究生主题 — 详细资料向选课学生提供。",
      courses: [
        {
          icon: "opt",
          name: "优化",
          topics: "凸与非凸分析 · 算法 · 数值方面",
        },
        {
          icon: "speech",
          name: "语音处理",
          topics: "信号基础 · 识别 · 合成 · 评测",
        },
        {
          icon: "sys",
          name: "计算机系统设计",
          topics: "体系结构 · 并行 · 正确性 · 测量",
        },
        {
          icon: "ai",
          name: "人工智能",
          topics: "搜索 · 学习 · 部署考量",
        },
        {
          icon: "py",
          name: "高级 Python",
          topics: "惯用法 · 类型 · 打包 · 性能工程",
        },
      ],
    },
    apps: {
      title: "交互式学习应用",
      subtitle: "基于浏览器的实验环境，让抽象方法对全球学习者可感知。",
      items: [
        {
          title: "Visualize Optimization",
          desc: "三维代价曲面、爬山与随机搜索对比 — 并排比较轨迹。",
          href: "https://khalooei.github.io/visualize-optimization/",
          badge: "在线",
        },
        {
          title: "更多实验（即将推出）",
          desc: "语音与系统相关的交互模块发布后将在此链接。",
          href: "#apps",
          badge: "路线图",
        },
      ],
    },
    research: {
      title: "研究、引用与前沿阅读",
      subtitle:
        "关注同行评议成果并通过精选渠道发现新想法 — 务必对照原始文献核实。",
      scholarLabel: "Google Scholar 主页",
      scholarHint: "汇总的发表论文与引用列表。",
      scholarCta: "打开 Scholar",
      arxivCta: "浏览 arXiv",
      feedLabel: "arXiv 最新（CS / ML）",
      feedHint: "预印本 — 在正式同行评议前应谨慎引用。",
      alsRead: "另请参阅",
      alsItems: [
        { t: "IEEE Xplore", h: "https://ieeexplore.ieee.org/" },
        { t: "ACM Digital Library", h: "https://dl.acm.org/" },
        { t: "Semantic Scholar", h: "https://www.semanticscholar.org/" },
      ],
      legacyProject:
        "历史项目页（CVPR 2018）：对抗学习的一类分类 — 为可复现性保留。",
      legacyLink: "ALOCC 项目页",
    },
    awards: {
      title: "奖项与机构认可",
      subtitle: "来自产业界与国家合作伙伴的精选荣誉 — 感谢学生与合作者。",
      items: [
        {
          org: "Apple",
          title: "Apple 开发者与教育计划",
          desc: "通过 Apple 开发者与教育项目获得的技术工作认可。",
        },
        {
          org: "MCI（Hamrah-e Avval）",
          title: "电信创新场景",
          desc: "伊朗领先移动运营商对应用研究与接近产品的原型的认可。",
        },
        {
          org: "高校与全国会议",
          title: "最佳论文、海报与教学相关荣誉",
          desc: "会议与校级奖项 — 可向委员会提供详细简历。",
        },
      ],
    },
    collab: {
      title: "科研合作",
      subtitle:
        "若您是学生、研究者或产业伙伴，寻求联合指导、数据集或资助项目，请附简明研究摘要联系。",
      body:
        "建议使用经认证的学术邮箱，并写明单位、时间线与预期贡献。",
      emailAut: "khalooei@aut.ac.ir",
      emailSharif: "mohammad.khalooei@sharif.edu",
      labelAut: "阿米尔卡比尔理工大学（AUT）",
      labelSharif: "谢里夫理工大学",
      note:
        "AUT 计算机工程系事务请使用 AUT 邮箱；与谢里夫相关往来请使用谢里夫邮箱 — 两者都会查看。",
    },
    footer: {
      rights: "© Mohammad Khalooei — 欢迎注明出处的学术使用。",
      built: "静态站点，追求速度与可访问性。",
    },
  },
};
