(function () {
  "use strict";

  var TRACKS = {
    nlp: {
      en: {
        pageCurrent: "Academy / NLP",
        trackTitle: "Natural Language Processing",
        trackDesc:
          "Text classification, BERT-style encoders, language modeling, encoder-decoder models, and open/API LLMs — structured for olympiad-style practice.",
        topics: [
          "Text Classification (Practice)",
          "Pre-trained Text Encoders (BERT family)",
          "Language Modeling",
          "Encoder-Decoder Models (MT, Vision-Language)",
          "Pre-trained Language Models (open-source & API)",
        ],
        backHub: "← Back to Academy",
      },
      fa: {
        pageCurrent: "آکادمی / پردازش زبان طبیعی",
        trackTitle: "پردازش زبان طبیعی (NLP)",
        trackDesc:
          "طبقه‌بندی متن، رمزگذارهای از پیش‌آموزش‌دیده، مدل‌سازی زبان، مدل‌های Encoder-Decoder و LLMهای متن‌باز/API — با تمرکز تمرین المپیاد.",
        topics: [
          "طبقه‌بندی متن (Practice)",
          "رمزگذارهای متنی از پیش‌آموزش‌دیده (BERT و خانواده)",
          "مدل‌سازی زبان",
          "مدل‌های Encoder-Decoder (ترجمه، Vision-Language)",
          "مدل‌های زبانی از پیش‌آموزش‌دیده (متن‌باز و API)",
        ],
        backHub: "← بازگشت به آکادمی",
      },
      ar: {
        pageCurrent: "الأكاديمية / معالجة اللغة",
        trackTitle: "معالجة اللغة الطبيعية",
        trackDesc: "مسار منظم لتصنيف النص ونماذج BERT والنمذجة اللغوية ونماذج Encoder-Decoder وLLM.",
        topics: ["تصنيف النص", "مُرمّزات BERT", "نمذجة اللغة", "Encoder-Decoder", "نماذج لغوية مسبقة التدريب"],
        backHub: "← العودة إلى الأكاديمية",
      },
      zh: {
        pageCurrent: "学院 / 自然语言处理",
        trackTitle: "自然语言处理",
        trackDesc: "文本分类、BERT 类编码器、语言建模、编解码模型与开源/API 大模型。",
        topics: ["文本分类", "预训练文本编码器", "语言建模", "编解码模型", "预训练语言模型"],
        backHub: "← 返回学院",
      },
    },
    mlops: {
      en: {
        pageCurrent: "Academy / MLOps",
        trackTitle: "MLOps",
        trackDesc: "Experiment tracking, model registry, CI/CD for ML, monitoring, and safe rollout pipelines.",
        topics: ["Experiment tracking", "Model registry & versioning", "Training/serving pipelines", "Monitoring & drift", "Rollback and governance"],
        backHub: "← Back to Academy",
      },
      fa: {
        pageCurrent: "آکادمی / MLOps",
        trackTitle: "MLOps",
        trackDesc: "ردیابی آزمایش، ثبت مدل، CI/CD برای ML، پایش و استقرار ایمن.",
        topics: ["ردیابی آزمایش", "ثبت و نسخه‌بندی مدل", "خط لوله آموزش/سرویس", "پایش و drift", "بازگشت و حاکمیت"],
        backHub: "← بازگشت به آکادمی",
      },
      ar: {
        pageCurrent: "الأكاديمية / MLOps",
        trackTitle: "MLOps",
        trackDesc: "مسار تشغيل نماذج التعلم الآلي في الإنتاج.",
        topics: ["تتبع التجارب", "سجل النماذج", "خطوط التدريب/الخدمة", "المراقبة", "الحوكمة"],
        backHub: "← العودة إلى الأكاديمية",
      },
      zh: {
        pageCurrent: "学院 / MLOps",
        trackTitle: "MLOps",
        trackDesc: "实验追踪、模型注册、ML CI/CD、监控与安全发布。",
        topics: ["实验追踪", "模型注册", "训练/服务流水线", "监控", "治理"],
        backHub: "← 返回学院",
      },
    },
    vision: {
      en: {
        pageCurrent: "Academy / Computer Vision",
        trackTitle: "Computer Vision",
        trackDesc: "From conv layers to detection, segmentation, CLIP-style vision-language, and diffusion.",
        topics: [
          "Convolutional layers",
          "Image classification & augmentation",
          "Object detection (YOLO, SSD, DETR)",
          "Segmentation (U-Net)",
          "Vision encoders, GANs, self-supervised vision",
          "CLIP-style encoders & diffusion",
        ],
        backHub: "← Back to Academy",
      },
      fa: {
        pageCurrent: "آکادمی / بینایی ماشین",
        trackTitle: "پردازش تصویر (Computer Vision)",
        trackDesc: "از لایه‌های کانولوشن تا تشخیص، قطعه‌بندی، CLIP و diffusion.",
        topics: [
          "لایه‌های کانولوشن",
          "طبقه‌بندی و augmentation",
          "تشخیص شیء (YOLO, SSD, DETR)",
          "قطعه‌بندی (U-Net)",
          "رمزگذارهای بینایی، GAN، خودنظارتی",
          "CLIP و diffusion",
        ],
        backHub: "← بازگشت به آکادمی",
      },
      ar: { pageCurrent: "الأكاديمية / الرؤية", trackTitle: "الرؤية الحاسوبية", trackDesc: "مسار شامل للرؤية الحديثة.", topics: ["طبقات الالتفاف", "التصنيف", "الكشف", "التقسيم", "CLIP", "الانتشار"], backHub: "← العودة" },
      zh: { pageCurrent: "学院 / 计算机视觉", trackTitle: "计算机视觉", trackDesc: "卷积、检测、分割、CLIP 与扩散模型。", topics: ["卷积", "分类", "检测", "分割", "CLIP", "扩散"], backHub: "← 返回学院" },
    },
    nn: {
      en: {
        pageCurrent: "Academy / Neural Networks & DL",
        trackTitle: "Neural Networks & Deep Learning",
        trackDesc: "Core deep learning foundations used across audio, vision, and language.",
        topics: [
          "Perceptron, gradient descent, backpropagation",
          "Activations & loss functions",
          "MLP, embeddings, pooling, attention, transformers",
          "Autoencoders, Adam/AdamW, regularization",
          "Batch norm, initialization, finetuning (full & PEFT)",
        ],
        backHub: "← Back to Academy",
      },
      fa: {
        pageCurrent: "آکادمی / شبکه عصبی و یادگیری عمیق",
        trackTitle: "شبکه‌های عصبی و یادگیری عمیق",
        trackDesc: "مبانی مشترک یادگیری عمیق در صوت، تصویر و زبان.",
        topics: [
          "پرسپترون، گرادیان، backpropagation",
          "توابع فعال‌ساز و loss",
          "MLP، embedding، pooling، attention، transformer",
          "Autoencoder، Adam، regularization",
          "Batch norm، مقداردهی اولیه، finetuning",
        ],
        backHub: "← بازگشت به آکادمی",
      },
      ar: { pageCurrent: "الأكاديمية / الشبكات العصبية", trackTitle: "الشبكات العصبية والتعلم العميق", trackDesc: "أساسيات التعلم العميق.", topics: ["الخلفية", "الدوال", "MLP", "الانتباه", "الضبط"], backHub: "← العودة" },
      zh: { pageCurrent: "学院 / 神经网络", trackTitle: "神经网络与深度学习", trackDesc: "跨模态深度学习基础。", topics: ["反向传播", "损失函数", "MLP", "注意力", "微调"], backHub: "← 返回" },
    },
    gan: {
      en: {
        pageCurrent: "Academy / GANs",
        trackTitle: "Generative Adversarial Networks",
        trackDesc: "Dedicated path for GAN theory, training dynamics, architectures, and applications.",
        topics: ["Generator/discriminator objectives", "Mode collapse & stabilization", "DCGAN, conditional GAN", "CycleGAN & style transfer", "Evaluation (FID, IS) and modern hybrids"],
        backHub: "← Back to Academy",
      },
      fa: {
        pageCurrent: "آکادمی / GAN",
        trackTitle: "شبکه‌های متخاصم تولیدی (GAN)",
        trackDesc: "مسیر اختصاصی تئوری GAN، پایداری آموزش، معماری‌ها و کاربردها.",
        topics: ["تابع هدف مولد/تمایزدهنده", "فروپاشی حالت و پایداری", "DCGAN و cGAN", "CycleGAN", "ارزیابی FID و ترکیب‌های مدرن"],
        backHub: "← بازگشت به آکادمی",
      },
      ar: { pageCurrent: "الأكاديمية / GAN", trackTitle: "الشبكات التوليدية التنافسية", trackDesc: "مسار GAN.", topics: ["الهدف", "الاستقرار", "DCGAN", "CycleGAN", "FID"], backHub: "← العودة" },
      zh: { pageCurrent: "学院 / GAN", trackTitle: "生成对抗网络", trackDesc: "GAN 理论与应用路径。", topics: ["目标函数", "模式崩溃", "DCGAN", "CycleGAN", "FID"], backHub: "← 返回" },
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    var track = document.body.getAttribute("data-academy-track");
    if (!track || !TRACKS[track]) return;
    window.ACADEMY_I18N = {
      en: Object.assign({ globalHighlights: "Highlights", globalResearch: "Research", globalTeaching: "Teaching", globalAcademy: "Academy", comingSoon: "Coming soon" }, TRACKS[track].en),
      fa: Object.assign({ globalHighlights: "برجسته‌ها", globalResearch: "پژوهش", globalTeaching: "تدریس", globalAcademy: "آکادمی", comingSoon: "به‌زودی" }, TRACKS[track].fa),
      ar: Object.assign({ globalHighlights: "الملخص", globalResearch: "البحث", globalTeaching: "التدريس", globalAcademy: "الأكاديمية", comingSoon: "قريبًا" }, TRACKS[track].ar),
      zh: Object.assign({ globalHighlights: "亮点", globalResearch: "研究", globalTeaching: "教学", globalAcademy: "学院", comingSoon: "即将推出" }, TRACKS[track].zh),
    };

    var listEl = document.querySelector("[data-i18n-list='topics']");
    if (!listEl) return;

    function renderList(lang) {
      var payload = TRACKS[track][lang] || TRACKS[track].en;
      listEl.innerHTML = "";
      (payload.topics || []).forEach(function (item) {
        var li = document.createElement("li");
        li.textContent = item;
        listEl.appendChild(li);
      });
    }

    var cookie = ("; " + document.cookie).split("; academy_lang=");
    var lang = cookie.length === 2 ? cookie.pop().split(";").shift() : "en";
    if (!TRACKS[track][lang]) lang = "en";
    renderList(lang);

    document.addEventListener("change", function (e) {
      if (e.target && e.target.id === "academy-lang") renderList(e.target.value);
    });
  });
})();
