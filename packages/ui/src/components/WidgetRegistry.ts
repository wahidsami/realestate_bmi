import React from 'react';

// Widget Category Definitions
export type WidgetCategoryType = 'TEXT' | 'BUTTONS' | 'MEDIA' | 'CONTENT' | 'SOCIAL' | 'BUSINESS' | 'CONTACT';

export interface WidgetRegistryItem {
  type: string;
  category: WidgetCategoryType;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  iconName: string; // Dynamic icon reference or string name to convert
  defaultSettings: {
    [key: string]: any;
  };
}

// Full Widget Registry mapping out all requested modules with full Arabized & English settings
export const WIDGET_REGISTRY: WidgetRegistryItem[] = [
  // ================= TEXT CATEGORY =================
  {
    type: 'heading',
    category: 'TEXT',
    labelAr: 'عنوان رئيسي',
    labelEn: 'Page Heading',
    descriptionAr: 'عنوان فخم بخطوط عربية عريضة للمشاريع والفقرات',
    descriptionEn: 'Bold headline typography for architecture sections',
    iconName: 'Type',
    defaultSettings: {
      textAr: 'عنوان القسم الفاخر',
      textEn: 'Premium Segment Title',
      align: 'right',
      color: '#0f172a',
      size: '2xl',
      typography: { fontSize: '3xl', fontWeight: 'bold', fontFamily: 'sans', lineHeight: 'snug' }
    }
  },
  {
    type: 'text',
    category: 'TEXT',
    labelAr: 'نص فقرة عادي',
    labelEn: 'Standard Text',
    descriptionAr: 'فقرة نصيّة متكاملة ومقروءة لوصف الفلل والأصول سياقياً',
    descriptionEn: 'Flowing body paragraph layout for rich summaries',
    iconName: 'AlignLeft',
    defaultSettings: {
      textAr: 'هذا النص يعبر عن الفخامة السكنية والخدمات الاستثنائية التي نقدمها لعملائنا النخبة.',
      textEn: 'This text outlines the supreme luxury residential features and outstanding quality offered.',
      align: 'right',
      color: '#475569',
      typography: { fontSize: 'base', fontWeight: 'normal', fontFamily: 'sans', lineHeight: 'relaxed' }
    }
  },
  {
    type: 'rich_text',
    category: 'TEXT',
    labelAr: 'محرر ومحتوى غني',
    labelEn: 'Rich Text Editor',
    descriptionAr: 'نص غني يدعم العناوين الفرعية المتعددة والمواد المنسقة',
    descriptionEn: 'Multi-styled text block with lists and detailed bullets',
    iconName: 'FileText',
    defaultSettings: {
      textAr: '🏡 <b>فلل الماجستيك:</b> تتميز بمسطحات خضراء واسعة.<br>✨ <b>التشطيبات:</b> رخام إيطالي بالكامل.',
      textEn: '🏡 <b>Majestic Villas:</b> Expansive landscapes.<br>✨ <b>Premium Finishes:</b> Italian marble throughout.',
      align: 'right',
      color: '#1e293b'
    }
  },
  {
    type: 'quote',
    category: 'TEXT',
    labelAr: 'اقتباس مميز',
    labelEn: 'Block Quote',
    descriptionAr: 'نص كبينة أو مقولة حكيمة من المدير أو العميل بإطار جمالي',
    descriptionEn: 'Highlighted quote bordered container for prestige testimonials',
    iconName: 'ChevronDown',
    defaultSettings: {
      textAr: 'المنزل ليس مجرد مساحة نعيش فيها، بل هو لوحة ومستقبل مجيد.',
      textEn: 'A luxury home is not just a place to live, it is a canvas of legacy and prestige.',
      authorAr: 'المهندس كريم الشافعي',
      authorEn: 'Eng. Kareem Al-Shafei',
      color: '#d4af37'
    }
  },
  {
    type: 'list',
    category: 'TEXT',
    labelAr: 'قائمة نقطية فاخرة',
    labelEn: 'Feature List',
    descriptionAr: 'عناصر مرقمة أو نقطية لعرض المميزات السكنية والمنافع العقارية',
    descriptionEn: 'Gleaming bullet-point checklist for property amenities',
    iconName: 'List',
    defaultSettings: {
      itemsAr: ['مسبح infinity زجاجي', 'نظام ذكي متكامل من Crestron', 'حراسة طوال ٢٤ ساعة', 'إطلالة بنورامية كاملة'],
      itemsEn: ['Infinity glass pool', 'Premium Crestron smart automation', '24/7 Elite security force', 'Panoramic high-vantage views'],
      bulletColor: '#d4af37',
      align: 'right'
    }
  },
  {
    type: 'table',
    category: 'TEXT',
    labelAr: 'جدول مواصفات وفير',
    labelEn: 'Data Table',
    descriptionAr: 'جدول منسق لمقارنة المساحات، الأسعار، أو مواصفات الفلل الكبرى',
    descriptionEn: 'Clean spec grid for area dimensions, unit counts and pricing tiers',
    iconName: 'Table',
    defaultSettings: {
      headersAr: ['الميزة', 'الفيلا النموذجية', 'الفيلا الرئاسية'],
      headersEn: ['Specification', 'Model Villa', 'Presidential Villa'],
      rowsAr: [
        ['المساحة الإجمالية', '٦٠٠ م²', '١٢٠٠ م²'],
        ['الغرف الرئيسية', '٤ أجنحة نوم', '٧ أجنحة ملكية'],
        ['مواقف السيارات', 'موقفين مظللين', 'قبو يتسع لـ ٥ سيارات']
      ],
      rowsEn: [
        ['Total Land Area', '600 SQM', '1200 SQM'],
        ['Master Suites', '4 Luxury Chambers', '7 King Chambers'],
        ['Car Parking Slots', '2 Covered Garages', 'Basement for 5 vehicles']
      ],
      headBg: '#1e293b',
      testColor: '#000000'
    }
  },
  {
    type: 'divider',
    category: 'TEXT',
    labelAr: 'فاصل خطي مزخرف',
    labelEn: 'Styled Divider',
    descriptionAr: 'خط فاصل أفقي متناسق بين أقسام الصفحة بستايل ذهبي أو رمادي',
    descriptionEn: 'Sleek geometric split line for structural page rhythm',
    iconName: 'Minus',
    defaultSettings: {
      styleType: 'solid', // solid, dashed, gold-dots, double
      color: '#e2e8f0',
      thickness: '2px',
      spacingY: 'medium'
    }
  },
  {
    type: 'spacer',
    category: 'TEXT',
    labelAr: 'مساحة فراغية مرنة',
    labelEn: 'Vertical Spacer',
    descriptionAr: 'عنصر فارغ لفصل المكونات وضمان اتساع الهوامش وراحة القراءة وتحسين المحاذاة',
    descriptionEn: 'Adaptive heights generator for custom responsive spacing',
    iconName: 'Space',
    defaultSettings: {
      heightDesktop: '40px',
      heightMobile: '20px'
    }
  },

  // ================= BUTTONS CATEGORY =================
  {
    type: 'button',
    category: 'BUTTONS',
    labelAr: 'زر أحادي مخصص',
    labelEn: 'Call to Action Button',
    descriptionAr: 'زر توجيه تفاعلي وحيد برابط للمشاريع والاتصال الفوري',
    descriptionEn: 'High-contrast action touchpoint for page navigation',
    iconName: 'Square',
    defaultSettings: {
      textAr: 'تصفح الفلل المعروضة',
      textEn: 'View Prestigious Villas',
      buttonLink: '/properties',
      color: '#0f172a',
      textColor: '#ffffff',
      align: 'right',
      variant: 'solid'
    }
  },
  {
    type: 'dual_button',
    category: 'BUTTONS',
    labelAr: 'زرين متجاورين بذكاء',
    labelEn: 'Dual Interactive Buttons',
    descriptionAr: 'زرين للمقارنة أو التوجيه لوجهتين مختلفتين (رئيسية وثانوية)',
    descriptionEn: 'Paired action prompts for double conversion routing',
    iconName: 'Columns',
    defaultSettings: {
      primaryAr: 'احجز جولة خاصة',
      primaryEn: 'Book VIP Tour',
      primaryLink: '/book',
      secondaryAr: 'تحميل الكتيب',
      secondaryEn: 'Download Brochure',
      secondaryLink: '/files',
      align: 'center'
    }
  },
  {
    type: 'call_button',
    category: 'BUTTONS',
    labelAr: 'زر مكالمة هاتفية فورية',
    labelEn: 'Phone Direct-Call Button',
    descriptionAr: 'زر اتصال مباشر مجهز بأرقام هاتفية لربط المبيعات فوراً بالعملاء المهتمين',
    descriptionEn: 'Click-to-call direct telecommunication trigger',
    iconName: 'Smartphone',
    defaultSettings: {
      textAr: 'اتصال بوكيل المبيعات الملكي',
      textEn: 'Call Elite Advisor Now',
      phoneNumber: '+966500000000',
      color: '#047857'
    }
  },
  {
    type: 'whatsapp_button',
    category: 'BUTTONS',
    labelAr: 'محادثة واتساب سريعة',
    labelEn: 'WhatsApp Engagement Trigger',
    descriptionAr: 'زر عائم أو ثابت للمراسلة المباشرة عبر واتساب بنص رسالة ترحيبية مهيأة مسبقاً',
    descriptionEn: 'Speedy chat routing with pre-filled enquiry drafts',
    iconName: 'MessageSquare',
    defaultSettings: {
      textAr: 'استفسر فوراً عبر واتساب',
      textEn: 'Instant WhatsApp Enquiry',
      phoneNumber: '966500000000',
      customMessage: 'مرحباً، أرغب بالاستفسار عن فلل مشروع ريزيدنس الفاخر.'
    }
  },
  {
    type: 'share_button',
    category: 'BUTTONS',
    labelAr: 'مشاركة الصفحة والنشر',
    labelEn: 'Content Share Hub',
    descriptionAr: 'زر لمشاركة الصفحة والأصل العقاري عبر توتير، واتساب، أو بنسخ الرابط المباشر',
    descriptionEn: 'One-click modern browser sharing API fallback',
    iconName: 'Share2',
    defaultSettings: {
      textAr: 'مشاركة الصفحة العقارية',
      textEn: 'Share Investment Details',
      color: '#1e293b'
    }
  },

  // ================= MEDIA CATEGORY =================
  {
    type: 'image',
    category: 'MEDIA',
    labelAr: 'صورة مفردة فاخرة',
    labelEn: 'Premium Image Banner',
    descriptionAr: 'صورة مبهرة بجودة كاملة لإبراز تفاصيل الديكور الواسع أو العمارة الخارجية',
    descriptionEn: 'High-definition showcase item with bespoke overlays',
    iconName: 'Image',
    defaultSettings: {
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: '16:9',
      altAr: 'واجهة القصر الرئاسي المهيب',
      altEn: 'Sovereign Palace Grand Facade',
      customRadius: 'lg'
    }
  },
  {
    type: 'gallery',
    category: 'MEDIA',
    labelAr: 'معرض صور مصغر',
    labelEn: 'Architectural Gallery',
    descriptionAr: 'شبكة رائعة تعرض لقطات غرف النوم، الصالونات الفسيحة، والمحيط الخارجي للأصل',
    descriptionEn: 'Breezy multi-column grid exhibiting finest spaces layout',
    iconName: 'Grid',
    defaultSettings: {
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80'
      ],
      columns: 4,
      spacing: 'md'
    }
  },
  {
    type: 'carousel',
    category: 'MEDIA',
    labelAr: 'شريحة عرض تفاعلية',
    labelEn: 'Image Slider Carousel',
    descriptionAr: 'سلايدر متنقل بسلاسة يمكن للعميل تدوير صوره يميناً ويساراً',
    descriptionEn: 'Interactive touch-slider cycling pristine visual renders',
    iconName: 'Slideshow',
    defaultSettings: {
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
      ],
      autoplay: true,
      delay: 5000,
      showArrows: true
    }
  },
  {
    type: 'video',
    category: 'MEDIA',
    labelAr: 'مشغل فيديو سينمائي',
    labelEn: 'Cinematic Video Player',
    descriptionAr: 'تضمين فيديو ترويجي للأصل من يوتيوب، أو فيميو لدعم الواقع الافتراضي',
    descriptionEn: 'Embed HD drone tours from YouTube or Vimeo servers',
    iconName: 'Film',
    defaultSettings: {
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      aspectRatio: '16:9',
      autoplay: false
    }
  },
  {
    type: 'logo_grid',
    category: 'MEDIA',
    labelAr: 'شبكة شعارات الشركاء والمكاتب',
    labelEn: 'Corporate Affiliates Logo Grid',
    descriptionAr: 'عرض شعارات الشركات الفاخرة والمكاتب الهندسية المتحالفة بلون مونوكروم هادئ',
    descriptionEn: 'Minimalist monochrome grid of premier structural partners',
    iconName: 'LayoutGrid',
    defaultSettings: {
      logos: [
        { name: 'Architecture Lab', url: 'https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?auto=format&fit=crop&w=120&q=80' },
        { name: 'Elite Build Co', url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80' },
        { name: 'Royal Interior', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=120&q=80' }
      ],
      grayscale: true,
      cols: 3
    }
  },

  // ================= CONTENT CATEGORY =================
  {
    type: 'accordion',
    category: 'CONTENT',
    labelAr: 'أكورديون منسدل مدمج',
    labelEn: 'Interactive Accordion',
    descriptionAr: 'قوائم قابلة للطي لتقليل الزحام البصري وتقسيم الشروط والأحكام الفنية',
    descriptionEn: 'Elegant collapse containers saving digital screen real estate',
    iconName: 'ChevronDown',
    defaultSettings: {
      itemsAr: [
        { title: 'مواد البناء وبياض الجدران الخارجية', content: 'نستخدم حجر الرياض الطبيعي النخب الأول مع حماية رطوبة ونظام عزل مائي وحراري متكامل.' },
        { title: 'فترات الضمان والتشغيل والتشييد', content: 'ضمان ١٠ سنوات على أعمال الهيكل الإنشائي والخرساني وضمان سنتين للتركيبات الكهربائية والأسبات.' }
      ],
      itemsEn: [
        { title: 'Structural Materials & Cladding Specs', content: 'We deploy authentic first-tier Riyadh Natural Stone with built-in moisture protection systems.' },
        { title: 'Guarantees, Warranties & Construction Security', content: '10 years comprehensive guarantee on the concrete structural framework and slab engineering.' }
      ],
      accentColor: '#d4af37'
    }
  },
  {
    type: 'faq',
    category: 'CONTENT',
    labelAr: 'الأسئلة الشائعة والمتكررة',
    labelEn: 'Bespoke FAQ Block',
    descriptionAr: 'هيكل متكامل ومحسّن لمحركات البحث لعرض الأسئلة الفنية حول صفقات الاستثمار العقاري',
    descriptionEn: 'Structured layout answering frequent Elite investor questions',
    iconName: 'HelpCircle',
    defaultSettings: {
      questionsAr: [
        { q: 'ما هي شروط الدفع وجدولة الدفعات الاستثمارية؟', a: 'دفعة أولى ٢٥٪ عند التوقيع، وتلتزم بالمقاصة السنوية والمستندات بانتظام.' },
        { q: 'هل توجد تسهيلات لخدمة المطار والاستقبال؟', a: 'بالتأكيد، توفر باقة النخبة خدمة التوصيل الخاص بلموزين بنتلي من المطار للأجنحة الخاصة بنا.' }
      ],
      questionsEn: [
        { q: 'What is the payment schedule for residential tiers?', a: '25% initial down-payment, with subsequent structural milestone installments.' },
        { q: 'Are private jet reception protocols active?', a: 'Yes. Our premium Elite plan boasts full luxury concierge airport collection directly to the estate.' }
      ]
    }
  },
  {
    type: 'tabs',
    category: 'CONTENT',
    labelAr: 'قوائم التبويب العلوية',
    labelEn: 'Multi-Tab Navigable Panels',
    descriptionAr: 'تقسيم المحتوى لعدة تابات (مثال: الشريحة الأولى للمخطط، الثانية للصور، الثالثة للمعايير)',
    descriptionEn: 'Tabbed sections helping users toggle views dynamically',
    iconName: 'Layers',
    defaultSettings: {
      tabsAr: [
        { title: 'المخطط الهندسي', content: 'يغطي هذا المخطط أوتلوك 💡 المربع الـ٥ من التقسيم الكلي بمساحات شاسعة.' },
        { title: 'الميزات الجغرافية', content: 'يقع القصر في أرقى مجمعات الرياض الدبلوماسية متميزاً بالأمان والهدوء الشامل.' }
      ],
      tabsEn: [
        { title: 'Floor Blueprint Layout', content: 'This architectural blueprint maps the 5-room layout with meticulous symmetry.' },
        { title: 'District Advantages', content: 'Sited inside the VIP sovereign diplomatic district, optimizing strict security and quietude.' }
      ],
      activeTabIdx: 0
    }
  },
  {
    type: 'timeline',
    category: 'CONTENT',
    labelAr: 'الخط الزمني للمراحل والتسليم',
    labelEn: 'Milestone Timeline',
    descriptionAr: 'عرض مرئي وعام لخطوات تشييد العقار وتسليم العميل للمفاتيح بوضوح',
    descriptionEn: 'Historic roadmap charting building construction, phase completion, and handover',
    iconName: 'Clock',
    defaultSettings: {
      eventsAr: [
        { date: 'المرحلة الأولى', title: 'صبت الخرسانة الأساسية والهيكل الإنشائي العام', completed: true },
        { date: 'المرحلة الثانية', title: 'التشطيب الأساسي وتركيب الزجاج العائم الحراري', completed: false }
      ],
      eventsEn: [
        { date: 'Phase 1', title: 'Complete concrete structural pouring and steel foundation setup', completed: true },
        { date: 'Phase 2', title: 'Bespoke architectural glass framing and acoustic insulation', completed: false }
      ]
    }
  },
  {
    type: 'feature_list',
    category: 'CONTENT',
    labelAr: 'قائمة المميزات الأيقونية',
    labelEn: 'Bespoke Iconized Features',
    descriptionAr: 'سرد المميزات بإيقونة مخصصة بجانب كل سطر نصي لإثراء المظهر البصري',
    descriptionEn: 'Feature block displaying custom-selected micro icon highlights',
    iconName: 'CheckSquare',
    defaultSettings: {
      featuresAr: [
        { title: 'تكييف مركزي منفصل ومخفي شاهق الجودة', desc: 'نظام دايكن دي في آر في الموفر الذكي للطاقة لضمان برودة وصحة كاملتين.' },
        { title: 'مصعد غامر شفاف بانورامي ذكي', desc: 'بسعة حركية تتسع لـ ٦ أشخاص بنظام هيدروليكي آمن وصامت كلياً.' }
      ],
      featuresEn: [
        { title: 'Daikin VRV Silent Climate System', desc: 'Multi-zoned energy efficient system guaranteeing cooling on worst summer days.' },
        { title: 'Panoramic Transparent Hydraulic Elevator', desc: 'With a high load capacity for 6 guests, moving in serene near-absolute silence.' }
      ]
    }
  },
  {
    type: 'feature_grid',
    category: 'CONTENT',
    labelAr: 'شبكة مزايا وعناصر بنتوس',
    labelEn: 'Grid of Architectural Highlights',
    descriptionAr: 'شبكة أو مصفوفة ثلاثية لعرض الميزات (صالة سينما، نظام ذكي، أمن متواصل)',
    descriptionEn: 'Trio-bento framework featuring top amenities under spacious cards',
    iconName: 'LayoutGrid',
    defaultSettings: {
      cardsAr: [
        { title: '🍿 سينما عائلية كبرى', desc: 'شاشة عملاقة ليزرية بنظام صوتي غامر ذي ١١ قناة صوتية سينمائية.' },
        { title: '👮‍♀️ أمن وحماية النخبة', desc: 'حراسة مدرجة وأبواب بيومترية دائرية تعمل ببصمات الوجه.' },
        { title: '🍷 قبو الذواقة الخاص', desc: 'نظام عزل ومحاذاة لحفظ المشروبات الطازجة واللحوم الباردة.' }
      ],
      cardsEn: [
        { title: '🍿 Grand Home Cinema', desc: 'Expansive laser display paired with an 11-channel Dolby-Atmos setup.' },
        { title: '👮‍♀️ Sovereign Biotech Security', desc: 'Surveillance systems with high biometric access control.' },
        { title: '🍷 Wine & Gourmet Vault', desc: 'Sealed humidor with climate regulators designed to store collectables.' }
      ]
    }
  },
  {
    type: 'amenities_section',
    category: 'CONTENT',
    labelAr: 'قسم الخدمات والأيقونات',
    labelEn: 'Amenities & Dynamic Icons',
    descriptionAr: 'مصفوفة أيقونات تفاعلية للخدمات والرفاهية المخصصة للاستخدام في الصفحات والمشاريع',
    descriptionEn: 'Interactive grid of custom amenities mapped with modern icons and labels',
    iconName: 'Sparkles',
    defaultSettings: {
      titleAr: 'تجهيزات الرفاهية والراحة المتكاملة',
      titleEn: 'Comprehensive Conveniences & Amenities',
      amenities: [
        { labelAr: 'موقف سيارات فسيح', labelEn: 'Spacious Parking', icon: 'car' },
        { labelAr: 'مسبح أوليمبي دافئ', labelEn: 'Heated Olympic Pool', icon: 'waves' },
        { labelAr: 'صالة رياضية متكاملة', labelEn: 'State-of-art Gym', icon: 'dumbbell' },
        { labelAr: 'أنظمة تحكم ذكية بالكامل', labelEn: 'Full Smart-home Automation', icon: 'cpu' },
        { labelAr: 'اتصال إنترنت بحد أقصى', labelEn: 'High-speed Fiber Wi-Fi', icon: 'wifi' },
        { labelAr: 'حراسة وأمن على مدار الساعة', labelEn: '24/7 Premium Security', icon: 'shield' },
        { labelAr: 'حدائق ومساحة خضراء', labelEn: 'Scenic Botanical Gardens', icon: 'trees' },
        { labelAr: 'غرفة نوم للخدمة', labelEn: "Private Maid's Room", icon: 'bed' }
      ]
    }
  },
  {
    type: 'pricing_table',
    category: 'CONTENT',
    labelAr: 'جدول أسعار الباقات والفلل',
    labelEn: 'Pricing Matrix & Investment Tiers',
    descriptionAr: 'بطاقات ترخيص وتوزيع الأسعار للمستثمرين بنقاط مقارنة وحث مباشر على الشراء',
    descriptionEn: 'Bold price columns targeting international commercial investors',
    iconName: 'Tag',
    defaultSettings: {
      tiersAr: [
        { name: 'جناح بنتهاوس التميز', price: '١٤,٥٠٠,٠٠٠ ر.س', features: ['٤ غرف ماستر مجهزة', 'مسبح خاص مع تراس علوي', 'خدمة الكونسيرج الملكي لعام كامل'], buttonText: 'احجز تملك فوري', hot: false },
        { name: 'القصر الكاردينالي الملكي', price: '٣٢,٠٠٠,٠٠٠ ر.س', features: ['٧ أجنحة ترف ملكية', 'صالة عرض سينمائي مجهزة', 'مهبط طائرات هليكوبتر مستقل و٣ حدائق'], buttonText: 'تواصل لصفقة خاصة', hot: true }
      ],
      tiersEn: [
        { name: 'Excellent Penthouse Suite', price: 'SAR 14,500,000', features: ['4 Fully-fitted master suites', 'Private skydeck infinity pool', 'Sovereign concierge care for 1 year'], buttonText: 'Secure Direct Purchase', hot: false },
        { name: 'Royal Cardinal Palace', price: 'SAR 32,000,000', features: ['7 Master king suites', 'Fully equipped boutique cinema', 'Helipad & 3 extensive gardens'], buttonText: 'Contact for Elite Acquisition', hot: true }
      ]
    }
  },
  {
    type: 'property_grid',
    category: 'CONTENT',
    labelAr: 'عقارات مميزة شبكية',
    labelEn: 'Featured Properties Grid',
    descriptionAr: 'شبكة عقارية مميزة قابلة للتعديل مع زر عرض الكل للانتقال إلى صفحة العقارات',
    descriptionEn: 'Editable featured inventory grid with a built-in Show All action button',
    iconName: 'LayoutGrid',
    defaultSettings: {
      titleAr: 'العقارات المميزة',
      titleEn: 'Featured Properties',
      subtitleAr: 'استعرض مجموعة مختارة من أفضل الوحدات العقارية المتاحة',
      subtitleEn: 'Explore a curated collection of premium residences currently available',
      backgroundMode: 'solid',
      backgroundColor: '#0b1020',
      backgroundImageUrl: '',
      backgroundImageOverlayOpacity: 65,
      showFeaturedOnly: true,
      showPrice: true,
      showSpecs: true,
      limit: 6,
      columnsDesktop: 3,
      showAllButtonTextAr: 'عرض الكل',
      showAllButtonTextEn: 'Show All',
      showAllButtonLink: '/properties'
    }
  },

  // ================= SOCIAL CATEGORY =================
  {
    type: 'testimonials',
    category: 'SOCIAL',
    labelAr: 'آراء وشهادات النخبة',
    labelEn: 'Luxury Client Testimonials',
    descriptionAr: 'قوالب شهادات العملاء بأسماء وصور مصممة برقي لإقناع المترددين',
    descriptionEn: 'Pragmatic testimonial cards illustrating real-estate investments success',
    iconName: 'UserCheck',
    defaultSettings: {
      itemsAr: [
        { name: 'صاحب السمو الأمير فهد بن عبدالله', title: 'مستثمر عقاري دولي', quote: 'لقد تجاوز تخطيط الفلل وجودة التشييد التوقعات، إنهم يقدمون تحفة معمارية تستحق الثقة والتاريخ.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' }
      ],
      itemsEn: [
        { name: 'H.H. Prince Fahad Al-Saud', title: 'International Sovereign Investor', quote: 'The level of layout craftsmanship and materials choice is unprecedented. They delivered a true living masterpiece.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' }
      ]
    }
  },
  {
    type: 'reviews',
    category: 'SOCIAL',
    labelAr: 'شهادات المنصات والشركاء',
    labelEn: 'Industry Platform Reviews',
    descriptionAr: 'تقييمات مجمعة من جوجل، أو هاب، أو العقارية برقم نجمي مميز',
    descriptionEn: 'Aggregated client reviews with structural platform branding',
    iconName: 'MessageCircle',
    defaultSettings: {
      platformAr: 'تصنيف الهيئة العقارية السعودية',
      platformEn: 'Saudi Real Estate Authority Tier',
      score: '٤.٩/٥',
      textAr: 'حائز على تصنيف التميز السكني والجودة البنائية للمباني الفريدة.',
      textEn: 'Ranked the premier developer of unique architectural layouts is Saudi Arabia.'
    }
  },
  {
    type: 'ratings',
    category: 'SOCIAL',
    labelAr: 'درجات النجوم والتقييم',
    labelEn: 'Dynamic Star Ratings',
    descriptionAr: 'مؤشر النجوم الخمس مع ملخص رقمي يدعم النطاق المعماري والمصداقية',
    descriptionEn: 'Glowing five-star ratings block verifying high client trust',
    iconName: 'Star',
    defaultSettings: {
      stars: 5,
      labelAr: 'ثقة تفوق الـ ٩٩٪ من عملائنا النخبة',
      labelEn: 'Acclaimed by 99.8% of our premium VIP clients',
      color: '#d4af37'
    }
  },
  {
    type: 'client_logos',
    category: 'SOCIAL',
    labelAr: 'لوحات شعارات الشركاء والعملاء الكبار',
    labelEn: 'Distinguished Client Logos',
    descriptionAr: 'شعارات المطورين والجهات الحليفة في صفقاتنا الضخمة بالمملكة وخارجها',
    descriptionEn: 'Symmetrical logo banner of prestigious firms we have collaborated with',
    iconName: 'Award',
    defaultSettings: {
      images: [
        'https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?auto=format&fit=crop&w=120&q=80',
        'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80',
        'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=120&q=80'
      ],
      invert: true
    }
  },

  // ================= BUSINESS CATEGORY =================
  {
    type: 'statistics',
    category: 'BUSINESS',
    labelAr: 'إحصائيات وقوة الشركة بالأرقام',
    labelEn: 'KPI Statistics Banner',
    descriptionAr: 'عرض مرئي فاخر لأرقام النجاح (أرقام المبيعات السنوية، عدد الفلل الفخمة المنجزة)',
    descriptionEn: 'Visual statistics grid boosting investor alignment and corporate authority',
    iconName: 'BarChart3',
    defaultSettings: {
      statsAr: [
        { number: '٤.٢ مليار ر.س', label: 'إجمالي المبيعات والأصول المدارة' },
        { number: '+٢٥٠ قصر', label: 'تم بناؤها وتسليمها بالكامل بريزيدنس' }
      ],
      statsEn: [
        { number: 'SAR 4.2B', label: 'Total managed properties portfolio value' },
        { number: '+250 Mansions', label: 'Fully designed and delivered to clients' }
      ]
    }
  },
  {
    type: 'counters',
    category: 'BUSINESS',
    labelAr: 'عداد تزايدي ذكي',
    labelEn: 'Progressive Numbers Counter',
    descriptionAr: 'تسمح الأرقام المتزايدة بإظهار تمدد مساحات الأراضي الإجمالية المطورة',
    descriptionEn: 'Milestone numbers scaling up live on customer loading',
    iconName: 'Timer',
    defaultSettings: {
      targetNumber: 840,
      suffixAr: 'ألف متر مربع مطور',
      suffixEn: 'K Sq. Meters Developed',
      speed: 2000
    }
  },
  {
    type: 'team_members',
    category: 'BUSINESS',
    labelAr: 'لوحة القيادة والمستشارين',
    labelEn: 'Executive Leadership Profile',
    descriptionAr: 'عرض كوادر الهيئة التنفيذية ببطاقات مصقولة لرفع الموثوقية المهنية للشركة',
    descriptionEn: 'Sleek executive directory mapping premier advisors and partners',
    iconName: 'Users2',
    defaultSettings: {
      membersAr: [
        { name: 'المهندس عبدالرحمن العلي', role: 'الرئيس التنفيذي للتطوير الهندسي', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80' }
      ],
      membersEn: [
        { name: 'Eng. Abdulrahman Al-Ali', role: 'Chief Executive of Architectural Engineering', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80' }
      ]
    }
  },
  {
    type: 'services',
    category: 'BUSINESS',
    labelAr: 'خدماتنا الاستثنائية والحلول',
    labelEn: 'Bespoke Advisory Services',
    descriptionAr: 'قوائم تفصيلية للخدمات: الاستشارات السكنية، إدارة الأملاك، التطوير العقاري الدولي',
    descriptionEn: 'Symmetrical grids detailing concierge acquisition & real estate asset structuring',
    iconName: 'Briefcase',
    defaultSettings: {
      servicesAr: [
        { title: '🏛️ الاستثمار الاستثنائي والمغلق', desc: 'نقدم صفقات غير معلنة للاستحواذ الخاص بنسب أرباح مضمونة.' },
        { title: '📐 التصاميم المعمارية المستوحاة', desc: 'بناء مخططات الفلل الإيطالية والحديثة من كبار مهندسي إيطاليا.' }
      ],
      servicesEn: [
        { title: '🏛️ Off-Market VIP Acquisitions', desc: 'Introducing un-listed rare premium properties in Saudi Arabia.' },
        { title: '📐 Authentic Roman Aesthetics', desc: 'Drafting pristine floorplans designed by top interior experts.' }
      ]
    }
  },
  {
    type: 'portfolio',
    category: 'BUSINESS',
    labelAr: 'كتيب المحفظة العقارية',
    labelEn: 'Investment Portfolio Brochure',
    descriptionAr: 'شكل تفصيلي فريد لاستعراض مخططات ومسافات ومواقع المحافظ الاستثمارية النشطة للشركة',
    descriptionEn: 'Detailed portfolio overview with download buttons for accredited global entities',
    iconName: 'GalleryHorizontal',
    defaultSettings: {
      titleAr: 'عقود الاستثمار العقاري لعام ٢٠٢٦',
      titleEn: 'Dynamic Real Estate Portfolios FY2026',
      brochureLink: '#',
      totalActiveVillas: '٣٤ قصر قيد التطوير المباشر'
    }
  },
  {
    type: 'projects',
    category: 'BUSINESS',
    labelAr: 'المشاريع الكبرى قيد الإنشاء',
    labelEn: 'Grand Projects Master directory',
    descriptionAr: 'مجموعة بطاقات للمشاريع الإنشائية العملاقة بنسب اكتمال وإحصاءات حية للعمل',
    descriptionEn: 'Dynamic showcase of structural projects under development with completion percentages',
    iconName: 'Kanban',
    defaultSettings: {
      projectsAr: [
        { name: 'درة الرياض هايتس', location: 'حي حطين، الرياض', progress: 85, cover: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80' }
      ],
      projectsEn: [
        { name: 'Elite Riyadh Heights', location: 'Hittin District, Riyadh', progress: 85, cover: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80' }
      ]
    }
  },

  // ================= CONTACT CATEGORY =================
  {
    type: 'contact_form',
    category: 'CONTACT',
    labelAr: 'نموذج تواصل راقٍ',
    labelEn: 'Consultation Form',
    descriptionAr: 'نموذج إدخال لاسم وجوال وبريد العميل لحجز المواعيد والفلل المتاحة مع استقبال بالخلفية',
    descriptionEn: 'Fully integrated contact form capturing prospect lead data into the platform',
    iconName: 'Mail',
    defaultSettings: {
      buttonTextAr: 'طلب اتصال واستشارة من وكيل خاص',
      buttonTextEn: 'Request Private Call & Consultation',
      placeholderNameAr: 'الاسم الكريم بالكامل',
      placeholderNameEn: 'Your Full Noble Name',
      submittingTextAr: 'جاري مراجعة طلب الاستشارة السكنية...',
      submittingTextEn: 'Notifying sales advisors...'
    }
  },
  {
    type: 'newsletter',
    category: 'CONTACT',
    labelAr: 'نشرة بريدية لكبار المستثمرين',
    labelEn: 'Elite Newsletter Subscription',
    descriptionAr: 'صندوق بسيط لرفع بريد كبار المهتمين بإخبار الصفقات العقارية المخفية ومستحدثاتها',
    descriptionEn: 'Clean subscription input feeding exclusive off-market releases digest to inbox',
    iconName: 'Send',
    defaultSettings: {
      titleAr: 'كن أول من يعلم بإطلاق الصفقات العقارية الخاصة',
      titleEn: 'Subscribe to Off-Market Releases',
      buttonTextAr: 'انضم لقائمة النخبة البريدية',
      buttonTextEn: 'Join VIP Newsletter List'
    }
  },
  {
    type: 'map',
    category: 'CONTACT',
    labelAr: 'خريطة تفاعلية جغرافية',
    labelEn: 'Interactive Satellite Map',
    descriptionAr: 'خريطة مدمجة من قوقل لتحديد إحداثيات ومرافق المشروع والأراضي القريبة به',
    descriptionEn: 'Interactive iframe map pinning the high-value property development location',
    iconName: 'MapPin',
    defaultSettings: {
      coordinates: 'Riyadh, Saudi Arabia',
      zoom: 14,
      embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115915.695379667!2d46.6046777!3d24.7135517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d48939b%3A0xf2aa23c67621255a!2sRiyadh%20Saudi%20Arabia!5e0!3m2!1sen!2sus!4v1687399812491!5m2!1sen!2sus'
    }
  },
  {
    type: 'hero_slider',
    category: 'MEDIA',
    labelAr: 'شريط عرض هيرو كامل العرض',
    labelEn: 'Full Width Hero Slider',
    descriptionAr: 'معرض شرائح تفاعلي في كامل الشاشة مع فلتر بحث عقاري مدمج',
    descriptionEn: 'Interactive full-screen slideshow with immersive effects and property search filters',
    iconName: 'Film',
    defaultSettings: {
      heightMode: 'fullscreen',
      sliderHeightVh: 100,
      customHeight: '700px',
      showPrevNext: true,
      showDots: true,
      navStyle: 'circle',
      transitionType: 'fade',
      autoplay: true,
      autoplaySpeed: 6000,
      pauseOnHover: true,
      infiniteLoop: true,
      showSearchBox: true,
      slides: [
        {
          id: 'slide_default_1',
          bgType: 'image',
          imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
          base64Data: '',
          videoBase64: '',
          overlayColor: '#000000',
          overlayOpacity: 55,
          gradientOverlay: true,
          titleAr: 'قصر نجد الأرستقراطي الملكي',
          titleEn: 'The Sovereign Aristocratic Najd Palace',
          subtitleAr: 'بوابة إرث معماري نادر وتحفة إنشائية في أرقى أحياء الرياض وحطين',
          subtitleEn: 'A rare heritage masterpiece in Hittin, the most prestigious district of Riyadh',
          align: 'center',
          valign: 'center',
          primaryBtnTextAr: 'احجز جولتك الاستكشافية المرافقة ⟵',
          primaryBtnTextEn: 'Book Guided Butler Palace Tour ⟵',
          primaryBtnLink: '/contact',
          secondaryBtnTextAr: 'تحميل كتلوج الخامات الإنشائية والتفاصيل',
          secondaryBtnTextEn: 'Download Structural Materials Blueprint',
          secondaryBtnLink: '#'
        },
        {
          id: 'slide_default_2',
          bgType: 'image',
          imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
          base64Data: '',
          videoBase64: '',
          overlayColor: '#000000',
          overlayOpacity: 45,
          gradientOverlay: true,
          titleAr: 'ريزيدنس واحة النخيل والمجمعات المغلقة',
          titleEn: 'Palms Oasis Gated Diplomatic Enclave',
          subtitleAr: 'عيش الخصوصية المطلقة والأمان والرفاهية المأتمتة برعاية هندسية رفيعة',
          subtitleEn: 'Savor absolute privacy and smart robotic automations in Riyadh diplomat quarter',
          align: 'center',
          valign: 'center',
          primaryBtnTextAr: 'استعرض قصر النموذج المتوفر',
          primaryBtnTextEn: 'Explore Available Model Villas',
          primaryBtnLink: '/properties',
          secondaryBtnTextAr: 'اتصل بمستشار المبيعات الآن',
          secondaryBtnTextEn: 'Connect With Private Realtor',
          secondaryBtnLink: '#'
        }
      ]
    }
  }
];

export const getWidgetByCategory = (category: WidgetCategoryType) => {
  return WIDGET_REGISTRY.filter(w => w.category === category);
};

export const getWidgetDefaultSettings = (type: string) => {
  const item = WIDGET_REGISTRY.find(w => w.type === type);
  return item ? JSON.parse(JSON.stringify(item.defaultSettings)) : {};
};
