(function () {
  "use strict";

  var LANG_COOKIE_KEY = "academy_lang";

  function getCookie(name) {
    var v = "; " + document.cookie;
    var parts = v.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
    return "";
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + value + "; expires=" + d.toUTCString() + "; path=/; SameSite=Lax";
  }

  function getInitialLang() {
    var cookieLang = getCookie(LANG_COOKIE_KEY);
    if (cookieLang && DATA[cookieLang]) return cookieLang;
    return "en";
  }

  var LINKS = {
    colab: "#",
    simOpt: "https://khalooei.github.io/visualize-optimization/",
    simLinear: "#",
    simGA: "https://khalooei.github.io/visualize_genetic_algorithm/",
  };

  var DATA = {
    en: {
      dir: "ltr",
      title: "Speech Processing Academy",
      back: "Back",
      kicker: "Structured • Scientific • Practical",
      heroTitle: "A complete path for modern speech processing",
      heroDesc:
        "This page teaches speech processing from fundamentals to modern systems with clear hierarchy, practical simulators, and Colab-ready workflows.",
      startPath: "Start learning path",
      openSimLab: "Open simulator lab",
      footerPrepared: "Prepared by Mohammad Khalooei",
      footerContact: "Email",
      crumbHome: "Home",
      crumbAcademy: "Academy",
      globalHighlights: "Highlights",
      globalResearch: "Research",
      globalTeaching: "Teaching",
      globalAcademy: "Academy",
      globalCurrent: "Academy / Speech Processing (Intro)",
      pageLevel: "Introductory track",
      trackIntro: "Intro",
      trackAdvanced: "Advanced",
      treeTitle: "Learning tree",
      overviewTitle: "Course map (all sections)",
      floatMap: "Map",
      floatSections: "Sections",
      floatLabs: "Sim Labs",
      linkAdvLabs: "Advanced track & foundation models",
      linkTasks: "Speech tasks demos",
      linkTrustLabs: "Trustworthy ML labs",
      linkDocker: "Docker commands",
      linkGit: "Git commands",
      moduleTag: "Module",
      resourcesTitle: "Hands-on resources",
      colabCta: "Open Colab",
      simCta: "Open Simulator",
      simLabTitle: "Interactive concept simulators",
      simLabDesc:
        "These simulators are not decorative animations. Change parameters and directly observe what changes in the signal and why.",
      winSimTitle: "Windowing simulator",
      samplingSimTitle: "Sampling and aliasing simulator",
      ctrlWindowType: "Window type",
      ctrlWindowSize: "Window size",
      ctrlWindowShift: "Window shift",
      ctrlSignalFreq: "Signal frequency",
      ctrlSampleRate: "Sampling rate",
      mfccSimTitle: "MFCC filterbank simulator",
      vadSimTitle: "VAD threshold simulator",
      spkSimTitle: "Speaker distance simulator",
      flagshipTitle: "Flagship simulator: Spectrogram Studio",
      flagshipDesc:
        "Professional-level interactive STFT laboratory: compare scenarios, tune FFT/overlap/noise, inspect spectrogram evolution, and examine frame-wise spectrum with a movable playhead.",
      ctrlScenario: "Signal scenario",
      ctrlNfft: "FFT size",
      ctrlSpecScale: "Spectrogram scale",
      ctrlOverlap: "Frame overlap",
      ctrlSpecNoise: "Noise amount",
      ctrlPlayhead: "Playhead frame",
      fullScreenBtn: "Fullscreen",
      fftStftTitle: "FFT vs STFT comparator",
      ctrlToneMix: "Tone mix level",
      ctrlStftFrame: "STFT frame size",
      fftLabel: "Global FFT magnitude",
      stftLabel: "Local STFT slice variability",
      dtwTitle: "DTW alignment simulator",
      ctrlDtwStretch: "Stretch mismatch",
      ctrlDtwNoise: "Sequence noise",
      timeDomainLabel: "Time domain waveform",
      timeFreqLabel: "Time-Frequency representation (Spectrogram)",
      freqDomainLabel: "Frequency-domain slice for selected frame",
      ctrlMelBands: "Mel bands",
      ctrlPreEmphasis: "Pre-emphasis",
      ctrlNoiseLevel: "Noise level",
      ctrlVadThreshold: "VAD threshold",
      ctrlClusterGap: "Cluster gap",
      ctrlVerifyThreshold: "Verification threshold",
      mfccNote: "Higher mel band count improves resolution but increases feature dimensionality.",
      aliasSafe: "No aliasing: sampling rate is above Nyquist.",
      aliasRisk: "Aliasing risk: sampling rate is too low for this signal frequency.",
      vadSpeech: "Frames classified as speech",
      vadSilence: "Frames classified as silence",
      spkSame: "Likely same-speaker (distance below threshold).",
      spkDiff: "Likely different-speaker (distance above threshold).",
      specSummary: "Frames: {frames} | Hop: {hop} samples | Dominant band index: {band}",
      relatedTitle: "Related sections",
      openLab: "Open simulator",
      sections: [
        {
          id: "sec-foundations",
          title: "1) Foundations and signal representations",
          desc: "Understand waveforms, sampling, framing, STFT, spectrograms, energy, and basic time-frequency analysis. This is where intuition starts.",
          points: [
            "Waveform and sampling",
            "Windowing and STFT",
            "Spectrogram interpretation",
            "Energy and loudness",
          ],
          subsections: [
            {
              id: "sec-foundations-wave",
              title: "Waveform, sampling, and aliasing",
              desc: "How continuous acoustic signals become discrete-time representations, and why Nyquist conditions matter.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-foundations-stft",
              title: "Framing, windowing, and STFT",
              desc: "Short-time analysis, time-frequency tradeoff, and practical window choices for speech.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
            {
              id: "sec-foundations-spec",
              title: "Spectrogram reading and interpretation",
              desc: "Formants, harmonics, voicing patterns, and transient events in real signals.",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
          ],
        },
        {
          id: "sec-transforms",
          title: "2) Fourier analysis: FFT, STFT, and spectral leakage",
          desc: "This chapter is dedicated to transform-domain thinking: DFT intuition, efficient FFT computation, STFT framing effects, and leakage/window tradeoffs.",
          points: ["DFT intuition and periodic extension", "FFT computational structure", "STFT parameter effects", "Spectral leakage and window design"],
          subsections: [
            {
              id: "sec-transforms-fft",
              title: "FFT mechanics and frequency-bin interpretation",
              desc: "How bin spacing, resolution, and zero-padding affect the observed spectrum.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
            {
              id: "sec-transforms-stft",
              title: "STFT as a sliding local Fourier transform",
              desc: "Frame length, overlap, and window function jointly control time-vs-frequency readability.",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
          ],
        },
        {
          id: "sec-features",
          title: "3) Feature extraction for speech",
          desc: "Build robust front-ends using MFCC, pitch/F0, zero-crossing rate, delta features, and cepstral concepts.",
          points: [
            "MFCC pipeline",
            "F0 and voicing cues",
            "Cepstrum intuition",
            "Dynamic features (delta, delta-delta)",
          ],
          subsections: [
            {
              id: "sec-features-mfcc",
              title: "MFCC end-to-end pipeline",
              desc: "Pre-emphasis, framing, mel filterbanks, log compression, and DCT as a compact descriptor.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-features-pitch",
              title: "Pitch (F0), jitter, shimmer, and voicing",
              desc: "Temporal periodicity cues and their importance in recognition and clinical analysis.",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
          ],
        },
        {
          id: "sec-modeling",
          title: "4) Modeling tools and learning paradigms",
          desc: "Move from classical statistical models to neural approaches and self-supervised learning.",
          points: [
            "Linear and subspace models",
            "GMM and vector quantization",
            "Neural acoustic models",
            "Self-supervised representations",
          ],
          subsections: [
            {
              id: "sec-modeling-classic",
              title: "Classical models: linear, subspace, and GMM",
              desc: "Probabilistic foundations for robust baselines and interpretable speech systems.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-modeling-neural",
              title: "Neural acoustic modeling",
              desc: "From frame-level DNNs to sequence models and modern representation learning.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
          ],
        },
        {
          id: "sec-tasks",
          title: "5) Core speech tasks",
          desc: "Cover VAD, ASR, speaker recognition, diarization, and speech synthesis with practical scenarios.",
          points: [
            "Voice activity detection",
            "Automatic speech recognition",
            "Speaker verification/identification",
            "Speech synthesis basics",
          ],
          subsections: [
            {
              id: "sec-tasks-vad",
              title: "Voice activity detection (VAD)",
              desc: "Latency-accuracy tradeoffs and robust operation under noisy environments.",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
            {
              id: "sec-tasks-asr",
              title: "ASR pipeline and error sources",
              desc: "Acoustic model, language model, decoding, and word error behavior.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
            {
              id: "sec-tasks-speaker",
              title: "Speaker recognition and diarization",
              desc: "Identity embeddings, verification thresholds, and multi-speaker segmentation.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
          ],
        },
        {
          id: "sec-quality",
          title: "6) Evaluation and reliability",
          desc: "Learn subjective and objective evaluation, error analysis, and robust experimentation.",
          points: ["Subjective listening tests", "Objective metrics", "Dataset splits and protocol", "Result interpretation"],
          subsections: [
            {
              id: "sec-quality-metrics",
              title: "Objective metrics and protocol design",
              desc: "How to design fair comparisons and avoid metric misuse in speech studies.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-quality-analysis",
              title: "Error analysis and reliability reporting",
              desc: "Confidence intervals, ablation studies, and reproducible result reporting.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
          ],
        },
        {
          id: "sec-simulators",
          title: "7) Simulators and Colab execution",
          desc: "Our competitive advantage: diverse interactive simulators and runnable notebooks. Every topic includes at least one Colab-ready practical lab.",
          points: ["Interactive visual simulators", "Reproducible Colab notebooks", "Lab-style assignments", "Experiment templates"],
          subsections: [
            {
              id: "sec-simulators-catalog",
              title: "Simulator catalog and learning flow",
              desc: "Each chapter is paired with targeted simulator exercises and expected learning outcomes.",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
            {
              id: "sec-simulators-colab",
              title: "Colab-first practical labs",
              desc: "Zero-setup notebooks for feature extraction, modeling, evaluation, and reporting.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
          ],
        },
      ],
    },
    fa: {
      dir: "rtl",
      title: "آکادمی پیشرفته پردازش صوت",
      back: "بازگشت",
      kicker: "ساختاریافته • علمی • کاربردی",
      heroTitle: "مسیر تخصصی و پروژه‌محور پردازش صوت مدرن",
      heroDesc:
        "این صفحه، پردازش صوت را از مبانی تا سامانه‌های پیشرفته با سلسله‌مراتب آموزشی روشن، شبیه‌سازهای متنوع و اجرای مستقیم روی کولب آموزش می‌دهد.",
      startPath: "شروع مسیر یادگیری",
      openSimLab: "ورود به آزمایشگاه شبیه‌ساز",
      footerPrepared: "تهیه‌شده توسط محمد خالوئی",
      footerContact: "ایمیل",
      crumbHome: "خانه",
      crumbAcademy: "آکادمی",
      globalHighlights: "برجسته‌ها",
      globalResearch: "پژوهش",
      globalTeaching: "تدریس",
      globalAcademy: "آکادمی",
      globalCurrent: "آکادمی / پردازش صوت (مقدماتی)",
      pageLevel: "مسیر مقدماتی",
      trackIntro: "مقدماتی",
      trackAdvanced: "پیشرفته",
      treeTitle: "درخت یادگیری",
      overviewTitle: "نقشه درس (همه سرفصل‌ها)",
      floatMap: "نقشه",
      floatSections: "سرفصل‌ها",
      floatLabs: "آزمایشگاه",
      linkAdvLabs: "مسیر پیشرفته و Foundation Models",
      linkTasks: "دموهای تسک صوت",
      linkTrustLabs: "آزمایشگاه ML قابل‌اعتماد",
      linkDocker: "دستورات Docker",
      linkGit: "دستورات Git",
      moduleTag: "ماژول",
      resourcesTitle: "منابع عملی",
      colabCta: "اجرای Colab",
      simCta: "اجرای شبیه‌ساز",
      simLabTitle: "سیمولاتورهای تعاملی مفهومی",
      simLabDesc:
        "این‌ها انیمیشن تزئینی نیستند. پارامترها را تغییر دهید و مستقیم ببینید چرا و چگونه سیگنال تغییر می‌کند.",
      winSimTitle: "شبیه‌ساز Windowing",
      samplingSimTitle: "شبیه‌ساز Sampling و Aliasing",
      ctrlWindowType: "نوع پنجره",
      ctrlWindowSize: "اندازه پنجره",
      ctrlWindowShift: "شیفت پنجره",
      ctrlSignalFreq: "فرکانس سیگنال",
      ctrlSampleRate: "نرخ نمونه‌برداری",
      mfccSimTitle: "شبیه‌ساز MFCC Filterbank",
      vadSimTitle: "شبیه‌ساز آستانه VAD",
      spkSimTitle: "شبیه‌ساز فاصله گوینده",
      flagshipTitle: "شبیه‌ساز پرچمدار: Spectrogram Studio",
      flagshipDesc:
        "لابراتوار تعاملی STFT در سطح حرفه‌ای: سناریوها را مقایسه کنید، FFT/overlap/noise را تنظیم کنید و تحول طیف‌نگار و طیف هر فریم را با playhead بررسی کنید.",
      ctrlScenario: "سناریوی سیگنال",
      ctrlNfft: "اندازه FFT",
      ctrlSpecScale: "مقیاس طیف‌نگار",
      ctrlOverlap: "هم‌پوشانی فریم",
      ctrlSpecNoise: "میزان نویز",
      ctrlPlayhead: "فریم انتخابی (Playhead)",
      fullScreenBtn: "تمام‌صفحه",
      fftStftTitle: "شبیه‌ساز مقایسه FFT و STFT",
      ctrlToneMix: "شدت ترکیب تون‌ها",
      ctrlStftFrame: "اندازه فریم STFT",
      fftLabel: "بزرگی FFT سراسری",
      stftLabel: "تغییرات برش STFT موضعی",
      dtwTitle: "شبیه‌ساز هم‌ترازی DTW",
      ctrlDtwStretch: "اختلاف کشیدگی توالی",
      ctrlDtwNoise: "نویز توالی",
      timeDomainLabel: "سیگنال در حوزه زمان",
      timeFreqLabel: "نمایش زمان-فرکانس (طیف‌نگار)",
      freqDomainLabel: "برش حوزه فرکانس برای فریم انتخابی",
      ctrlMelBands: "تعداد باندهای Mel",
      ctrlPreEmphasis: "شدت Pre-emphasis",
      ctrlNoiseLevel: "سطح نویز",
      ctrlVadThreshold: "آستانه VAD",
      ctrlClusterGap: "فاصله خوشه‌ها",
      ctrlVerifyThreshold: "آستانه تصدیق",
      mfccNote: "افزایش تعداد باندهای Mel دقت فرکانسی را بالا می‌برد اما بعد ویژگی‌ها را بیشتر می‌کند.",
      aliasSafe: "بدون Aliasing: نرخ نمونه‌برداری بالاتر از حد نایکوئیست است.",
      aliasRisk: "خطر Aliasing: نرخ نمونه‌برداری برای این فرکانس سیگنال کافی نیست.",
      vadSpeech: "فریم‌های تشخیص‌داده‌شده به‌عنوان گفتار",
      vadSilence: "فریم‌های تشخیص‌داده‌شده به‌عنوان سکوت",
      spkSame: "احتمالاً یک گوینده (فاصله کمتر از آستانه).",
      spkDiff: "احتمالاً گوینده متفاوت (فاصله بیشتر از آستانه).",
      specSummary: "تعداد فریم: {frames} | Hop: {hop} نمونه | باند غالب: {band}",
      relatedTitle: "بخش‌های مرتبط",
      openLab: "باز کردن شبیه‌ساز",
      sections: [
        {
          id: "sec-foundations",
          title: "۱) مبانی ریاضی-سیگنالی گفتار",
          desc: "در این بخش بنیان فنی دقیق را می‌سازیم: از نمونه‌برداری و قضیه نایکوئیست تا قاب‌بندی و تحلیل زمان-فرکانس.",
          points: ["موج و نمونه‌برداری", "پنجره‌بندی و STFT", "خوانش طیف‌نگار", "انرژی و بلندی صوت"],
          subsections: [
            {
              id: "sec-foundations-wave",
              title: "نمونه‌برداری، بازسازی و Aliasing",
              desc: "تبدیل سیگنال پیوسته صوتی به نمایش گسسته و نقش حیاتی شرط نایکوئیست در جلوگیری از اعوجاج.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-foundations-stft",
              title: "قاب‌بندی، Windowing و STFT دقیق",
              desc: "تحلیل کوتاه‌زمان، مصالحه زمان-فرکانس و انتخاب عملی پنجره برای گفتار واقعی.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
            {
              id: "sec-foundations-spec",
              title: "تفسیر حرفه‌ای طیف‌نگار گفتار",
              desc: "تفسیر فرمنت‌ها، هارمونیک‌ها، ناحیه voiced/unvoiced و رخدادهای گذرا در سیگنال‌های واقعی.",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
          ],
        },
        {
          id: "sec-transforms",
          title: "۲) تحلیل فوریه: FFT، STFT و نشت طیفی",
          desc: "این فصل مخصوص نگاه تبدیل‌محور است: شهود DFT، محاسبه سریع FFT، اثر پارامترهای STFT و مصالحه نشت طیفی/نوع پنجره.",
          points: ["شهود DFT و بسط تناوبی", "ساختار محاسباتی FFT", "اثر پارامترهای STFT", "نشت طیفی و طراحی پنجره"],
          subsections: [
            {
              id: "sec-transforms-fft",
              title: "مکانیک FFT و تفسیر frequency-bin",
              desc: "اثر فاصله باندها، قدرت تفکیک فرکانسی و zero-padding بر طیف مشاهده‌شده.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
            {
              id: "sec-transforms-stft",
              title: "STFT به‌عنوان فوریه محلی لغزان",
              desc: "طول فریم، overlap و نوع پنجره به‌طور هم‌زمان خوانایی زمان/فرکانس را تعیین می‌کنند.",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
          ],
        },
        {
          id: "sec-features",
          title: "۳) مهندسی ویژگی‌های آکوستیکی",
          desc: "از ویژگی‌های کلاسیک تا ویژگی‌های مقاوم: هدف این فصل ساخت front-end قابل اعتماد برای مدل‌های گفتاری است.",
          points: ["خط لوله MFCC", "سرنخ‌های F0 و voiced/unvoiced", "شهود کپستروم", "ویژگی‌های دینامیک"],
          subsections: [
            {
              id: "sec-features-mfcc",
              title: "طراحی و تیون کامل خط لوله MFCC",
              desc: "از pre-emphasis تا mel filterbank، لگاریتم انرژی و DCT برای نمایش فشرده آکوستیکی.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-features-pitch",
              title: "F0، jitter، shimmer و تحلیل آواسازی",
              desc: "استخراج شاخص‌های تناوبی زمان‌محور برای کاربردهای بازشناسی، تحلیل کیفیت و کاربردهای پزشکی.",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
          ],
        },
        {
          id: "sec-modeling",
          title: "۴) مدل‌سازی آماری تا عصبی",
          desc: "پل بین مدل‌های قابل‌تفسیر کلاسیک و مدل‌های عصبی مدرن را با نگاه مهندسی و قابل‌پیاده‌سازی می‌سازیم.",
          points: ["مدل‌های خطی و زیرفضایی", "GMM و کمّی‌سازی برداری", "مدل‌های عصبی آکوستیکی", "بازنمایی خودنظارتی"],
          subsections: [
            {
              id: "sec-modeling-classic",
              title: "مدل‌های کلاسیک: خطی، زیرفضایی و GMM",
              desc: "پایه‌های احتمالاتی لازم برای ساخت baselineهای قابل تفسیر و قابل اتکا در سامانه‌های گفتاری.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-modeling-neural",
              title: "مدل‌سازی آکوستیکی عصبی",
              desc: "از DNNهای فریم‌محور تا مدل‌های توالی‌محور و بازنمایی‌های مدرن برای گفتار.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
          ],
        },
        {
          id: "sec-tasks",
          title: "۵) وظایف هسته‌ای سامانه‌های گفتاری",
          desc: "هر وظیفه را به‌صورت end-to-end می‌بینیم: ورودی، مدل، معیار ارزیابی، خطاهای رایج و راه‌حل عملی.",
          points: ["تشخیص فعالیت گفتار", "بازشناسی خودکار گفتار", "شناسایی/تصدیق گوینده", "مبانی ترکیب گفتار"],
          subsections: [
            {
              id: "sec-tasks-vad",
              title: "تشخیص فعالیت گفتار (VAD)",
              desc: "تحلیل مصالحه تاخیر-دقت و پایدارسازی عملکرد در حضور نویز و سیگنال‌های مخدوش.",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
            {
              id: "sec-tasks-asr",
              title: "معماری ASR و منابع خطا",
              desc: "مرور acoustic model، language model، decoding و تحلیل رفتار WER در داده‌های واقعی.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
            {
              id: "sec-tasks-speaker",
              title: "بازشناسی گوینده و دیاریزیشن",
              desc: "embedding هویتی، آستانه‌گذاری تصدیق و بخش‌بندی سناریوهای چندگوینده.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
          ],
        },
        {
          id: "sec-quality",
          title: "۶) ارزیابی علمی و قابلیت اعتماد",
          desc: "این فصل استاندارد حرفه‌ای ارزیابی را پیاده می‌کند: پروتکل، شاخص، تحلیل خطا، و گزارش‌پذیری تکرارپذیر.",
          points: ["ارزیابی ذهنی", "شاخص‌های عینی", "پروتکل داده و تقسیم‌بندی", "تحلیل نتایج"],
          subsections: [
            {
              id: "sec-quality-metrics",
              title: "شاخص‌های عینی و طراحی پروتکل",
              desc: "طراحی ارزیابی منصفانه، کنترل سوگیری و اجتناب از برداشت نادرست از معیارها.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-quality-analysis",
              title: "تحلیل خطا و گزارش‌پذیری نتایج",
              desc: "فاصله اطمینان، ablation study و اصول بازتولیدپذیری برای گزارش معتبر علمی.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
          ],
        },
        {
          id: "sec-simulators",
          title: "۷) آزمایشگاه تعاملی و پیاده‌سازی واقعی",
          desc: "خروجی این بخش ابزارهای تعاملی واقعی است؛ هر مفهوم باید با شبیه‌سازی قابل مشاهده، قابل دست‌کاری و قابل تحلیل باشد.",
          points: ["شبیه‌سازهای بصری تعاملی", "نوت‌بوک‌های قابل‌تکرار در کولب", "تمرین‌های لابراتواری", "قالب‌های آماده آزمایش"],
          subsections: [
            {
              id: "sec-simulators-catalog",
              title: "کاتالوگ سیمولاتورها و مسیر تمرین",
              desc: "برای هر فصل مجموعه تمرین‌های هدفمند داریم که خروجی آموزشی آن از قبل تعریف و قابل ارزیابی است.",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
            {
              id: "sec-simulators-colab",
              title: "لابراتوارهای Colab-First",
              desc: "نوت‌بوک‌های آماده بدون نیاز به نصب محلی برای استخراج ویژگی، مدل‌سازی، ارزیابی و تحلیل.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
          ],
        },
      ],
    },
    ar: {
      dir: "rtl",
      title: "أكاديمية معالجة الصوت",
      back: "رجوع",
      kicker: "منهجي • علمي • عملي",
      heroTitle: "مسار متكامل لمعالجة الصوت الحديثة",
      heroDesc:
        "تعرض هذه الصفحة معالجة الصوت من الأساسيات إلى الأنظمة المتقدمة بهيكل هرمي واضح ومحاكيات متنوعة وتجارب جاهزة على Colab.",
      startPath: "ابدأ المسار",
      openSimLab: "فتح مختبر المحاكاة",
      footerPrepared: "إعداد: محمد خلويي",
      footerContact: "البريد الإلكتروني",
      crumbHome: "الرئيسية",
      crumbAcademy: "أكاديمية الصوت",
      globalHighlights: "الملخص",
      globalResearch: "البحث",
      globalTeaching: "التدريس",
      globalAcademy: "الأكاديمية",
      globalCurrent: "الأكاديمية / معالجة الصوت (تمهيدي)",
      pageLevel: "المسار التمهيدي",
      trackIntro: "تمهيدي",
      trackAdvanced: "متقدم",
      treeTitle: "شجرة التعلم",
      overviewTitle: "خريطة المقرر (كل المحاور)",
      floatMap: "الخريطة",
      floatSections: "المحاور",
      floatLabs: "المختبر",
      linkAdvLabs: "المسار المتقدم والنماذج الأساسية",
      linkTasks: "عروض مهام الصوت",
      linkTrustLabs: "مختبر ML الموثوق",
      linkDocker: "أوامر Docker",
      linkGit: "أوامر Git",
      moduleTag: "وحدة",
      resourcesTitle: "موارد عملية",
      colabCta: "فتح Colab",
      simCta: "فتح المحاكي",
      simLabTitle: "محاكيات مفاهيم تفاعلية",
      simLabDesc: "هذه ليست رسومًا تجميلية؛ غيّر المعاملات ولاحظ التغير الحقيقي في الإشارة.",
      winSimTitle: "محاكي Windowing",
      samplingSimTitle: "محاكي Sampling و Aliasing",
      ctrlWindowType: "نوع النافذة",
      ctrlWindowSize: "حجم النافذة",
      ctrlWindowShift: "إزاحة النافذة",
      ctrlSignalFreq: "تردد الإشارة",
      ctrlSampleRate: "معدل أخذ العينات",
      mfccSimTitle: "محاكي MFCC Filterbank",
      vadSimTitle: "محاكي عتبة VAD",
      spkSimTitle: "محاكي مسافة المتحدث",
      flagshipTitle: "المحاكي الرئيسي: Spectrogram Studio",
      flagshipDesc:
        "مختبر STFT تفاعلي بمستوى متقدم: قارن السيناريوهات واضبط FFT/overlap/noise وافحص تطور المطياف وطيف كل إطار عبر playhead.",
      ctrlScenario: "سيناريو الإشارة",
      ctrlNfft: "حجم FFT",
      ctrlSpecScale: "مقياس الطيف",
      ctrlOverlap: "تداخل الإطار",
      ctrlSpecNoise: "مقدار الضوضاء",
      ctrlPlayhead: "إطار المعاينة",
      fullScreenBtn: "ملء الشاشة",
      fftStftTitle: "محاكي مقارنة FFT و STFT",
      ctrlToneMix: "مستوى مزج النغمات",
      ctrlStftFrame: "حجم إطار STFT",
      fftLabel: "مطال FFT الشامل",
      stftLabel: "تغيرات مقطع STFT المحلي",
      dtwTitle: "محاكي محاذاة DTW",
      ctrlDtwStretch: "اختلاف التمدد",
      ctrlDtwNoise: "ضوضاء التسلسل",
      timeDomainLabel: "الإشارة في مجال الزمن",
      timeFreqLabel: "تمثيل الزمن-التردد (مطياف)",
      freqDomainLabel: "مقطع مجال التردد للإطار المحدد",
      ctrlMelBands: "عدد نطاقات Mel",
      ctrlPreEmphasis: "شدة Pre-emphasis",
      ctrlNoiseLevel: "مستوى الضوضاء",
      ctrlVadThreshold: "عتبة VAD",
      ctrlClusterGap: "فاصل العناقيد",
      ctrlVerifyThreshold: "عتبة التحقق",
      mfccNote: "زيادة نطاقات Mel تحسن الدقة الطيفية لكنها ترفع أبعاد الخصائص.",
      aliasSafe: "لا يوجد aliasing: معدل أخذ العينات أعلى من حد Nyquist.",
      aliasRisk: "خطر aliasing: معدل أخذ العينات منخفض بالنسبة لتردد الإشارة.",
      vadSpeech: "إطارات مصنفة ككلام",
      vadSilence: "إطارات مصنفة كصمت",
      spkSame: "غالباً نفس المتحدث (المسافة أقل من العتبة).",
      spkDiff: "غالباً متحدث مختلف (المسافة أعلى من العتبة).",
      specSummary: "عدد الإطارات: {frames} | Hop: {hop} عينة | الحزمة الغالبة: {band}",
      relatedTitle: "محاور مرتبطة",
      openLab: "فتح المحاكي",
      sections: [
        {
          id: "sec-foundations",
          title: "1) الأساسيات وتمثيل الإشارة",
          desc: "نتعلم الموجة، أخذ العينات، التأطير، STFT، المطياف، والطاقة كقاعدة لفهم الصوت بشكل عميق.",
          points: ["الموجة وأخذ العينات", "التأطير و STFT", "قراءة المطياف", "الطاقة وشدة الصوت"],
          subsections: [
            {
              id: "sec-foundations-wave",
              title: "الموجة، أخذ العينات، و aliasing",
              desc: "تحويل الإشارة الصوتية المستمرة إلى تمثيل رقمي ودور شرط Nyquist في منع التشوه.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-foundations-stft",
              title: "التأطير، النوافذ، وتحويل STFT",
              desc: "تحليل قصير الزمن، مفاضلة الزمن-التردد، واختيار النوافذ المناسبة للكلام الحقيقي.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
            {
              id: "sec-foundations-spec",
              title: "قراءة المطياف باحتراف",
              desc: "تفسير formants و harmonics وأنماط voicing والأحداث الانتقالية.",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
          ],
        },
        {
          id: "sec-features",
          title: "2) استخراج الخصائص الصوتية",
          desc: "بناء واجهة إدخال قوية باستخدام MFCC و F0 و معدل عبور الصفر والخصائص الديناميكية.",
          points: ["خط MFCC", "دلائل F0", "فهم cepstrum", "الخصائص الديناميكية"],
          subsections: [
            {
              id: "sec-features-mfcc",
              title: "سلسلة MFCC الكاملة",
              desc: "من pre-emphasis إلى mel filterbanks والضغط اللوغاريتمي و DCT.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-features-pitch",
              title: "F0 و jitter و shimmer",
              desc: "مؤشرات دورية مهمة للتعرف والتحليل السريري وجودة الصوت.",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
          ],
        },
        {
          id: "sec-modeling",
          title: "3) أدوات النمذجة وأنماط التعلم",
          desc: "انتقال من النماذج الإحصائية الكلاسيكية إلى النماذج العصبية والتعلم الذاتي الإشراف.",
          points: ["نماذج خطية", "GMM و VQ", "نماذج عصبية", "تمثيلات ذاتية الإشراف"],
          subsections: [
            {
              id: "sec-modeling-classic",
              title: "النماذج الكلاسيكية",
              desc: "أساس احتمالي لبناء خطوط أساس قابلة للتفسير والاعتماد.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-modeling-neural",
              title: "النمذجة العصبية الصوتية",
              desc: "من DNN على مستوى الإطار إلى نماذج التسلسل الحديثة.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
          ],
        },
        {
          id: "sec-tasks",
          title: "4) مهام الكلام الأساسية",
          desc: "VAD و ASR والتعرف على المتحدث و diarization والتخليق الصوتي بسيناريوهات عملية.",
          points: ["VAD", "ASR", "Speaker Recognition", "Speech Synthesis"],
          subsections: [
            {
              id: "sec-tasks-vad",
              title: "كشف نشاط الصوت VAD",
              desc: "موازنة الدقة والزمن الحقيقي في البيئات الضوضائية.",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
            {
              id: "sec-tasks-asr",
              title: "خط ASR ومصادر الخطأ",
              desc: "النموذج الصوتي، نموذج اللغة، وفك الترميز مع تحليل WER.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
            {
              id: "sec-tasks-speaker",
              title: "التعرف على المتحدث و diarization",
              desc: "تمثيلات الهوية وضبط العتبة وتقسيم المتحدثين المتعددين.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
          ],
        },
        {
          id: "sec-quality",
          title: "5) التقييم والاعتمادية",
          desc: "تقييم ذاتي وموضوعي وتحليل أخطاء وتصميم تجارب سليمة.",
          points: ["تقييم ذاتي", "مقاييس موضوعية", "بروتوكول البيانات", "تحليل النتائج"],
          subsections: [
            {
              id: "sec-quality-metrics",
              title: "المقاييس الموضوعية والبروتوكول",
              desc: "تصميم مقارنات عادلة وتفادي إساءة تفسير النتائج.",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-quality-analysis",
              title: "تحليل الأخطاء وتقرير النتائج",
              desc: "فواصل الثقة و ablation وإعادة الإنتاج العلمي.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
          ],
        },
        {
          id: "sec-simulators",
          title: "6) ميزة المحاكيات و Colab",
          desc: "ميزة تنافسية واضحة: محاكيات تفاعلية متعددة ودفاتر قابلة للتنفيذ مباشرة على Colab.",
          points: ["محاكيات تفاعلية", "دفاتر قابلة للتكرار", "تمارين مخبرية", "قوالب تجارب"],
          subsections: [
            {
              id: "sec-simulators-catalog",
              title: "فهرس المحاكيات ومسار التدريب",
              desc: "ربط كل محور بمحاكاة عملية ومخرجات تعلم قابلة للقياس.",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
            {
              id: "sec-simulators-colab",
              title: "مختبرات Colab-first",
              desc: "تجارب جاهزة بلا إعداد محلي لاستخراج الخصائص والنمذجة والتقييم.",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
          ],
        },
      ],
    },
    zh: {
      dir: "ltr",
      title: "语音处理学院",
      back: "返回",
      kicker: "结构化 • 科学化 • 实践化",
      heroTitle: "现代语音处理完整学习路径",
      heroDesc:
        "本页从基础到高级系统系统讲解语音处理，提供清晰层级、丰富模拟器与可直接在 Colab 运行的实验流程。",
      startPath: "开始学习路径",
      openSimLab: "打开模拟实验室",
      footerPrepared: "制作：Mohammad Khalooei",
      footerContact: "邮箱",
      crumbHome: "首页",
      crumbAcademy: "语音处理学院",
      globalHighlights: "亮点",
      globalResearch: "研究",
      globalTeaching: "教学",
      globalAcademy: "学院",
      globalCurrent: "学院 / 语音处理（入门）",
      pageLevel: "入门轨道",
      trackIntro: "入门",
      trackAdvanced: "进阶",
      treeTitle: "学习树",
      overviewTitle: "课程全景图（全部章节）",
      floatMap: "总览",
      floatSections: "章节",
      floatLabs: "实验",
      linkAdvLabs: "进阶轨道与基础模型",
      linkTasks: "语音任务演示",
      linkTrustLabs: "可信 ML 实验",
      linkDocker: "Docker 命令",
      linkGit: "Git 命令",
      moduleTag: "模块",
      resourcesTitle: "实践资源",
      colabCta: "打开 Colab",
      simCta: "打开模拟器",
      simLabTitle: "交互式概念模拟器",
      simLabDesc: "这不是装饰动画。请直接调参，观察信号为何变化、如何变化。",
      winSimTitle: "Windowing 模拟器",
      samplingSimTitle: "Sampling 与 Aliasing 模拟器",
      ctrlWindowType: "窗函数类型",
      ctrlWindowSize: "窗长度",
      ctrlWindowShift: "窗位置偏移",
      ctrlSignalFreq: "信号频率",
      ctrlSampleRate: "采样率",
      mfccSimTitle: "MFCC Filterbank 模拟器",
      vadSimTitle: "VAD 阈值模拟器",
      spkSimTitle: "说话人距离模拟器",
      flagshipTitle: "旗舰模拟器：Spectrogram Studio",
      flagshipDesc:
        "专业级交互 STFT 实验室：切换场景、调节 FFT/overlap/noise，观察语谱图演化并用 playhead 检查任意帧频谱。",
      ctrlScenario: "信号场景",
      ctrlNfft: "FFT 大小",
      ctrlSpecScale: "频谱尺度",
      ctrlOverlap: "帧重叠",
      ctrlSpecNoise: "噪声量",
      ctrlPlayhead: "播放头帧",
      fullScreenBtn: "全屏",
      fftStftTitle: "FFT 与 STFT 对比模拟器",
      ctrlToneMix: "音调混合强度",
      ctrlStftFrame: "STFT 帧长度",
      fftLabel: "全局 FFT 幅度",
      stftLabel: "局部 STFT 切片变化",
      dtwTitle: "DTW 对齐模拟器",
      ctrlDtwStretch: "拉伸失配",
      ctrlDtwNoise: "序列噪声",
      timeDomainLabel: "时间域波形",
      timeFreqLabel: "时频表示（语谱图）",
      freqDomainLabel: "所选帧的频域切片",
      ctrlMelBands: "Mel 滤波器数量",
      ctrlPreEmphasis: "Pre-emphasis 强度",
      ctrlNoiseLevel: "噪声水平",
      ctrlVadThreshold: "VAD 阈值",
      ctrlClusterGap: "聚类间距",
      ctrlVerifyThreshold: "验证阈值",
      mfccNote: "Mel 滤波器越多，频率分辨率越高，但特征维度也更高。",
      aliasSafe: "无混叠：采样率高于 Nyquist 条件。",
      aliasRisk: "存在混叠风险：采样率对当前信号频率不足。",
      vadSpeech: "判定为语音的帧",
      vadSilence: "判定为静音的帧",
      spkSame: "更可能为同一说话人（距离低于阈值）。",
      spkDiff: "更可能为不同说话人（距离高于阈值）。",
      specSummary: "帧数: {frames} | Hop: {hop} 样本 | 主导频带索引: {band}",
      relatedTitle: "关联章节",
      openLab: "打开模拟器",
      sections: [
        {
          id: "sec-foundations",
          title: "1) 基础与信号表示",
          desc: "系统学习波形、采样、分帧、STFT、语谱图与能量分析，建立语音处理直觉。",
          points: ["波形与采样", "分帧与 STFT", "语谱图解读", "能量与响度"],
          subsections: [
            {
              id: "sec-foundations-wave",
              title: "波形、采样与混叠",
              desc: "连续语音到离散信号的转换机制，以及 Nyquist 条件的重要性。",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-foundations-stft",
              title: "分帧、加窗与 STFT",
              desc: "短时分析、时频权衡与语音任务中的实用窗函数选择。",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
            {
              id: "sec-foundations-spec",
              title: "语谱图专业解读",
              desc: "Formant、谐波、浊音结构与瞬态事件的识别。",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
          ],
        },
        {
          id: "sec-features",
          title: "2) 语音特征提取",
          desc: "构建稳健前端：MFCC、F0、过零率、动态特征与倒谱分析。",
          points: ["MFCC 流程", "F0 与发声线索", "倒谱直觉", "动态特征"],
          subsections: [
            {
              id: "sec-features-mfcc",
              title: "MFCC 全流程",
              desc: "从 pre-emphasis 到 mel 滤波器组、对数压缩与 DCT。",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-features-pitch",
              title: "F0、jitter 与 shimmer",
              desc: "周期性特征在识别、质量分析与医学语音中的作用。",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
          ],
        },
        {
          id: "sec-modeling",
          title: "3) 建模工具与学习范式",
          desc: "从经典统计模型过渡到神经建模与自监督表示学习。",
          points: ["线性与子空间模型", "GMM 与向量量化", "神经声学模型", "自监督表示"],
          subsections: [
            {
              id: "sec-modeling-classic",
              title: "经典模型",
              desc: "建立可解释、可复现实验基线的概率建模基础。",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-modeling-neural",
              title: "神经声学建模",
              desc: "从帧级 DNN 到现代序列模型与表示学习。",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
          ],
        },
        {
          id: "sec-tasks",
          title: "4) 核心语音任务",
          desc: "覆盖 VAD、ASR、说话人识别、说话人分离/分段与语音合成。",
          points: ["VAD", "ASR", "Speaker Recognition", "Speech Synthesis"],
          subsections: [
            {
              id: "sec-tasks-vad",
              title: "语音活动检测 VAD",
              desc: "在噪声场景下平衡实时性与准确性。",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
            {
              id: "sec-tasks-asr",
              title: "ASR 流程与误差来源",
              desc: "声学模型、语言模型、解码与 WER 误差分析。",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
            {
              id: "sec-tasks-speaker",
              title: "说话人识别与 diarization",
              desc: "身份表征、阈值决策与多说话人场景分段。",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
          ],
        },
        {
          id: "sec-quality",
          title: "5) 评测与可靠性",
          desc: "学习主观/客观评测、误差分析与规范实验设计。",
          points: ["主观评测", "客观指标", "数据协议", "结果解释"],
          subsections: [
            {
              id: "sec-quality-metrics",
              title: "客观指标与评测协议",
              desc: "建立公平比较流程，避免指标误用。",
              colab: LINKS.colab,
              sim: LINKS.simLinear,
            },
            {
              id: "sec-quality-analysis",
              title: "误差分析与结果报告",
              desc: "置信区间、消融实验与可复现报告规范。",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
          ],
        },
        {
          id: "sec-simulators",
          title: "6) 核心优势：模拟器与 Colab",
          desc: "核心竞争力：多样交互式模拟器 + 可直接运行的 Colab 实验。",
          points: ["交互模拟器", "可复现实验笔记本", "实验课任务", "实验模板"],
          subsections: [
            {
              id: "sec-simulators-catalog",
              title: "模拟器目录与训练路线",
              desc: "每章配套目标明确的交互实验与可评价学习产出。",
              colab: LINKS.colab,
              sim: LINKS.simGA,
            },
            {
              id: "sec-simulators-colab",
              title: "Colab-first 实验体系",
              desc: "无需本地安装，直接完成特征提取、建模、评测与报告。",
              colab: LINKS.colab,
              sim: LINKS.simOpt,
            },
          ],
        },
      ],
    },
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function getLangSel() {
    return byId("academy-lang") || byId("sp-lang");
  }

  function currentLangPack() {
    var sel = getLangSel();
    var lang = (sel && sel.value) || getInitialLang();
    return DATA[lang] || DATA.en;
  }

  function setText(lang) {
    var t = DATA[lang] || DATA.en;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    document.documentElement.dir = t.dir;
    document.title = t.title;
    var map = {
      title: t.title,
      back: t.back,
      kicker: t.kicker,
      heroTitle: t.heroTitle,
      heroDesc: t.heroDesc,
      startPath: t.startPath,
      openSimLab: t.openSimLab,
      footerPrepared: t.footerPrepared,
      footerContact: t.footerContact,
      crumbHome: t.crumbHome,
      crumbAcademy: t.crumbAcademy,
      globalHighlights: t.globalHighlights,
      globalResearch: t.globalResearch,
      globalTeaching: t.globalTeaching,
      globalAcademy: t.globalAcademy,
      globalCurrent: t.globalCurrent,
      pageLevel: t.pageLevel,
      trackIntro: t.trackIntro,
      trackAdvanced: t.trackAdvanced,
      treeTitle: t.treeTitle,
      overviewTitle: t.overviewTitle,
      floatMap: t.floatMap,
      floatSections: t.floatSections,
      floatLabs: t.floatLabs,
      linkAdvLabs: t.linkAdvLabs,
      linkTasks: t.linkTasks,
      linkTrustLabs: t.linkTrustLabs,
      linkDocker: t.linkDocker,
      linkGit: t.linkGit,
      simLabTitle: t.simLabTitle,
      simLabDesc: t.simLabDesc,
      winSimTitle: t.winSimTitle,
      samplingSimTitle: t.samplingSimTitle,
      mfccSimTitle: t.mfccSimTitle,
      vadSimTitle: t.vadSimTitle,
      spkSimTitle: t.spkSimTitle,
      flagshipTitle: t.flagshipTitle,
      flagshipDesc: t.flagshipDesc,
      ctrlScenario: t.ctrlScenario,
      ctrlNfft: t.ctrlNfft,
      ctrlSpecScale: t.ctrlSpecScale,
      ctrlOverlap: t.ctrlOverlap,
      ctrlSpecNoise: t.ctrlSpecNoise,
      ctrlPlayhead: t.ctrlPlayhead,
      fullScreenBtn: t.fullScreenBtn,
      fftStftTitle: t.fftStftTitle,
      ctrlToneMix: t.ctrlToneMix,
      ctrlStftFrame: t.ctrlStftFrame,
      fftLabel: t.fftLabel,
      stftLabel: t.stftLabel,
      dtwTitle: t.dtwTitle,
      ctrlDtwStretch: t.ctrlDtwStretch,
      ctrlDtwNoise: t.ctrlDtwNoise,
      timeDomainLabel: t.timeDomainLabel,
      timeFreqLabel: t.timeFreqLabel,
      freqDomainLabel: t.freqDomainLabel,
      ctrlWindowType: t.ctrlWindowType,
      ctrlWindowSize: t.ctrlWindowSize,
      ctrlWindowShift: t.ctrlWindowShift,
      ctrlSignalFreq: t.ctrlSignalFreq,
      ctrlSampleRate: t.ctrlSampleRate,
      ctrlMelBands: t.ctrlMelBands,
      ctrlPreEmphasis: t.ctrlPreEmphasis,
      ctrlNoiseLevel: t.ctrlNoiseLevel,
      ctrlVadThreshold: t.ctrlVadThreshold,
      ctrlClusterGap: t.ctrlClusterGap,
      ctrlVerifyThreshold: t.ctrlVerifyThreshold,
      mfccNote: t.mfccNote,
      openLab: t.openLab,
    };
    Object.keys(map).forEach(function (k) {
      var el = document.querySelector('[data-i18n="' + k + '"]');
      if (el) el.textContent = map[k];
    });
    renderTreeAndSections(t, (window.__spSelectedSection && window.__spSelectedSection[lang]) || null);
    renderFloatSections(t);
    refreshSimulatorText(t);
  }

  function renderFloatSections(t) {
    var root = byId("sp-float-sections");
    if (!root) return;
    root.innerHTML = "";
    (t.sections || []).forEach(function (s, i) {
      var a = document.createElement("a");
      a.href = "#";
      a.textContent = String(i + 1);
      a.title = s.title;
      a.setAttribute("data-target-section", s.id);
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var btn = document.querySelector('.sp-overview-btn[data-target="' + s.id + '"]');
        if (btn) btn.click();
        var anchor = byId("sections-anchor");
        if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      root.appendChild(a);
    });
  }

  function renderTreeAndSections(t, selectedId) {
    var tree = byId("tree-root");
    var overview = byId("overview-root");
    var content = byId("content-root");
    var crumb = byId("crumb-current");
    tree.innerHTML = "";
    if (overview) overview.innerHTML = "";
    content.innerHTML = "";
    if (!t.sections || !t.sections.length) return;

    var sectionsById = {};
    t.sections.forEach(function (s) {
      sectionsById[s.id] = s;
    });
    var activeId = selectedId && sectionsById[selectedId] ? selectedId : t.sections[0].id;
    if (!window.__spSelectedSection) window.__spSelectedSection = {};
    window.__spSelectedSection[document.documentElement.lang] = activeId;

    function relatedIds(sectionId) {
      if (sectionId === "sec-foundations") return ["sec-transforms", "sec-features"];
      if (sectionId === "sec-transforms") return ["sec-foundations", "sec-features", "sec-simulators"];
      if (sectionId === "sec-features") return ["sec-transforms", "sec-modeling", "sec-tasks"];
      if (sectionId === "sec-modeling") return ["sec-tasks", "sec-quality"];
      if (sectionId === "sec-tasks") return ["sec-quality", "sec-simulators"];
      if (sectionId === "sec-quality") return ["sec-modeling", "sec-tasks"];
      return ["sec-foundations", "sec-transforms", "sec-features"];
    }

    function setActive(newId) {
      if (!sectionsById[newId]) return;
      activeId = newId;
      window.__spSelectedSection[document.documentElement.lang] = newId;
      tree.querySelectorAll("a").forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("data-target") === newId);
      });
      if (overview) {
        overview.querySelectorAll(".sp-overview-btn").forEach(function (b) {
          b.classList.toggle("active", b.getAttribute("data-target") === newId);
        });
      }
      renderActiveContent(newId);
      crumb.textContent = sectionsById[newId].title;
    }

    t.sections.forEach(function (s, i) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#";
      a.setAttribute("data-target", s.id);
      a.textContent = s.title;
      a.className = "lvl-1";
      if (s.id === activeId || (i === 0 && !selectedId)) a.classList.add("active");
      a.addEventListener("click", function (e) {
        e.preventDefault();
        setActive(s.id);
      });
      li.appendChild(a);

      if (s.subsections && s.subsections.length) {
        var ul = document.createElement("ul");
        ul.className = "lvl-2";
        s.subsections.forEach(function (sub) {
          var subLi = document.createElement("li");
          var subA = document.createElement("a");
          subA.href = "#" + sub.id;
          subA.textContent = sub.title;
          subA.className = "lvl-2-link";
          subA.addEventListener("click", function (e) {
            e.preventDefault();
            setActive(s.id);
            var target = byId(sub.id);
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          subLi.appendChild(subA);
          ul.appendChild(subLi);
        });
        li.appendChild(ul);
      }

      tree.appendChild(li);

      if (overview) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sp-overview-btn" + (s.id === activeId ? " active" : "");
        btn.setAttribute("data-target", s.id);
        btn.textContent = s.title;
        btn.addEventListener("click", function () {
          setActive(s.id);
        });
        overview.appendChild(btn);
      }
    });

    function renderActiveContent(focusId) {
      content.innerHTML = "";
      t.sections.forEach(function (section) {
        var article = document.createElement("article");
        article.className = "sp-section card";
        article.id = section.id;
        var isOpen = section.id === focusId;
        var related = relatedIds(section.id)
          .filter(function (id) {
            return sectionsById[id];
          })
          .map(function (id) {
            return (
              "<button class='sp-related-chip' type='button' data-target='" +
              id +
              "'>" +
              sectionsById[id].title +
              "</button>"
            );
          })
          .join("");
        article.innerHTML =
          '<div class="sp-accordion-head"><h3>' +
          section.title +
          '</h3><button class="sp-accordion-toggle" type="button" data-target="' +
          section.id +
          '">' +
          (isOpen ? "−" : "+") +
          "</button></div>" +
          '<div class="sp-accordion-body"' +
          (isOpen ? "" : " hidden") +
          ">" +
          '<span class="sp-tagline">' +
          t.moduleTag +
          "</span><p>" +
          section.desc +
          "</p><ul class='sp-sublist'>" +
          section.points
            .map(function (p) {
              return "<li>" + p + "</li>";
            })
            .join("") +
          "</ul><div class='sp-related-row'><span class='sp-resource-label'>" +
          t.relatedTitle +
          ":</span>" +
          related +
          "</div></div>";
        content.appendChild(article);

        (section.subsections || []).forEach(function (sub) {
          var subArticle = document.createElement("article");
          subArticle.className = "sp-subsection card";
          subArticle.id = sub.id;
          var labHint = inferLabHint(sub.id, t);
          var labLinks = inferLabLinks(sub.id, t);
          subArticle.innerHTML =
            "<h4>" +
            sub.title +
            "</h4><p>" +
            sub.desc +
            "</p><p class='sp-lab-hint'>" +
            labHint +
            "</p>" +
            labLinks;
          if (!isOpen) subArticle.hidden = true;
          subArticle.setAttribute("data-parent", section.id);
          content.appendChild(subArticle);
        });
      });

      content.querySelectorAll(".sp-related-chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          var target = chip.getAttribute("data-target");
          setActive(target);
          var el = byId(target);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });

      content.querySelectorAll(".sp-accordion-toggle").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var target = btn.getAttribute("data-target");
          setActive(target);
          var body = btn.closest(".sp-section").querySelector(".sp-accordion-body");
          var shouldOpen = body.hasAttribute("hidden");
          content.querySelectorAll(".sp-accordion-body").forEach(function (b) {
            b.setAttribute("hidden", "hidden");
          });
          content.querySelectorAll(".sp-subsection[data-parent]").forEach(function (s) {
            s.hidden = true;
          });
          content.querySelectorAll(".sp-accordion-toggle").forEach(function (b) {
            b.textContent = "+";
          });
          if (shouldOpen) {
            body.removeAttribute("hidden");
            btn.textContent = "−";
            content.querySelectorAll('.sp-subsection[data-parent="' + target + '"]').forEach(function (s) {
              s.hidden = false;
            });
          }
        });
      });

      content.querySelectorAll(".sp-lab-link-chip[data-jump]").forEach(function (chip) {
        chip.addEventListener("click", function () {
          var id = chip.getAttribute("data-jump");
          var target = byId(id);
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }

    setActive(activeId);
  }

  function inferLabHint(subId, t) {
    var fa = (t.title || "").indexOf("آکادمی") >= 0;
    var ar = (t.title || "").indexOf("أكاديمية") >= 0;
    var zh = (t.title || "").indexOf("学院") >= 0;
    function tr(faTxt, enTxt, arTxt, zhTxt) {
      if (fa) return faTxt;
      if (ar) return arTxt;
      if (zh) return zhTxt;
      return enTxt;
    }
    if (subId.indexOf("foundations") >= 0 || subId.indexOf("stft") >= 0) {
      return tr(
        "شبیه‌سازی مرتبط: Spectrogram Studio + Windowing Simulator (پایین صفحه)",
        "Related simulation: Spectrogram Studio + Windowing Simulator (below)",
        "المحاكاة المرتبطة: Spectrogram Studio + Windowing Simulator (أسفل الصفحة)",
        "关联模拟：Spectrogram Studio + Windowing Simulator（页面下方）"
      );
    }
    if (subId.indexOf("transforms") >= 0 || subId.indexOf("fft") >= 0) {
      return tr(
        "شبیه‌سازی مرتبط: Spectrogram Studio (Linear/Mel) + کنترل FFT/Overlap",
        "Related simulation: Spectrogram Studio (Linear/Mel) + FFT/Overlap controls",
        "المحاكاة المرتبطة: Spectrogram Studio (Linear/Mel) + إعدادات FFT/Overlap",
        "关联模拟：Spectrogram Studio（Linear/Mel）+ FFT/Overlap 控制"
      );
    }
    if (subId.indexOf("features") >= 0 || subId.indexOf("mfcc") >= 0) {
      return tr(
        "شبیه‌سازی مرتبط: MFCC Filterbank Simulator",
        "Related simulation: MFCC Filterbank Simulator",
        "المحاكاة المرتبطة: MFCC Filterbank Simulator",
        "关联模拟：MFCC Filterbank Simulator"
      );
    }
    if (subId.indexOf("vad") >= 0) {
      return tr(
        "شبیه‌سازی مرتبط: VAD Threshold Simulator",
        "Related simulation: VAD Threshold Simulator",
        "المحاكاة المرتبطة: VAD Threshold Simulator",
        "关联模拟：VAD Threshold Simulator"
      );
    }
    if (subId.indexOf("speaker") >= 0) {
      return tr(
        "شبیه‌سازی مرتبط: Speaker Distance Simulator",
        "Related simulation: Speaker Distance Simulator",
        "المحاكاة المرتبطة: Speaker Distance Simulator",
        "关联模拟：Speaker Distance Simulator"
      );
    }
    return tr(
      "شبیه‌سازی مرتبط: Spectrogram Studio",
      "Related simulation: Spectrogram Studio",
      "المحاكاة المرتبطة: Spectrogram Studio",
      "关联模拟：Spectrogram Studio"
    );
  }

  function inferLabLinks(subId, t) {
    var list = [];
    function add(id, label) {
      list.push(
        "<button class='sp-lab-link-chip' type='button' data-jump='" +
          id +
          "'>" +
          (label || t.openLab) +
          "</button>"
      );
    }

    if (subId.indexOf("transforms") >= 0 || subId.indexOf("fft") >= 0 || subId.indexOf("stft") >= 0) {
      add("spec-studio-anchor", "STFT / Mel");
      add("fft-stft-anchor", "FFT vs STFT");
      add("win-sim-anchor", "Windowing");
    } else if (subId.indexOf("mfcc") >= 0 || subId.indexOf("features") >= 0) {
      add("mfcc-sim-anchor", "MFCC");
    } else if (subId.indexOf("vad") >= 0) {
      add("vad-sim-anchor", "VAD");
    } else if (subId.indexOf("speaker") >= 0) {
      add("spk-sim-anchor", "Speaker");
    } else if (subId.indexOf("wave") >= 0 || subId.indexOf("sampling") >= 0) {
      add("sampling-sim-anchor", "Sampling");
      add("dtw-sim-anchor", "DTW");
    } else {
      add("spec-studio-anchor", "Spectrogram");
    }

    return "<div class='sp-lab-link-row'>" + list.join("") + "</div>";
  }

  function initSimulators() {
    initFullscreenButtons();
    initSpectrogramStudio();
    initFftStftSim();
    initWindowingSim();
    initSamplingSim();
    initMfccSim();
    initVadSim();
    initSpeakerSim();
    initDtwSim();
  }

  function initFullscreenButtons() {
    document.querySelectorAll(".sp-full-btn[data-full-target]").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        var targetId = btn.getAttribute("data-full-target");
        var card = byId(targetId);
        if (!card) return;
        try {
          if (document.fullscreenElement === card) {
            await document.exitFullscreen();
          } else {
            await card.requestFullscreen();
          }
        } catch (e) {
          card.classList.toggle("is-fullscreen");
          document.body.classList.toggle("sp-no-scroll", card.classList.contains("is-fullscreen"));
        }
      });
    });

    document.addEventListener("fullscreenchange", function () {
      document.querySelectorAll(".sp-lab-card").forEach(function (card) {
        card.classList.toggle("is-fullscreen", document.fullscreenElement === card);
      });
    });
  }

  function initSpectrogramStudio() {
    var scenarioEl = byId("spec-scenario");
    var nfftEl = byId("spec-nfft");
    var scaleEl = byId("spec-scale");
    var overlapEl = byId("spec-overlap");
    var noiseEl = byId("spec-noise");
    var playheadEl = byId("spec-playhead");
    var waveCanvas = byId("spec-wave-canvas");
    var heatmapCanvas = byId("spec-heatmap-canvas");
    var sliceCanvas = byId("spec-slice-canvas");
    var summary = byId("spec-summary");
    if (
      !scenarioEl ||
      !nfftEl ||
      !scaleEl ||
      !overlapEl ||
      !noiseEl ||
      !playheadEl ||
      !waveCanvas ||
      !heatmapCanvas ||
      !sliceCanvas ||
      !summary
    ) {
      return;
    }

    var signal = [];
    var mags = [];
    var hop = 64;

    function randn() {
      var u = 1 - Math.random();
      var v = 1 - Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function genSignal(kind, len, noiseLevel) {
      var out = new Array(len);
      for (var i = 0; i < len; i++) {
        var t = i / len;
        var val = 0;
        if (kind === "vowel") {
          var f0 = 8 + 2 * Math.sin(2 * Math.PI * t * 1.6);
          var env = 0.5 + 0.5 * Math.sin(2 * Math.PI * t * 0.8);
          val =
            env *
            (0.8 * Math.sin(2 * Math.PI * f0 * t * len / 128) +
              0.35 * Math.sin(2 * Math.PI * (f0 * 3.1) * t * len / 128) +
              0.22 * Math.sin(2 * Math.PI * (f0 * 5.4) * t * len / 128));
        } else if (kind === "chirp") {
          var f = 3 + 28 * t;
          val = 0.8 * Math.sin(2 * Math.PI * f * t * len / 128);
        } else {
          var g1 = 7 + 1.8 * Math.sin(2 * Math.PI * t * 1.3);
          var g2 = 13 + 2.2 * Math.cos(2 * Math.PI * t * 0.9);
          val =
            0.55 * Math.sin(2 * Math.PI * g1 * t * len / 128) +
            0.45 * Math.sin(2 * Math.PI * g2 * t * len / 128);
        }
        out[i] = val + randn() * noiseLevel;
      }
      return out;
    }

    function windowHann(n) {
      var w = new Array(n);
      for (var i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
      return w;
    }

    function stftMagnitudes(x, nfft, hopSize) {
      var win = windowHann(nfft);
      var frames = Math.max(1, Math.floor((x.length - nfft) / hopSize) + 1);
      var out = new Array(frames);
      var bins = nfft / 2;
      for (var f = 0; f < frames; f++) {
        var start = f * hopSize;
        var arr = new Array(bins);
        for (var k = 0; k < bins; k++) {
          var re = 0;
          var im = 0;
          for (var n = 0; n < nfft; n++) {
            var s = x[start + n] * win[n];
            var ph = (-2 * Math.PI * k * n) / nfft;
            re += s * Math.cos(ph);
            im += s * Math.sin(ph);
          }
          arr[k] = Math.sqrt(re * re + im * im);
        }
        out[f] = arr;
      }
      return out;
    }

    function hzToMel(hz) {
      return 2595 * Math.log(1 + hz / 700) / Math.log(10);
    }

    function melToHz(mel) {
      return 700 * (Math.pow(10, mel / 2595) - 1);
    }

    function melFilterbank(spec, nfft, melBands) {
      var fs = 16000;
      var bins = nfft / 2;
      var melMin = hzToMel(0);
      var melMax = hzToMel(fs / 2);
      var melPoints = [];
      for (var i = 0; i < melBands + 2; i++) {
        melPoints.push(melMin + (i / (melBands + 1)) * (melMax - melMin));
      }
      var hzPoints = melPoints.map(melToHz);
      var binPoints = hzPoints.map(function (hz) {
        return Math.floor(((nfft + 1) * hz) / fs);
      });
      var out = new Array(spec.length);
      for (var f = 0; f < spec.length; f++) {
        var row = new Array(melBands);
        for (var m = 0; m < melBands; m++) {
          var left = Math.max(0, Math.min(bins - 1, binPoints[m]));
          var center = Math.max(left + 1, Math.min(bins - 1, binPoints[m + 1]));
          var right = Math.max(center + 1, Math.min(bins - 1, binPoints[m + 2]));
          var e = 0;
          for (var k = left; k < center; k++) {
            var w1 = (k - left) / Math.max(1, center - left);
            e += spec[f][k] * w1;
          }
          for (var k2 = center; k2 < right; k2++) {
            var w2 = (right - k2) / Math.max(1, right - center);
            e += spec[f][k2] * w2;
          }
          row[m] = Math.log(1 + e);
        }
        out[f] = row;
      }
      return out;
    }

    function drawWave(x) {
      var ctx = waveCanvas.getContext("2d");
      var w = waveCanvas.width;
      var h = waveCanvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(148,163,184,0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var i = 0; i < x.length; i++) {
        var xx = (i / (x.length - 1)) * w;
        var yy = h * 0.5 - x[i] * (h * 0.4);
        if (i === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
    }

    function drawHeatmap(spec, frameIdx) {
      var ctx = heatmapCanvas.getContext("2d");
      var w = heatmapCanvas.width;
      var h = heatmapCanvas.height;
      ctx.clearRect(0, 0, w, h);
      var frames = spec.length;
      var bins = spec[0].length;
      var maxV = 1e-8;
      for (var i = 0; i < frames; i++) {
        for (var b = 0; b < bins; b++) maxV = Math.max(maxV, spec[i][b]);
      }
      var cw = w / frames;
      var ch = h / bins;
      for (var f = 0; f < frames; f++) {
        for (var k = 0; k < bins; k++) {
          var v = spec[f][k] / maxV;
          var r = Math.floor(20 + 180 * Math.pow(v, 0.65));
          var g = Math.floor(30 + 220 * Math.pow(v, 1.1));
          var bl = Math.floor(70 + 170 * Math.pow(1 - v, 1.3));
          ctx.fillStyle = "rgb(" + r + "," + g + "," + bl + ")";
          ctx.fillRect(f * cw, h - (k + 1) * ch, Math.ceil(cw), Math.ceil(ch));
        }
      }
      ctx.strokeStyle = "rgba(248,250,252,0.9)";
      ctx.lineWidth = 2;
      var px = ((frameIdx + 0.5) / frames) * w;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();
    }

    function drawSlice(spec, frameIdx, lang) {
      var ctx = sliceCanvas.getContext("2d");
      var w = sliceCanvas.width;
      var h = sliceCanvas.height;
      ctx.clearRect(0, 0, w, h);
      var frame = spec[Math.max(0, Math.min(spec.length - 1, frameIdx))];
      var maxV = 1e-8;
      for (var i = 0; i < frame.length; i++) maxV = Math.max(maxV, frame[i]);
      var maxBand = 0;
      ctx.strokeStyle = "#7dd3fc";
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      for (var k = 0; k < frame.length; k++) {
        if (frame[k] > frame[maxBand]) maxBand = k;
        var x = (k / (frame.length - 1)) * w;
        var y = h - (frame[k] / maxV) * (h - 14) - 7;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "#34d399";
      var mx = (maxBand / (frame.length - 1)) * w;
      var my = h - (frame[maxBand] / maxV) * (h - 14) - 7;
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, 2 * Math.PI);
      ctx.fill();
      summary.textContent = (lang.specSummary || "")
        .replace("{frames}", String(spec.length))
        .replace("{hop}", String(hop))
        .replace("{band}", String(maxBand));
      summary.style.color = "#cbd5e1";
    }

    function recompute() {
      var kind = scenarioEl.value;
      var nfft = Number(nfftEl.value);
      var scale = scaleEl.value;
      var overlapRatio = Number(overlapEl.value) / 100;
      hop = Math.max(8, Math.round(nfft * (1 - overlapRatio)));
      var noise = Number(noiseEl.value) / 220;
      signal = genSignal(kind, 3072, noise);
      var linearSpec = stftMagnitudes(signal, nfft, hop);
      mags = scale === "mel" ? melFilterbank(linearSpec, nfft, 40) : linearSpec;
      playheadEl.max = String(Math.max(0, mags.length - 1));
      var idx = Math.min(Number(playheadEl.value), mags.length - 1);
      drawWave(signal);
      drawHeatmap(mags, idx);
      drawSlice(mags, idx, currentLangPack());
    }

    function redrawOnly() {
      if (!mags.length) return;
      var idx = Math.max(0, Math.min(Number(playheadEl.value), mags.length - 1));
      drawHeatmap(mags, idx);
      drawSlice(mags, idx, currentLangPack());
    }

    [scenarioEl, nfftEl, scaleEl, overlapEl, noiseEl].forEach(function (el) {
      el.addEventListener("input", recompute);
      el.addEventListener("change", recompute);
    });
    playheadEl.addEventListener("input", redrawOnly);
    recompute();
  }

  function initWindowingSim() {
    var typeEl = byId("win-type");
    var sizeEl = byId("win-size");
    var shiftEl = byId("win-shift");
    var timeCanvas = byId("win-canvas-time");
    var specCanvas = byId("win-canvas-spec");
    if (!typeEl || !sizeEl || !shiftEl || !timeCanvas || !specCanvas) return;

    var n = 512;
    var signal = [];
    for (var i = 0; i < n; i++) {
      var t = i / n;
      signal.push(0.72 * Math.sin(2 * Math.PI * 6 * t) + 0.35 * Math.sin(2 * Math.PI * 18 * t));
    }

    function winValue(kind, idx, len) {
      if (len <= 1) return 1;
      var x = (2 * Math.PI * idx) / (len - 1);
      if (kind === "hann") return 0.5 - 0.5 * Math.cos(x);
      if (kind === "hamming") return 0.54 - 0.46 * Math.cos(x);
      return 1;
    }

    function dftMag(frame) {
      var bins = 96;
      var out = [];
      for (var k = 0; k < bins; k++) {
        var re = 0;
        var im = 0;
        for (var m = 0; m < frame.length; m++) {
          var ph = (-2 * Math.PI * k * m) / frame.length;
          re += frame[m] * Math.cos(ph);
          im += frame[m] * Math.sin(ph);
        }
        out.push(Math.sqrt(re * re + im * im));
      }
      return out;
    }

    function draw() {
      var w = timeCanvas.width;
      var h = timeCanvas.height;
      var ctx = timeCanvas.getContext("2d");
      var kind = typeEl.value;
      var len = Number(sizeEl.value);
      var shift = Number(shiftEl.value);
      if (shift + len > n) shift = n - len;

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(148,163,184,0.9)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var x = (i / (n - 1)) * w;
        var y = h * 0.5 - signal[i] * (h * 0.33);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      var x0 = (shift / (n - 1)) * w;
      var x1 = ((shift + len) / (n - 1)) * w;
      ctx.fillStyle = "rgba(56,189,248,0.12)";
      ctx.fillRect(x0, 0, Math.max(2, x1 - x0), h);

      var frame = [];
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (var j = 0; j < len; j++) {
        var idx = shift + j;
        var win = winValue(kind, j, len);
        var v = signal[idx] * win;
        frame.push(v);
        var xx = (idx / (n - 1)) * w;
        var yy = h * 0.5 - v * (h * 0.33);
        if (j === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      }
      ctx.stroke();

      var mags = dftMag(frame);
      var sctx = specCanvas.getContext("2d");
      var sw = specCanvas.width;
      var sh = specCanvas.height;
      sctx.clearRect(0, 0, sw, sh);
      var maxMag = 1e-6;
      for (var a = 0; a < mags.length; a++) maxMag = Math.max(maxMag, mags[a]);
      sctx.strokeStyle = "#7dd3fc";
      sctx.lineWidth = 1.5;
      sctx.beginPath();
      for (var b = 0; b < mags.length; b++) {
        var sx = (b / (mags.length - 1)) * sw;
        var sy = sh - (mags[b] / maxMag) * (sh - 14) - 7;
        if (b === 0) sctx.moveTo(sx, sy);
        else sctx.lineTo(sx, sy);
      }
      sctx.stroke();
    }

    [typeEl, sizeEl, shiftEl].forEach(function (el) {
      el.addEventListener("input", draw);
      el.addEventListener("change", draw);
    });
    draw();
  }

  function initSamplingSim() {
    var freqEl = byId("samp-freq");
    var rateEl = byId("samp-rate");
    var canvas = byId("samp-canvas");
    if (!freqEl || !rateEl || !canvas) return;

    function draw() {
      var ctx = canvas.getContext("2d");
      var w = canvas.width;
      var h = canvas.height;
      var f = Number(freqEl.value);
      var fs = Number(rateEl.value);
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(125,211,252,0.95)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var i = 0; i <= 1000; i++) {
        var t = i / 1000;
        var yv = Math.sin(2 * Math.PI * f * t);
        var x = t * w;
        var y = h * 0.5 - yv * (h * 0.34);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      var sampleCount = Math.max(8, Math.round(fs));
      for (var k = 0; k <= sampleCount; k++) {
        var ts = k / sampleCount;
        var ys = Math.sin(2 * Math.PI * f * ts);
        var sx = ts * w;
        var sy = h * 0.5 - ys * (h * 0.34);
        ctx.strokeStyle = "rgba(52,211,153,0.45)";
        ctx.beginPath();
        ctx.moveTo(sx, h * 0.5);
        ctx.lineTo(sx, sy);
        ctx.stroke();
        ctx.fillStyle = "#34d399";
        ctx.beginPath();
        ctx.arc(sx, sy, 3.2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    [freqEl, rateEl].forEach(function (el) {
      el.addEventListener("input", function () {
        draw();
        updateAliasNote(currentLangPack());
      });
    });
    draw();
  }

  function updateAliasNote(t) {
    var freqEl = byId("samp-freq");
    var rateEl = byId("samp-rate");
    var note = byId("alias-note");
    if (!freqEl || !rateEl || !note) return;
    var f = Number(freqEl.value || 0);
    var fs = Number(rateEl.value || 0);
    var safe = fs >= 2 * f;
    note.textContent = safe ? t.aliasSafe : t.aliasRisk;
    note.style.color = safe ? "#34d399" : "#fda4af";
  }

  function refreshSimulatorText(t) {
    updateAliasNote(t);
    var controls = ["vad-threshold", "spk-threshold", "spec-playhead"];
    controls.forEach(function (id) {
      var el = byId(id);
      if (el) el.dispatchEvent(new Event("input"));
    });
  }

  function initMfccSim() {
    var bandsEl = byId("mfcc-bands");
    var preEl = byId("mfcc-pre");
    var canvas = byId("mfcc-canvas");
    if (!bandsEl || !preEl || !canvas) return;
    function draw() {
      var bands = Number(bandsEl.value);
      var pre = Number(preEl.value) / 100;
      var ctx = canvas.getContext("2d");
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(125,211,252,0.2)";
      ctx.fillRect(0, h - 28, w, 22);
      for (var i = 0; i < bands; i++) {
        var c = (i + 0.5) / bands;
        var x = c * w;
        var bw = ((0.6 + 1.8 * c) * w) / bands;
        var peakY = h * (0.2 + 0.55 * (1 - Math.pow(c, 0.55))) * (1 - 0.25 * pre);
        ctx.beginPath();
        ctx.moveTo(x - bw * 0.5, h - 28);
        ctx.lineTo(x, peakY);
        ctx.lineTo(x + bw * 0.5, h - 28);
        ctx.closePath();
        ctx.fillStyle = "rgba(52,211,153," + (0.25 + 0.55 * (i / bands)).toFixed(3) + ")";
        ctx.fill();
      }
    }
    [bandsEl, preEl].forEach(function (el) {
      el.addEventListener("input", draw);
    });
    draw();
  }

  function initVadSim() {
    var noiseEl = byId("vad-noise");
    var thEl = byId("vad-threshold");
    var canvas = byId("vad-canvas");
    var note = byId("vad-note");
    if (!noiseEl || !thEl || !canvas || !note) return;
    function draw() {
      var lang = currentLangPack();
      var noise = Number(noiseEl.value) / 100;
      var th = Number(thEl.value) / 100;
      var ctx = canvas.getContext("2d");
      var w = canvas.width;
      var h = canvas.height;
      var frames = 72;
      var speech = 0;
      var silence = 0;
      ctx.clearRect(0, 0, w, h);
      var thY = h - th * (h - 20);
      ctx.strokeStyle = "#fda4af";
      ctx.beginPath();
      ctx.moveTo(0, thY);
      ctx.lineTo(w, thY);
      ctx.stroke();
      for (var i = 0; i < frames; i++) {
        var x = (i / frames) * w;
        var voiced = i > 12 && i < 28 || i > 40 && i < 61;
        var energy = (voiced ? 0.45 : 0.08) + noise * (0.15 + 0.65 * Math.random());
        var barH = energy * (h - 25);
        var y = h - barH;
        var isSpeech = energy >= th;
        if (isSpeech) speech++;
        else silence++;
        ctx.fillStyle = isSpeech ? "rgba(52,211,153,0.85)" : "rgba(148,163,184,0.65)";
        ctx.fillRect(x + 1, y, w / frames - 3, barH);
      }
      note.textContent = lang.vadSpeech + ": " + speech + " | " + lang.vadSilence + ": " + silence;
      note.style.color = "#cbd5e1";
    }
    [noiseEl, thEl].forEach(function (el) {
      el.addEventListener("input", draw);
    });
    draw();
  }

  function initSpeakerSim() {
    var gapEl = byId("spk-gap");
    var thEl = byId("spk-threshold");
    var canvas = byId("spk-canvas");
    var note = byId("spk-note");
    if (!gapEl || !thEl || !canvas || !note) return;
    function draw() {
      var lang = currentLangPack();
      var gap = Number(gapEl.value);
      var th = Number(thEl.value);
      var ctx = canvas.getContext("2d");
      var w = canvas.width;
      var h = canvas.height;
      var cx1 = w * 0.5 - gap * 2;
      var cy1 = h * 0.52;
      var cx2 = w * 0.5 + gap * 2;
      var cy2 = h * 0.48;
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < 26; i++) {
        var a = (i / 26) * 2 * Math.PI;
        ctx.fillStyle = "rgba(56,189,248,0.85)";
        ctx.beginPath();
        ctx.arc(cx1 + Math.cos(a) * (14 + (i % 5) * 2), cy1 + Math.sin(a) * (10 + (i % 4) * 2), 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "rgba(167,139,250,0.85)";
        ctx.beginPath();
        ctx.arc(cx2 + Math.cos(a) * (14 + (i % 6) * 2), cy2 + Math.sin(a) * (10 + (i % 3) * 2), 3, 0, 2 * Math.PI);
        ctx.fill();
      }

      var dx = cx1 - cx2;
      var dy = cy1 - cy2;
      var dist = Math.sqrt(dx * dx + dy * dy) / 4;
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx1, cy1);
      ctx.lineTo(cx2, cy2);
      ctx.stroke();

      var same = dist < th;
      note.textContent = (same ? lang.spkSame : lang.spkDiff) + " d=" + dist.toFixed(1) + ", th=" + th.toFixed(1);
      note.style.color = same ? "#34d399" : "#fda4af";
    }
    [gapEl, thEl].forEach(function (el) {
      el.addEventListener("input", draw);
    });
    draw();
  }

  function initFftStftSim() {
    var mixEl = byId("fft-mix");
    var frameEl = byId("fft-frame");
    var fftCanvas = byId("fft-canvas");
    var stftCanvas = byId("stft-canvas");
    if (!mixEl || !frameEl || !fftCanvas || !stftCanvas) return;

    function dft(sig, bins) {
      var out = [];
      for (var k = 0; k < bins; k++) {
        var re = 0;
        var im = 0;
        for (var n = 0; n < sig.length; n++) {
          var ph = (-2 * Math.PI * k * n) / sig.length;
          re += sig[n] * Math.cos(ph);
          im += sig[n] * Math.sin(ph);
        }
        out.push(Math.sqrt(re * re + im * im));
      }
      return out;
    }

    function drawLine(canvas, arr, color) {
      var ctx = canvas.getContext("2d");
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      var maxV = 1e-8;
      for (var i = 0; i < arr.length; i++) maxV = Math.max(maxV, arr[i]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var j = 0; j < arr.length; j++) {
        var x = (j / (arr.length - 1)) * w;
        var y = h - (arr[j] / maxV) * (h - 12) - 6;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function run() {
      var mix = Number(mixEl.value) / 100;
      var frameSize = Number(frameEl.value);
      var N = 1024;
      var sig = [];
      for (var i = 0; i < N; i++) {
        var t = i / N;
        var s = (1 - mix) * Math.sin(2 * Math.PI * 9 * t) + mix * 0.8 * Math.sin(2 * Math.PI * 31 * t);
        sig.push(s);
      }
      drawLine(fftCanvas, dft(sig, 160), "#93c5fd");
      var mid = 320;
      var frame = sig.slice(mid, mid + frameSize);
      while (frame.length < frameSize) frame.push(0);
      drawLine(stftCanvas, dft(frame, 160), "#34d399");
    }

    [mixEl, frameEl].forEach(function (el) {
      el.addEventListener("input", run);
    });
    run();
  }

  function initDtwSim() {
    var stretchEl = byId("dtw-stretch");
    var noiseEl = byId("dtw-noise");
    var canvas = byId("dtw-canvas");
    var note = byId("dtw-note");
    if (!stretchEl || !noiseEl || !canvas || !note) return;

    function randn() {
      var u = 1 - Math.random();
      var v = 1 - Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function buildSeq(n, stretch, noise) {
      var a = [];
      var b = [];
      for (var i = 0; i < n; i++) {
        var t1 = i / (n - 1);
        var t2 = Math.min(1, (i / (n - 1)) * stretch);
        a.push(Math.sin(2 * Math.PI * 2.2 * t1) + 0.35 * Math.sin(2 * Math.PI * 6.2 * t1));
        b.push(Math.sin(2 * Math.PI * 2.2 * t2) + 0.35 * Math.sin(2 * Math.PI * 6.2 * t2) + noise * randn());
      }
      return { a: a, b: b };
    }

    function dtwPath(a, b) {
      var n = a.length;
      var m = b.length;
      var dp = Array.from({ length: n }, function () {
        return new Array(m).fill(Infinity);
      });
      dp[0][0] = Math.abs(a[0] - b[0]);
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < m; j++) {
          var cost = Math.abs(a[i] - b[j]);
          if (i > 0) dp[i][j] = Math.min(dp[i][j], cost + dp[i - 1][j]);
          if (j > 0) dp[i][j] = Math.min(dp[i][j], cost + dp[i][j - 1]);
          if (i > 0 && j > 0) dp[i][j] = Math.min(dp[i][j], cost + dp[i - 1][j - 1]);
        }
      }
      var i = n - 1;
      var j = m - 1;
      var path = [[i, j]];
      while (i > 0 || j > 0) {
        var cands = [];
        if (i > 0) cands.push([dp[i - 1][j], i - 1, j]);
        if (j > 0) cands.push([dp[i][j - 1], i, j - 1]);
        if (i > 0 && j > 0) cands.push([dp[i - 1][j - 1], i - 1, j - 1]);
        cands.sort(function (x, y) {
          return x[0] - y[0];
        });
        i = cands[0][1];
        j = cands[0][2];
        path.push([i, j]);
      }
      return { path: path, score: dp[n - 1][m - 1] / (n + m) };
    }

    function draw() {
      var stretch = Number(stretchEl.value) / 100;
      var noise = Number(noiseEl.value) / 220;
      var seq = buildSeq(42, stretch, noise);
      var res = dtwPath(seq.a, seq.b);
      var ctx = canvas.getContext("2d");
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      var n = seq.a.length;
      var m = seq.b.length;
      var cw = w / m;
      var ch = h / n;
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < m; j++) {
          var d = Math.abs(seq.a[i] - seq.b[j]);
          var v = Math.max(0, 1 - d);
          ctx.fillStyle = "rgba(56,189,248," + (0.05 + 0.55 * v).toFixed(3) + ")";
          ctx.fillRect(j * cw, i * ch, cw + 0.2, ch + 0.2);
        }
      }
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var p = 0; p < res.path.length; p++) {
        var y = (res.path[p][0] + 0.5) * ch;
        var x = (res.path[p][1] + 0.5) * cw;
        if (p === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      note.textContent = "DTW cost: " + res.score.toFixed(4);
      note.style.color = "#cbd5e1";
    }

    [stretchEl, noiseEl].forEach(function (el) {
      el.addEventListener("input", draw);
    });
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var sel = getLangSel();
    initSimulators();
    var initLang = getInitialLang();
    setCookie(LANG_COOKIE_KEY, initLang, 365);
    if (sel) sel.value = initLang;
    setText(initLang);
    if (sel) {
      sel.addEventListener("change", function () {
        setCookie(LANG_COOKIE_KEY, sel.value, 365);
        setText(sel.value);
      });
    }
    document.querySelectorAll('.sp-float-nav a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").slice(1);
        var el = byId(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });
})();
