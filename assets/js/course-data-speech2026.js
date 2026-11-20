/* aut-speech2026 — course progress data (rendered by course-progress.js). Update `status` each week. */
(function () {
  var SP = "speech-processing.html", ST = "speech-tasks.html", ADV = "speech-processing-advanced.html", SL = "signal-lab/";
  var ax = function (id) { return "https://arxiv.org/abs/" + id; };

  var SSL_EXTRA_EN =
    "<p><b>Learning paradigms.</b> Supervised learning needs a label for every example; unsupervised learning finds structure without labels; <b>self-supervised learning (SSL)</b> creates its own targets from the data itself — for speech, by hiding part of the signal and predicting it. The model learned this way is an <b>upstream</b> (pretrained) model; a small <b>downstream</b> head is then fine-tuned for each task (ASR, speaker ID, emotion …).</p>" +
    "<table><tr><th>Idea</th><th>wav2vec 2.0 (2020)</th><th>HuBERT (2021)</th></tr>" +
    "<tr><td>Input</td><td>Raw waveform → CNN feature encoder (20 ms frames)</td><td>Same CNN encoder + transformer</td></tr>" +
    "<tr><td>Masking</td><td>Mask spans of latent frames</td><td>Mask spans of frames</td></tr>" +
    "<tr><td>Target</td><td>Contrastive: pick the true quantized latent among distractors</td><td>Predict discrete cluster IDs (k-means on MFCC, then on its own features), BERT-style</td></tr>" +
    "<tr><td>Why it works</td><td>Learns contextual representations without transcripts</td><td>Offline targets give a stable, iteratively refined teacher</td></tr></table>" +
    "<p><b>Terminology to master when reading these papers</b></p><ul>" +
    "<li><b>Codec</b> — compresses audio into bits and back. Classical codecs: <code>PCM / WAV</code> (uncompressed), <code>MP3</code>, <code>AAC</code>, <code>Vorbis</code>, <code>Opus</code> (low-latency speech &amp; music), <code>AMR-WB</code> (telephony), lossless <code>FLAC</code> and <code>ALAC</code>. Neural codecs: <b>SoundStream</b>, <b>EnCodec</b>, <b>DAC</b> (Descript Audio Codec), <b>SpeechTokenizer</b>, <b>Mimi</b>.</li>" +
    "<li><b>RVQ (residual vector quantization)</b> — several codebooks quantize what the previous ones missed; each frame becomes a stack of integer codes.</li>" +
    "<li><b>Speech unit</b> — a discrete ID from clustering SSL features (e.g., k-means on HuBERT layers); mostly phonetic / semantic content, little speaker or acoustic detail.</li>" +
    "<li><b>Speech token</b> — a discrete symbol a sequence model consumes; may be a semantic unit or an acoustic codec code (RVQ), which keeps speaker and recording detail and can be decoded back to audio.</li>" +
    "<li><b>Frame rate / bitrate</b> — tokens per second × bits per token; e.g., 75 Hz × 8 codebooks × 10 bits ≈ 6 kbps.</li></ul>";
  var SSL_EXTRA_FA =
    "<p><b>پارادایم‌های یادگیری.</b> یادگیری بانظارت برای هر نمونه برچسب می‌خواهد؛ یادگیری بدون نظارت ساختار را بدون برچسب پیدا می‌کند؛ <b>یادگیری خودنظارتی (SSL)</b> هدف‌هایش را از خود داده می‌سازد — در گفتار با پنهان کردن بخشی از سیگنال و پیش‌بینی آن. مدلی که این‌گونه آموخته می‌شود مدل <b>بالادستی (upstream)</b> یا ازپیش‌آموزش‌دیده است و سپس یک سر کوچک <b>پایین‌دستی (downstream)</b> برای هر وظیفه (بازشناسی گفتار، تشخیص گوینده، احساس …) تنظیم می‌شود.</p>" +
    "<table><tr><th>ایده</th><th>wav2vec 2.0 (۲۰۲۰)</th><th>HuBERT (۲۰۲۱)</th></tr>" +
    "<tr><td>ورودی</td><td>شکل موج خام ← رمزگذار ویژگی CNN (فریم‌های ۲۰ میلی‌ثانیه)</td><td>همان رمزگذار CNN + ترنسفورمر</td></tr>" +
    "<tr><td>پوشاندن</td><td>پوشاندن بازه‌هایی از فریم‌های نهان</td><td>پوشاندن بازه‌هایی از فریم‌ها</td></tr>" +
    "<tr><td>هدف</td><td>تقابلی: انتخاب نهانِ کوانتیزه‌شدهٔ درست میان نمونه‌های منحرف‌کننده</td><td>پیش‌بینی شناسهٔ خوشه‌ها (k-means روی MFCC و سپس روی ویژگی‌های خود مدل) به سبک BERT</td></tr>" +
    "<tr><td>چرا کار می‌کند</td><td>بازنمایی بافتاری را بدون رونوشت می‌آموزد</td><td>هدف‌های آفلاین معلمی پایدار و به‌تدریج بهتر می‌سازند</td></tr></table>" +
    "<p><b>اصطلاحاتی که هنگام خواندن این مقاله‌ها باید بدانید</b></p><ul>" +
    "<li><b>کدک (Codec)</b> — صوت را به بیت فشرده و دوباره بازسازی می‌کند. کدک‌های کلاسیک: <code>PCM / WAV</code> (بدون فشرده‌سازی)، <code>MP3</code>، <code>AAC</code>، <code>Vorbis</code>، <code>Opus</code> (کم‌تأخیر برای گفتار و موسیقی)، <code>AMR-WB</code> (مخابرات) و کدک‌های بی‌اتلاف <code>FLAC</code> و <code>ALAC</code>. کدک‌های عصبی: <b>SoundStream</b>، <b>EnCodec</b>، <b>DAC</b> (Descript Audio Codec)، <b>SpeechTokenizer</b> و <b>Mimi</b>.</li>" +
    "<li><b>RVQ (کوانتیزه‌سازی برداری باقی‌مانده)</b> — چند کتاب‌کد، هر کدام آنچه قبلی‌ها از دست داده‌اند را کوانتیزه می‌کنند؛ هر فریم به پشته‌ای از کدهای صحیح تبدیل می‌شود.</li>" +
    "<li><b>واحد گفتاری (Speech unit)</b> — شناسهٔ گسسته‌ای از خوشه‌بندی ویژگی‌های SSL (مثلاً k-means روی لایه‌های HuBERT)؛ عمدتاً محتوای آوایی/معنایی و جزئیات کمی از گوینده.</li>" +
    "<li><b>توکن گفتاری (Speech token)</b> — نمادی گسسته که مدل دنباله‌ای مصرف می‌کند؛ می‌تواند واحد معنایی یا کد صوتی کدک (RVQ) باشد که جزئیات گوینده و ضبط را نگه می‌دارد و قابل بازگشت به صوت است.</li>" +
    "<li><b>نرخ فریم / نرخ بیت</b> — توکن در ثانیه × بیت در هر توکن؛ مثلاً ۷۵ هرتز × ۸ کتاب‌کد × ۱۰ بیت ≈ ۶ کیلوبیت بر ثانیه.</li></ul>";

  window.COURSE_DATA = window.COURSE_DATA || {};
  window.COURSE_DATA["aut-speech2026"] = window.COURSE_PROGRESS = {
    id: "aut-speech2026",
    totalWeeks: 16,
    currentWeek: 7,
    elapsed: 6.5,
    termLabel: { en: "Fall 2026 · Amirkabir University of Technology", fa: "پاییز ۱۴۰۵ · دانشگاه صنعتی امیرکبیر" },
    modules: [
      { id: "A", color: "#0b2a4a", name: { en: "Signals & audio foundations", fa: "مبانی سیگنال و صوت" } },
      { id: "B", color: "#1f6f8b", name: { en: "Speech tasks & front-end", fa: "وظایف گفتار و پیش‌پردازش" } },
      { id: "C", color: "#2f7d4f", name: { en: "Recognition & self-supervised models", fa: "بازشناسی و مدل‌های خودنظارتی" } },
      { id: "D", color: "#7a3fa0", name: { en: "Applications & frontier", fa: "کاربردها و مرزهای دانش" } },
      { id: "E", color: "#a8452c", name: { en: "Trustworthy, efficient & multilingual", fa: "قابل اعتماد، کارا و چندزبانه" } },
      { id: "F", color: "#8b6914", name: { en: "Research practice & projects", fa: "روش پژوهش و پروژه" } },
    ],
    weeks: [
      {
        n: "1", module: "A", status: "done",
        title: { en: "Signal processing foundations: Fourier transform and DSP", fa: "مبانی پردازش سیگنال: تبدیل فوریه و DSP" },
        short: { en: "Fourier & DSP", fa: "فوریه و DSP" },
        summary: { en: "What a signal and a hertz are, sampling and aliasing, the Fourier transform, DFT/FFT, windowing, STFT spectrograms, filters, and the Mel scale.", fa: "سیگنال و هرتز چیست، نمونه‌برداری و همپوشانی طیفی، تبدیل فوریه، DFT/FFT، پنجره‌گذاری، طیف‌نگار STFT، فیلترها و مقیاس مل." },
        topics: { en: ["Sampling & Nyquist", "DFT / FFT", "Windowing", "STFT", "Mel & MFCC"], fa: ["نمونه‌برداری و نایکوئیست", "DFT / FFT", "پنجره‌گذاری", "STFT", "مل و MFCC"] },
        links: [
          { type: "lab", href: SL + "#fourier", label: { en: "Signal Lab · Fourier", fa: "آزمایشگاه سیگنال · فوریه" } },
          { type: "lab", href: SL + "#spectrogram", label: { en: "Signal Lab · spectrogram", fa: "آزمایشگاه سیگنال · طیف‌نگار" } },
          { type: "lab", href: SP + "#spec-studio-anchor", label: { en: "Academy · STFT studio", fa: "آکادمی · استودیوی STFT" } },
          { type: "lab", href: SP + "#mfcc-sim-anchor", label: { en: "Academy · MFCC", fa: "آکادمی · MFCC" } },
        ],
      },
      {
        n: "2", module: "A", status: "done",
        title: { en: "Audio signal libraries and tooling", fa: "کتابخانه‌ها و ابزارهای سیگنال صوتی" },
        short: { en: "Audio libraries", fa: "کتابخانه‌های صوتی" },
        summary: { en: "Loading, resampling and inspecting audio in Python; feature extraction with librosa and torchaudio; formats and I/O; prosody with Praat/Parselmouth; reproducible preprocessing.", fa: "بارگذاری، بازنمونه‌برداری و بررسی صوت در پایتون؛ استخراج ویژگی با librosa و torchaudio؛ قالب‌ها و ورودی/خروجی؛ نوای گفتار با Praat/Parselmouth؛ پیش‌پردازش تکرارپذیر." },
        topics: { en: ["librosa", "torchaudio", "soundfile", "Resampling", "Praat / Parselmouth"], fa: ["librosa", "torchaudio", "soundfile", "بازنمونه‌برداری", "Praat / Parselmouth"] },
        links: [
          { type: "code", href: "https://librosa.org/doc/latest/", label: "librosa" },
          { type: "code", href: "https://pytorch.org/audio/stable/", label: "torchaudio" },
          { type: "code", href: "https://python-soundfile.readthedocs.io/", label: "soundfile" },
          { type: "code", href: "https://parselmouth.readthedocs.io/", label: "Parselmouth (Praat)" },
          { type: "lab", href: SP + "#win-sim-anchor", label: { en: "Academy · windowing", fa: "آکادمی · پنجره‌گذاری" } },
        ],
      },
      {
        n: "3–4", module: "B", status: "done", span: 2,
        title: { en: "Speech processing tasks: speech vs non-speech and the audio task landscape", fa: "وظایف پردازش گفتار: گفتار و غیرگفتار و نقشهٔ وظایف صوتی" },
        short: { en: "Task landscape", fa: "نقشهٔ وظایف" },
        summary: { en: "What makes speech different from music and environmental sound; a taxonomy of audio tasks — recognition, speaker, paralinguistic, generation, enhancement and understanding — and how benchmarks such as SUPERB organise them.", fa: "چه چیزی گفتار را از موسیقی و صدای محیط متمایز می‌کند؛ رده‌بندی وظایف صوتی — بازشناسی، گوینده، فرازبانی، تولید، بهسازی و فهم — و نحوهٔ سازمان‌دهی آن‌ها در معیارهایی مانند SUPERB." },
        topics: { en: ["Speech / music / events", "Content vs speaker vs paralinguistics", "Generation", "Enhancement", "SUPERB tasks"], fa: ["گفتار / موسیقی / رویداد", "محتوا، گوینده و فرازبان", "تولید", "بهسازی", "وظایف SUPERB"] },
        links: [
          { type: "lab", href: ST, label: { en: "Speech Tasks (online)", fa: "وظایف گفتار (برخط)" } },
          { type: "paper", href: ax("2105.01051"), label: "SUPERB", meta: "Yang et al. 2021" },
          { type: "read", href: "https://research.google.com/audioset/", label: "AudioSet ontology" },
          { type: "read", href: "https://huggingface.co/learn/audio-course", label: "Hugging Face Audio Course" },
        ],
      },
      {
        n: "5", module: "B", status: "done",
        title: { en: "Voice activity detection with PyTorch Hub, torchaudio and friends", fa: "تشخیص فعالیت گفتار با PyTorch Hub، torchaudio و ابزارهای مشابه" },
        short: { en: "VAD", fa: "تشخیص گفتار (VAD)" },
        summary: { en: "From energy and zero-crossing rules to WebRTC VAD and neural VAD (Silero via PyTorch Hub, pyannote segmentation); frame-level metrics; VAD as the first block of every speech pipeline.", fa: "از قواعد انرژی و نرخ گذر از صفر تا WebRTC VAD و VAD عصبی (Silero از طریق PyTorch Hub و قطعه‌بندی pyannote)؛ معیارهای سطح فریم؛ VAD به‌عنوان نخستین بلوک هر سامانهٔ گفتار." },
        topics: { en: ["Energy / ZCR", "WebRTC VAD", "Silero VAD", "pyannote", "Frame F1 / DER"], fa: ["انرژی / ZCR", "WebRTC VAD", "Silero VAD", "pyannote", "F1 فریمی / DER"] },
        links: [
          { type: "lab", href: SP + "#vad-sim-anchor", label: { en: "Academy · VAD simulator", fa: "آکادمی · شبیه‌ساز VAD" } },
          { type: "code", href: "https://github.com/snakers4/silero-vad", label: "Silero VAD" },
          { type: "code", href: "https://pytorch.org/hub/snakers4_silero-vad_vad/", label: "PyTorch Hub" },
          { type: "code", href: "https://pytorch.org/audio/stable/pipelines.html", label: "torchaudio pipelines" },
          { type: "code", href: "https://github.com/pyannote/pyannote-audio", label: "pyannote.audio" },
        ],
      },
      {
        n: "6.1", module: "C", status: "done", span: 0.5,
        title: { en: "Automatic speech recognition: from HMMs to RNNs, CTC and attention", fa: "بازشناسی خودکار گفتار: از HMM تا RNN، CTC و سازوکار توجه" },
        short: { en: "ASR · HMM · RNN", fa: "ASR · HMM · RNN" },
        summary: { en: "The ASR problem and WER; DTW template matching; the classical HMM–GMM pipeline (acoustic model, lexicon, language model, decoding); RNN/LSTM acoustic models, CTC, attention encoder–decoders and RNN-T.", fa: "مسئلهٔ بازشناسی گفتار و WER؛ تطبیق الگو با DTW؛ زنجیرهٔ کلاسیک HMM–GMM (مدل آوایی، واژه‌نامه، مدل زبانی، رمزگشایی)؛ مدل‌های آوایی RNN/LSTM، CTC، رمزگذار–رمزگشای توجه‌محور و RNN-T." },
        topics: { en: ["WER / CER", "DTW", "HMM–GMM", "CTC", "LAS", "RNN-T", "Conformer"], fa: ["WER / CER", "DTW", "HMM–GMM", "CTC", "LAS", "RNN-T", "Conformer"] },
        links: [
          { type: "lab", href: SP + "#dtw-sim-anchor", label: { en: "Academy · DTW", fa: "آکادمی · DTW" } },
          { type: "lab", href: ST + "#task-asr", label: { en: "Speech Tasks · ASR", fa: "وظایف گفتار · ASR" } },
          { type: "paper", href: "https://doi.org/10.1109/5.18626", label: "A tutorial on HMMs", meta: "Rabiner 1989" },
          { type: "paper", href: "https://www.cs.toronto.edu/~graves/icml_2006.pdf", label: "CTC", meta: "Graves et al. 2006" },
          { type: "paper", href: ax("1508.01211"), label: "Listen, Attend and Spell", meta: "Chan et al. 2015" },
          { type: "paper", href: ax("2005.08100"), label: "Conformer", meta: "Gulati et al. 2020" },
        ],
      },
      {
        n: "6.2", module: "C", status: "done", span: 0.5,
        title: { en: "Self-supervised speech learning: masking, wav2vec 2.0 and HuBERT", fa: "یادگیری خودنظارتی گفتار: پوشاندن، wav2vec 2.0 و HuBERT" },
        short: { en: "SSL: wav2vec 2.0 · HuBERT", fa: "SSL: wav2vec 2.0 · HuBERT" },
        summary: { en: "How SSL differs from supervised and unsupervised learning; the masking idea from BERT to speech; paper reviews of wav2vec 2.0 and HuBERT; upstream pretraining vs downstream fine-tuning; codecs, speech units and speech tokens.", fa: "تفاوت یادگیری خودنظارتی با بانظارت و بدون نظارت؛ ایدهٔ پوشاندن از BERT تا گفتار؛ مرور مقاله‌های wav2vec 2.0 و HuBERT؛ پیش‌آموزش بالادستی در برابر تنظیم پایین‌دستی؛ کدک‌ها، واحدها و توکن‌های گفتاری." },
        topics: { en: ["Masked prediction", "Contrastive loss", "Upstream / downstream", "Neural codecs (DAC, EnCodec)", "Speech unit vs token"], fa: ["پیش‌بینی پوشیده", "زیان تقابلی", "بالادستی / پایین‌دستی", "کدک عصبی (DAC، EnCodec)", "واحد در برابر توکن"] },
        links: [
          { type: "paper", href: ax("2006.11477"), label: "wav2vec 2.0", meta: "Baevski et al. 2020" },
          { type: "paper", href: ax("2106.07447"), label: "HuBERT", meta: "Hsu et al. 2021" },
          { type: "paper", href: ax("1810.04805"), label: "BERT (masking idea)", meta: "Devlin et al. 2018" },
          { type: "paper", href: ax("2306.06546"), label: "DAC — Descript Audio Codec", meta: "Kumar et al. 2023" },
          { type: "paper", href: ax("2210.13438"), label: "EnCodec", meta: "Défossez et al. 2022" },
          { type: "paper", href: ax("2107.03312"), label: "SoundStream", meta: "Zeghidour et al. 2021" },
          { type: "lab", href: ADV + "#adv-models", label: { en: "Advanced Speech (online)", fa: "گفتار پیشرفته (برخط)" } },
        ],
        extraTitle: { en: "Paper-review notes & glossary: SSL, codecs, units vs tokens", fa: "یادداشت مرور مقاله و واژه‌نامه: SSL، کدک‌ها، واحد و توکن" },
        extra: { en: SSL_EXTRA_EN, fa: SSL_EXTRA_FA },
      },
      {
        n: "7.1", module: "C", status: "done", span: 0.5,
        title: { en: "WavLM: an upstream SSL model for full-stack speech processing", fa: "WavLM: مدل خودنظارتی بالادستی برای پردازش کامل گفتار" },
        short: { en: "WavLM review", fa: "مرور WavLM" },
        summary: { en: "Paper review of WavLM: denoising masked speech modelling with utterance mixing, gated relative position bias, large-scale data, and why it leads SUPERB on speaker, diarization and separation tasks as well as content tasks.", fa: "مرور مقالهٔ WavLM: مدل‌سازی گفتار پوشیده با حذف نویز و ترکیب گفته‌ها، بایاس موقعیت نسبی دروازه‌دار، دادهٔ بزرگ مقیاس، و دلیل برتری آن در SUPERB در وظایف گوینده، دیاریزیشن و جداسازی علاوه بر وظایف محتوایی." },
        topics: { en: ["Denoising masked prediction", "Utterance mixing", "Gated relative position bias", "Layer-wise features", "SUPERB"], fa: ["پیش‌بینی پوشیده با حذف نویز", "ترکیب گفته‌ها", "بایاس موقعیت نسبی", "ویژگی‌های لایه‌به‌لایه", "SUPERB"] },
        links: [
          { type: "paper", href: ax("2110.13900"), label: "WavLM", meta: "Chen et al. 2022" },
          { type: "paper", href: ax("2105.01051"), label: "SUPERB", meta: "Yang et al. 2021" },
        ],
      },
      {
        n: "7.2", module: "C", status: "current", span: 0.5,
        title: { en: "Whisper: large-scale weakly supervised speech recognition", fa: "Whisper: بازشناسی گفتار با نظارت ضعیف در مقیاس بزرگ" },
        short: { en: "Whisper", fa: "Whisper" },
        summary: { en: "Architecture of Whisper: 680k hours of weakly supervised data, log-Mel input, a transformer encoder–decoder, and special tokens for language ID, transcription vs translation and timestamps; zero-shot robustness; variants (large-v3, turbo, Distil-Whisper, faster-whisper).", fa: "معماری Whisper: ۶۸۰ هزار ساعت دادهٔ با نظارت ضعیف، ورودی log-Mel، رمزگذار–رمزگشای ترنسفورمری و توکن‌های ویژه برای تشخیص زبان، رونویسی در برابر ترجمه و برچسب زمانی؛ مقاومت بدون تنظیم؛ نسخه‌ها (large-v3، turbo، Distil-Whisper، faster-whisper)." },
        topics: { en: ["Weak supervision", "Encoder–decoder", "Multitask tokens", "Timestamps", "Zero-shot", "Distillation"], fa: ["نظارت ضعیف", "رمزگذار–رمزگشا", "توکن‌های چندوظیفه‌ای", "برچسب زمانی", "بدون تنظیم", "تقطیر دانش"] },
        links: [
          { type: "paper", href: ax("2212.04356"), label: "Whisper", meta: "Radford et al. 2022" },
          { type: "code", href: "https://github.com/openai/whisper", label: "openai/whisper" },
          { type: "paper", href: ax("2311.00430"), label: "Distil-Whisper", meta: "Gandhi et al. 2023" },
          { type: "code", href: "https://github.com/SYSTRAN/faster-whisper", label: "faster-whisper" },
        ],
      },
      {
        n: "8", module: "D", status: "upcoming",
        title: { en: "Speech subtasks: speaker, gender, emotion, language and diarization", fa: "زیروظایف گفتار: گوینده، جنسیت، احساس، زبان و دیاریزیشن" },
        short: { en: "Speaker & paralinguistics", fa: "گوینده و فرازبان" },
        summary: { en: "Speaker identification and verification (x-vectors, ECAPA-TDNN, EER), gender and age, speech emotion recognition, language identification, keyword spotting, and speaker diarization (\"who spoke when\", DER).", fa: "شناسایی و تأیید گوینده (x-vector، ECAPA-TDNN، EER)، جنسیت و سن، تشخیص احساس از گفتار، تشخیص زبان، تشخیص کلیدواژه و دیاریزیشن گوینده («چه کسی کی صحبت کرد»، DER)." },
        topics: { en: ["Speaker verification", "ECAPA-TDNN", "Gender / age", "Emotion", "Language ID", "Diarization / DER"], fa: ["تأیید گوینده", "ECAPA-TDNN", "جنسیت / سن", "احساس", "تشخیص زبان", "دیاریزیشن / DER"] },
        links: [
          { type: "lab", href: SP + "#spk-sim-anchor", label: { en: "Academy · speaker simulator", fa: "آکادمی · شبیه‌ساز گوینده" } },
          { type: "lab", href: ST + "#task-spk", label: { en: "Speech Tasks · speaker", fa: "وظایف گفتار · گوینده" } },
          { type: "lab", href: ST + "#task-dia", label: { en: "Speech Tasks · diarization", fa: "وظایف گفتار · دیاریزیشن" } },
          { type: "paper", href: ax("2005.07143"), label: "ECAPA-TDNN", meta: "Desplanques et al. 2020" },
          { type: "paper", href: ax("2101.09624"), label: "A review of speaker diarization", meta: "Park et al. 2021" },
          { type: "paper", href: ax("2312.15185"), label: "emotion2vec", meta: "Ma et al. 2023" },
        ],
      },
      {
        n: "9", module: "D", status: "upcoming",
        title: { en: "Cutting-edge speech processing: foundation models, tokens and codec language models", fa: "لبهٔ دانش پردازش گفتار: مدل‌های پایه، توکن‌ها و مدل‌های زبانی کدک" },
        short: { en: "Frontier", fa: "مرز دانش" },
        summary: { en: "The 2023–2026 landscape: semantic vs acoustic tokens, audio language modelling (AudioLM), codec language models (VALL-E), unified speech–text models, and how to pick a research topic that is both new and feasible.", fa: "چشم‌انداز ۲۰۲۳ تا ۲۰۲۶: توکن‌های معنایی در برابر صوتی، مدل‌سازی زبانی صوت (AudioLM)، مدل‌های زبانی کدک (VALL-E)، مدل‌های یکپارچهٔ گفتار–متن، و انتخاب موضوع پژوهشی که هم نو باشد و هم شدنی." },
        topics: { en: ["Semantic vs acoustic tokens", "AudioLM", "VALL-E", "Unified speech–text", "Choosing a topic"], fa: ["توکن معنایی در برابر صوتی", "AudioLM", "VALL-E", "گفتار–متن یکپارچه", "انتخاب موضوع"] },
        links: [
          { type: "paper", href: ax("2209.03143"), label: "AudioLM", meta: "Borsos et al. 2022" },
          { type: "paper", href: ax("2301.02111"), label: "VALL-E", meta: "Wang et al. 2023" },
          { type: "paper", href: ax("2308.16692"), label: "SpeechTokenizer", meta: "Zhang et al. 2023" },
        ],
      },
      {
        n: "10", module: "D", status: "upcoming",
        title: { en: "Speech generation: text-to-speech, vocoders and voice conversion", fa: "تولید گفتار: متن به گفتار، واکدرها و تبدیل صدا" },
        short: { en: "TTS & vocoders", fa: "TTS و واکدر" },
        summary: { en: "From Tacotron 2 and FastSpeech 2 to end-to-end VITS; neural vocoders (HiFi-GAN); zero-shot voice cloning and conversion; evaluating synthetic speech (MOS, UTMOS, intelligibility via ASR, speaker similarity).", fa: "از Tacotron 2 و FastSpeech 2 تا VITS سرتاسری؛ واکدرهای عصبی (HiFi-GAN)؛ شبیه‌سازی و تبدیل صدا بدون نمونه؛ ارزیابی گفتار ساختگی (MOS، UTMOS، وضوح از طریق ASR، شباهت گوینده)." },
        topics: { en: ["Tacotron 2", "FastSpeech 2", "VITS", "HiFi-GAN", "Voice conversion", "MOS / UTMOS"], fa: ["Tacotron 2", "FastSpeech 2", "VITS", "HiFi-GAN", "تبدیل صدا", "MOS / UTMOS"] },
        links: [
          { type: "lab", href: ST + "#task-tts", label: { en: "Speech Tasks · TTS", fa: "وظایف گفتار · TTS" } },
          { type: "paper", href: ax("1712.05884"), label: "Tacotron 2", meta: "Shen et al. 2018" },
          { type: "paper", href: ax("2006.04558"), label: "FastSpeech 2", meta: "Ren et al. 2020" },
          { type: "paper", href: ax("2106.06103"), label: "VITS", meta: "Kim et al. 2021" },
          { type: "paper", href: ax("2010.05646"), label: "HiFi-GAN", meta: "Kong et al. 2020" },
          { type: "paper", href: ax("2204.02152"), label: "UTMOS", meta: "Saeki et al. 2022" },
        ],
      },
      {
        n: "11", module: "D", status: "upcoming",
        title: { en: "Speech & audio large language models: understanding, dialogue and hallucination", fa: "مدل‌های زبانی بزرگ گفتار و صوت: فهم، گفت‌وگو و توهم" },
        short: { en: "Speech LLMs", fa: "LLMهای گفتاری" },
        summary: { en: "Connecting audio encoders to LLMs (Qwen-Audio, SALMONN), full-duplex spoken dialogue (Moshi), instruction benchmarks (Dynamic-SUPERB) — and how to audit when audio-language models hallucinate instead of listening.", fa: "اتصال رمزگذارهای صوتی به LLMها (Qwen-Audio و SALMONN)، گفت‌وگوی گفتاری دوطرفهٔ هم‌زمان (Moshi)، معیارهای دستورمحور (Dynamic-SUPERB) — و اینکه چگونه بررسی کنیم مدل‌های صوت–زبان به‌جای گوش دادن، توهم می‌زنند." },
        topics: { en: ["Audio encoder + LLM", "Instruction tuning", "Full-duplex dialogue", "Dynamic-SUPERB", "Hallucination audits"], fa: ["رمزگذار صوتی + LLM", "تنظیم با دستور", "گفت‌وگوی دوطرفه", "Dynamic-SUPERB", "بررسی توهم"] },
        links: [
          { type: "paper", href: ax("2407.10759"), label: "Qwen2-Audio", meta: "Chu et al. 2024" },
          { type: "paper", href: ax("2310.13289"), label: "SALMONN", meta: "Tang et al. 2023" },
          { type: "paper", href: ax("2410.00037"), label: "Moshi", meta: "Défossez et al. 2024" },
          { type: "paper", href: ax("2309.09510"), label: "Dynamic-SUPERB", meta: "Huang et al. 2023" },
          { type: "paper", href: ax("2610.13112"), label: "Does location matter? LALM hallucination audit", meta: "Khalooei & Sabokrou 2026" },
        ],
      },
      {
        n: "12", module: "E", status: "upcoming",
        title: { en: "Robust & trustworthy speech: enhancement, separation, anti-spoofing and security", fa: "گفتار مقاوم و قابل اعتماد: بهسازی، جداسازی، ضدجعل و امنیت" },
        short: { en: "Robust & secure", fa: "مقاوم و امن" },
        summary: { en: "Speech enhancement and source separation (Conv-TasNet, SepFormer); deepfake and spoofing detection (ASVspoof); adversarial attacks on ASR; audio watermarking (AudioSeal); privacy and fairness across speakers and accents.", fa: "بهسازی گفتار و جداسازی منابع (Conv-TasNet، SepFormer)؛ تشخیص جعل عمیق و حمله‌های جعل (ASVspoof)؛ حمله‌های خصمانه به ASR؛ واترمارک صوتی (AudioSeal)؛ حریم خصوصی و انصاف میان گویندگان و لهجه‌ها." },
        topics: { en: ["Enhancement", "Separation / SI-SDR", "Anti-spoofing / EER", "Adversarial audio", "Watermarking", "Fairness"], fa: ["بهسازی", "جداسازی / SI-SDR", "ضدجعل / EER", "صوت خصمانه", "واترمارک", "انصاف"] },
        links: [
          { type: "lab", href: ST + "#task-sep", label: { en: "Speech Tasks · separation", fa: "وظایف گفتار · جداسازی" } },
          { type: "paper", href: ax("1809.07454"), label: "Conv-TasNet", meta: "Luo & Mesgarani 2019" },
          { type: "paper", href: ax("2010.13154"), label: "SepFormer", meta: "Subakan et al. 2021" },
          { type: "paper", href: ax("1911.01601"), label: "ASVspoof 2019", meta: "Wang et al. 2020" },
          { type: "paper", href: ax("1801.01944"), label: "Audio adversarial examples", meta: "Carlini & Wagner 2018" },
          { type: "paper", href: ax("2401.17264"), label: "AudioSeal", meta: "San Roman et al. 2024" },
        ],
      },
      {
        n: "13", module: "E", status: "upcoming",
        title: { en: "Efficient, streaming and multilingual speech — with a focus on Persian", fa: "گفتار کارا، جریانی و چندزبانه — با تمرکز بر فارسی" },
        short: { en: "Efficient & multilingual", fa: "کارا و چندزبانه" },
        summary: { en: "Streaming ASR (RNN-T, Zipformer), quantization and distillation for on-device use, multilingual SSL (XLS-R, MMS), low-resource fine-tuning, and building Persian speech systems with Common Voice and similar corpora.", fa: "ASR جریانی (RNN-T، Zipformer)، کوانتیزه‌سازی و تقطیر برای اجرا روی دستگاه، SSL چندزبانه (XLS-R، MMS)، تنظیم با دادهٔ کم، و ساخت سامانه‌های گفتار فارسی با Common Voice و پیکره‌های مشابه." },
        topics: { en: ["Streaming ASR", "Zipformer", "Quantization", "XLS-R / MMS", "Low-resource", "Persian speech"], fa: ["ASR جریانی", "Zipformer", "کوانتیزه‌سازی", "XLS-R / MMS", "دادهٔ کم", "گفتار فارسی"] },
        links: [
          { type: "paper", href: ax("1211.3711"), label: "RNN-Transducer", meta: "Graves 2012" },
          { type: "paper", href: ax("2310.11230"), label: "Zipformer", meta: "Yao et al. 2023" },
          { type: "paper", href: ax("2111.09296"), label: "XLS-R", meta: "Babu et al. 2021" },
          { type: "paper", href: ax("2305.13516"), label: "MMS", meta: "Pratap et al. 2023" },
          { type: "read", href: "https://commonvoice.mozilla.org/fa", label: { en: "Common Voice · Persian", fa: "Common Voice · فارسی" } },
        ],
      },
      {
        n: "14", module: "F", status: "upcoming",
        title: { en: "Evaluation, benchmarking and research methodology in speech", fa: "ارزیابی، محک‌زنی و روش پژوهش در گفتار" },
        short: { en: "Evaluation & methods", fa: "ارزیابی و روش پژوهش" },
        summary: { en: "Choosing metrics and test sets, official scoring tools, confidence intervals and significance, ablations, reproducible recipes (ESPnet, SpeechBrain), and writing a 4-page conference-style paper.", fa: "انتخاب معیار و مجموعهٔ آزمون، ابزارهای رسمی امتیازدهی، بازهٔ اطمینان و معناداری، آزمایش‌های حذفی، دستورالعمل‌های تکرارپذیر (ESPnet، SpeechBrain) و نوشتن مقالهٔ چهارصفحه‌ای به سبک کنفرانس." },
        topics: { en: ["Metrics & test sets", "Significance", "Ablations", "Recipes", "Paper writing"], fa: ["معیار و مجموعهٔ آزمون", "معناداری آماری", "آزمایش حذفی", "دستورالعمل", "نوشتن مقاله"] },
        links: [
          { type: "paper", href: ax("1804.00015"), label: "ESPnet", meta: "Watanabe et al. 2018" },
          { type: "code", href: "https://speechbrain.github.io/", label: "SpeechBrain" },
          { type: "code", href: "https://github.com/NVIDIA/NeMo", label: "NVIDIA NeMo" },
        ],
      },
      {
        n: "15–16", module: "F", status: "upcoming", span: 2,
        title: { en: "Student research projects: conference-style presentations", fa: "پروژه‌های پژوهشی دانشجویان: ارائه به سبک کنفرانس" },
        short: { en: "Project symposium", fa: "همایش پروژه‌ها" },
        summary: { en: "Each team presents its task, ingredients, evaluation and results as a short conference talk, submits a 4-page paper and releases reproducible code.", fa: "هر تیم وظیفه، اجزا، ارزیابی و نتایج خود را در قالب ارائهٔ کوتاه کنفرانسی معرفی می‌کند، مقالهٔ چهارصفحه‌ای تحویل می‌دهد و کد تکرارپذیر منتشر می‌کند." },
        topics: { en: ["12-min talk", "4-page paper", "Code release", "Peer review"], fa: ["ارائهٔ ۱۲ دقیقه‌ای", "مقالهٔ ۴ صفحه‌ای", "انتشار کد", "داوری همتا"] },
        links: [],
      },
    ],
  };
})();
