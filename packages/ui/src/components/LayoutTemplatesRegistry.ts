/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VisualSection, VisualRow, VisualColumn, VisualWidget } from '../types';
import { apiClient } from '@bina/shared';

/**
 * Generates an ultra-unique runtime ID for template clones to ensure 
 * inserted templates are 100% editable and independent of each other.
 */
export const generateUniqueId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Clones a Section deeply, creating fresh IDs for Section/Rows/Columns/Widgets.
 */
export const cloneSection = (section: any): VisualSection => {
  const sectionId = generateUniqueId('vsec');
  return {
    ...section,
    id: sectionId,
    nameAr: section.nameAr,
    nameEn: section.nameEn,
    visible: section.visible !== undefined ? section.visible : true,
    backgroundColor: section.backgroundColor || '#ffffff',
    paddingY: section.paddingY || 'medium',
    rows: (section.rows || []).map((row: any): VisualRow => {
      const rowId = generateUniqueId('vrow');
      return {
        id: rowId,
        columns: (row.columns || []).map((col: any): VisualColumn => {
          const colId = generateUniqueId('vcol');
          return {
            id: colId,
            span: col.span || 12,
            widgets: (col.widgets || []).map((wid: any): VisualWidget => {
              const widgetId = generateUniqueId('wid');
              return {
                id: widgetId,
                type: wid.type,
                settings: JSON.parse(JSON.stringify(wid.settings || {}))
              };
            })
          };
        })
      };
    })
  };
};

/**
 * Clones a list of Sections deeply (useful for Full Page Templates).
 */
export const cloneSectionsList = (sections: any[]): VisualSection[] => {
  return sections.map(sec => cloneSection(sec));
};

// ================= SECTION TEMPLATES BY GROUP =================

export interface SectionTemplateDef {
  key: string;
  category: 'hero' | 'about' | 'services' | 'testimonials' | 'features' | 'pricing' | 'faq' | 'contact' | 'footers';
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  sectionData: Omit<VisualSection, 'id'>;
}

const DEFAULT_SECTION_TEMPLATES: SectionTemplateDef[] = [
  // ----------- HERO SECTIONS -----------
  {
    key: 'full_width_hero_slider',
    category: 'hero',
    nameAr: 'شريط المعارض عريض المساحة الملكي',
    nameEn: 'Full Width Premium Hero Slider',
    descAr: 'معرض مستعرض كامل العرض والارتفاع فائق الفخامة وجاهز بأتمتة التنقل المتقدمة والتأثيرات والانتقال المتقاطع والبحث المدمج.',
    descEn: 'State-of-the-art ultimate 100vh full-width slider showcasing architectural highlights with an integrated smart inquiry filtration bar.',
    sectionData: {
      nameAr: 'معرض هيرو عريض المساحة',
      nameEn: 'Full Width Hero Slider',
      visible: true,
      backgroundColor: '#0c111e',
      paddingY: 'none',
      rows: [
        {
          id: '',
          columns: [
            {
              id: '',
              span: 12,
              widgets: [
                {
                  id: '',
                  type: 'hero_slider',
                  settings: {
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
              ]
            }
          ]
        }
      ]
    }
  },
  {
    key: 'hero_luxury',
    category: 'hero',
    nameAr: 'العنوان الملكي الفاخر (هيرو)',
    nameEn: 'Royal Luxury Hero Banner',
    descAr: 'ترويسة ملكية عريضة بخلفية داكنة وجولتين من العناوين العريضة والأزرار التفاعلية المزدوجة.',
    descEn: 'Breathtaking full-width deep dark hero banner starring grand titles and dual booking CTAs.',
    sectionData: {
      nameAr: 'الترويسة الملكية الفاخرة',
      nameEn: 'Royal Luxury Hero',
      visible: true,
      backgroundColor: '#0b0f19',
      paddingY: 'large',
      rows: [
        {
          id: '',
          columns: [
            {
              id: '',
              span: 12,
              widgets: [
                {
                  id: '',
                  type: 'heading',
                  settings: {
                    textAr: 'ريزيدنس التميز المعماري والفلل السيادية',
                    textEn: 'Sovereign Architectural Masterpieces & Private Residences',
                    align: 'center',
                    size: '3xl',
                    color: '#D4AF37',
                    typography: { fontSize: '4xl', fontWeight: 'black', fontFamily: 'sans', lineHeight: 'tight' }
                  }
                },
                {
                  id: '',
                  type: 'text',
                  settings: {
                    textAr: 'تصميم وبناء يتحدى الزمن مستلهم من فخامة قصر المربع ونجد التاريخية بأتمتة ذكية لمستقبل مستدام.',
                    textEn: 'An enduring design marvel inspired by classic Riyadh heritage and high-tech automation systems built for the elite.',
                    align: 'center',
                    size: 'lg',
                    color: '#94a3b8',
                    typography: { fontSize: 'lg', fontWeight: 'normal', fontFamily: 'sans', lineHeight: 'relaxed' }
                  }
                },
                {
                  id: '',
                  type: 'spacer',
                  settings: { heightDesktop: '30px', heightMobile: '15px' }
                },
                {
                  id: '',
                  type: 'dual_button',
                  settings: {
                    primaryAr: 'احجز قصرك الخاص ⟵',
                    primaryEn: 'Reserve Your Estate ⟵',
                    primaryLink: '/contact',
                    secondaryAr: 'تحميل كتلوج مشاريعنا',
                    secondaryEn: 'Download Grand Catalog',
                    secondaryLink: '#',
                    align: 'center'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    key: 'hero_split_screen',
    category: 'hero',
    nameAr: 'العرض الترويجي المنقسم (شاشة نصفين)',
    nameEn: 'Split-Screen Hero Layout',
    descAr: 'مخطط منقسم ثنائي الأعمدة: لوحة المبيعات الإقناعية باليمين وصورة سينمائية متألقة باليسار.',
    descEn: 'Clean high-end 50/50 split showcasing elegant copywriting alongside a gorgeous visual backdrop.',
    sectionData: {
      nameAr: 'العرض الترويجي المنقسم',
      nameEn: 'Split-Screen Hero Banner',
      visible: true,
      backgroundColor: '#f8fafc',
      paddingY: 'large',
      rows: [
        {
          id: '',
          columns: [
            {
              id: '',
              span: 6,
              widgets: [
                {
                  id: '',
                  type: 'heading',
                  settings: {
                    textAr: 'أرقى مجمع سكني مغلق في حطين',
                    textEn: 'Premier Diplomatic Gated Enclave',
                    align: 'right',
                    size: '2xl',
                    color: '#0f172a'
                  }
                },
                {
                  id: '',
                  type: 'text',
                  settings: {
                    textAr: 'نقدم لك تجربة سكنية تدمج بين الهدوء والخصوصية والمحيط الدبلوماسي المميز بأرقى أحياء شمال العاصمة الرياض.',
                    textEn: 'Bringing you a residential experience combining security, utter privacy, and elite architectural community values.',
                    align: 'right',
                    size: 'md',
                    color: '#475569'
                  }
                },
                {
                  id: '',
                  type: 'list',
                  settings: {
                    itemsAr: ['مساحات مفتوحة وتصاميم إيطالية ملهمة', 'حراسة مدرعة مدار الساعة', 'مواقف خاصة تتسع لأربع سيارات بالبدروم'],
                    itemsEn: ['Open-concept layouts designed by European masters', '24/7 sovereign certified security shield', '4-vehicle private underground garages'],
                    bulletColor: '#d4af37',
                    align: 'right'
                  }
                },
                {
                  id: '',
                  type: 'button',
                  settings: {
                    textAr: 'تواصل مع مستشار المبيعات الملكي',
                    textEn: 'Connect with VIP Sales Executive',
                    color: '#0f172a',
                    textColor: '#ffffff',
                    align: 'right'
                  }
                }
              ]
            },
            {
              id: '',
              span: 6,
              widgets: [
                {
                  id: '',
                  type: 'image',
                  settings: {
                    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
                    aspectRatio: '4:3',
                    altAr: 'واجهة الفيلا الملكية النموذجية',
                    altEn: 'Model Royal Villa Exterior Facade',
                    customRadius: 'xl'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // ----------- ABOUT SECTIONS -----------
  {
    key: 'about_corporate',
    category: 'about',
    nameAr: 'من نحن وقيم الموثوقية',
    nameEn: 'Premium Corporate Legacy',
    descAr: 'سرد تاريخي للشركة والمطور بجانب اقتباس وقور من الإدارة وصورة العمارة.',
    descEn: 'Stately corporate profile layout combining legacy text, leadership quote, and architectural media.',
    sectionData: {
      nameAr: 'من نحن والقيم التأسيسية',
      nameEn: 'About & Founding Principles',
      visible: true,
      backgroundColor: '#ffffff',
      paddingY: 'medium',
      rows: [
        {
          id: '',
          columns: [
            {
              id: '',
              span: 6,
              widgets: [
                {
                  id: '',
                  type: 'heading',
                  settings: {
                    textAr: 'مستقبل بنيان أصيل ومستدام في قلب وطنا',
                    textEn: 'Designing the Future of Architecture in Our Homeland',
                    align: 'right',
                    size: 'xl',
                    color: '#1e293b'
                  }
                },
                {
                  id: '',
                  type: 'text',
                  settings: {
                    textAr: 'نحن شركة رائدة تفخر بهندسة كبرى الضواحي والفلل السكنية التي تكفل تلاحم العائلات وترسيخ مستويات معيشة فائقة الجمال وبجودة مستمرة.',
                    textEn: 'We are a premier developer of high-luxury masterplans and residential estates that elevate liveability and build family legacies across Saudi Arabia.',
                    align: 'right',
                    size: 'md',
                    color: '#475569'
                  }
                },
                {
                  id: '',
                  type: 'quote',
                  settings: {
                    textAr: 'شيدنا مشاريعنا بخرسانة حديدية وجدران من حجر الرياض تدوم لأجيال وتناسب طموحات رؤية ٢٠٣٠.',
                    textEn: 'We built our homes utilizing first-tier authentic Riyadh natural stone to persist across centuries and fulfill Vision 2030.',
                    authorAr: 'مجلس الإدارة التنفيذي',
                    authorEn: 'The Executive Board of Directors',
                    color: '#D4AF37'
                  }
                }
              ]
            },
            {
              id: '',
              span: 6,
              widgets: [
                {
                  id: '',
                  type: 'image',
                  settings: {
                    imageUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
                    aspectRatio: '16:10',
                    altAr: 'ردهة المعمار والتشطيب الداخلي الملكي',
                    altEn: 'VIP Palace Lobby & Bespoke Interiors',
                    customRadius: 'lg'
                  }
                },
                {
                  id: '',
                  type: 'statistics',
                  settings: {
                    statsAr: [
                      { number: '١٥+ عام', label: 'من الخبرات الإنشائية والهندسة المعمارية' },
                      { number: '٩٩.٢٪', label: 'نسبة رضا المستثمرين والأسر الساكنة' }
                    ],
                    statsEn: [
                      { number: '15+ Years', label: 'Of Construction & Architectural Mastery' },
                      { number: '99.2%', label: 'Sovereign Clan & Family Satisfaction Scale' }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // ----------- SERVICES SECTIONS -----------
  {
    key: 'services_three_columns',
    category: 'services',
    nameAr: 'خدماتنا الاستشارية الثلاثية',
    nameEn: 'Trio Bespoke Advisory Services',
    descAr: 'شبكة خدمات ثلاثية الأعمدة تسلط الضوء على تملك وحجز الأصول العقارية النخبوية وإدارتها.',
    descEn: 'A balanced three-column breakdown describing unique concierge property investment & development plans.',
    sectionData: {
      nameAr: 'باقات الخدمات الاستشارية',
      nameEn: 'VIP Services Plan',
      visible: true,
      backgroundColor: '#f1f5f9',
      paddingY: 'medium',
      rows: [
        {
          id: '',
          columns: [
            {
              id: '',
              span: 12,
              widgets: [
                {
                  id: '',
                  type: 'heading',
                  settings: {
                    textAr: 'طيف الاستشارات والخدمات التي نوفرها لكم',
                    textEn: 'Elite Real Estate Solutions That We Offer',
                    align: 'center',
                    size: '2xl',
                    color: '#0f172a'
                  }
                },
                {
                  id: '',
                  type: 'text',
                  settings: {
                    textAr: 'نقدم منظومة متكاملة من الخدمات لتسهيل التملك وتأمين الصفقات الاستثمارية الأكثر عائداً.',
                    textEn: 'We deliver comprehensive property development services optimizing your lifestyle and cash flow.',
                    align: 'center',
                    size: 'sm',
                    color: '#64748b'
                  }
                }
              ]
            }
          ]
        },
        {
          id: '',
          columns: [
            {
              id: '',
              span: 4,
              widgets: [
                {
                  id: '',
                  type: 'rich_text',
                  settings: {
                    textAr: '<h3>🏛️ تملك الفلل السكنية الفاخرة</h3><p>نسهل تملكك وتخصيص فيلتك في أرقى أحياء الرياض والمنطقة الشرقية بجداول دفعات مرنة.</p>',
                    textEn: '<h3>🏛️ VIP Gated Estate Ownership</h3><p>We streamline elite residential acquisition with fully custom payment structures aligned to milestones.</p>',
                    align: 'right',
                    color: '#1e293b'
                  }
                }
              ]
            },
            {
              id: '',
              span: 4,
              widgets: [
                {
                  id: '',
                  type: 'rich_text',
                  settings: {
                    textAr: '<h3>📈 إدارة الأصول والمحافظ المغلقة</h3><p>نصمم ونرعى محافظ الاستحواذ على عمارات وأراضي سكنية نادرة لضمان عوائد مستقيمة وتصاعدية.</p>',
                    textEn: '<h3>📈 Off-Market Capital Multipliers</h3><p>We source high-yield strategic land banks and build private commercial portfolios for family offices.</p>',
                    align: 'right',
                    color: '#1e293b'
                  }
                }
              ]
            },
            {
              id: '',
              span: 4,
              widgets: [
                {
                  id: '',
                  type: 'rich_text',
                  settings: {
                    textAr: '<h3>✏️ تخطيط وهندسة مستدامة</h3><p>خطط هندسية ومخططات معمارية بالتعاون مع كبرى استوديوهات التصميم في ميلانو وروما.</p>',
                    textEn: '<h3>✏️ Pristine Italian Architecture</h3><p>Partnering with majestic architectural boutique firms in Milan to compile elite customized residential layouts.</p>',
                    align: 'right',
                    color: '#1e293b'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // ----------- TESTIMONIALS -----------
  {
    key: 'testimonials_grid',
    category: 'testimonials',
    nameAr: 'شهادات المستثمرين والعملاء (قوالب متميزة)',
    nameEn: 'Elite Testimonials Grid',
    descAr: 'شهادات حقيقية وراقية تظهر مدى ثقة كبار الشخصيات والوزراء بجرأة تصميمنا الإنشائي.',
    descEn: 'Pristine layout organizing real-estate investment reviews from actual VIP properties owners.',
    sectionData: {
      nameAr: 'أراء النخبة المشيدين بنا',
      nameEn: 'Pragmatic User Testimonials',
      visible: true,
      backgroundColor: '#ffffff',
      paddingY: 'medium',
      rows: [
        {
          id: '',
          columns: [
            {
              id: '',
              span: 12,
              widgets: [
                {
                  id: '',
                  type: 'heading',
                  settings: {
                    textAr: 'ماذا يقولون عنا شركاء السكن والاهتداء؟',
                    textEn: 'What Our Imperial Residents Think',
                    align: 'center',
                    size: '2xl',
                    color: '#0f172a'
                  }
                },
                {
                  id: '',
                  type: 'ratings',
                  settings: {
                    stars: 5,
                    labelAr: 'حزنا بامتياز على درجات الشرف لجودة البنيان',
                    labelEn: 'Vouched by 99% of our real estate premium clients',
                    color: '#d4af37'
                  }
                }
              ]
            }
          ]
        },
        {
          id: '',
          columns: [
            {
              id: '',
              span: 6,
              widgets: [
                {
                  id: '',
                  type: 'testimonials',
                  settings: {
                    itemsAr: [
                      {
                        name: 'المهندس تركي الخالدي',
                        title: 'أخصائي تطوير عقاري ومستثمر',
                        quote: 'أعجبني دقة المهندسين بالبناء وإتاحة الصفحة المخصصة لتصميم الفيلل واختيار باقات الألوان والمواد الذكية بحرية تامة مما سهل مسار الاتفاق.',
                        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80'
                      }
                    ],
                    itemsEn: [
                      {
                        name: 'Eng. Turki Al-Khaldi',
                        title: 'Property Specialist & Investor',
                        quote: 'The architectural precision, responsive customization online interface, and bespoke options enabled us to finalize agreements in perfect trust.',
                        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80'
                      }
                    ]
                  }
                }
              ]
            },
            {
              id: '',
              span: 6,
              widgets: [
                {
                  id: '',
                  type: 'testimonials',
                  settings: {
                    itemsAr: [
                      {
                        name: 'د. خالد السعيد',
                        title: 'مالك قصر بحي الملقا الفاخر',
                        quote: 'سكنت بالقصر الرئاسي لعامين، كفاءة عالية بالعزل الصوتي والحراري وأتمتة ذكية تسابق الزمن وتوفر الكثير من طاقة التكييف.',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
                      }
                    ],
                    itemsEn: [
                      {
                        name: 'Dr. Khaled Al-Saeed',
                        title: 'Malqa VIP Palace Owner',
                        quote: 'Living in the Sovereign Palace for 2 years has been a pure dream. Passive solar cooling paired with premium IoT controls has optimized daily life.',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // ----------- FEATURES -----------
  {
    key: 'features_grid_luxury',
    category: 'features',
    nameAr: 'شبكة الميزات الأيقونية الهندسية',
    nameEn: 'Prestige Features Bento Grid',
    descAr: 'شبكة متراصة وأنيقة تستعرض المميزات الإنشائية والأتمتة ومقاومة الطقس لقصور الشركة.',
    descEn: 'Clean modular layout showing thermal insulation, smart automated portals, and structural warranties.',
    sectionData: {
      nameAr: 'الميزات الإنشائية الكبرى',
      nameEn: 'Top Structural Features',
      visible: true,
      backgroundColor: '#fafafa',
      paddingY: 'medium',
      rows: [
        {
          id: '',
          columns: [
            {
              id: '',
              span: 12,
              widgets: [
                {
                  id: '',
                  type: 'heading',
                  settings: {
                    textAr: 'لماذا يبني النخبة قصورهم معنا؟',
                    textEn: 'Why Do VIP Families Build with Us?',
                    align: 'center',
                    size: '2xl',
                    color: '#0f172a'
                  }
                }
              ]
            }
          ]
        },
        {
          id: '',
          columns: [
            {
              id: '',
              span: 4,
              widgets: [
                {
                  id: '',
                  type: 'rich_text',
                  settings: {
                    textAr: '<h4>🍀 استدامة ومقاومة حرارية</h4><p>تقنيات عزل رغوي فريدة من البولي يوريثان تحمي الفلل والقصور من درجات حرارة الصيف الشاهقة بفعالية مطلقة.</p>',
                    textEn: '<h4>🍀 High-grade Thermal Shield</h4><p>We deploy polyurethane acoustic and heat barriers, securing inside climate against worst desert conditions.</p>',
                    align: 'right',
                    color: '#1e293b'
                  }
                }
              ]
            },
            {
              id: '',
              span: 4,
              widgets: [
                {
                  id: '',
                  type: 'rich_text',
                  settings: {
                    textAr: '<h4>🔒 أنظمة حماية بيومترية</h4><p>بوابات حديدية ذكية بوزن ٢ طن تعمل ببروتوكول تشفير معقد ومستشعرات بصمة الوجه وشدة الوهج.</p>',
                    textEn: '<h4>🔒 Biometric Security Vault</h4><p>Armor-gated steel entry portals connected with facial bio-scanners and smart mobile relays.</p>',
                    align: 'right',
                    color: '#1e293b'
                  }
                }
              ]
            },
            {
              id: '',
              span: 4,
              widgets: [
                {
                  id: '',
                  type: 'rich_text',
                  settings: {
                    textAr: '<h4>📈 ضمان إنشائي ممتد</h4><p>ضمان رسمي موقع بهندستنا وكتابات العدل يمتد لـ ٣٥ عاماً ليكون إرثاً آمناً لأبنائكم ومستقبلهم.</p>',
                    textEn: '<h4>📈 35-Year Notary Guarantee</h4><p>Authorized legal construction warranties shielding your property value and investment security for decades.</p>',
                    align: 'right',
                    color: '#1e293b'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // ----------- PRICING -----------
  {
    key: 'pricing_cards_luxury',
    category: 'pricing',
    nameAr: 'مخطط وباقات الاستثمار السكني',
    nameEn: 'Elite Investment Pricing Cards',
    descAr: 'بطاقات التملك والمقارنة بين الفيلات النموذجية والقصور العائلية بنقاط ومميزات وأسعار واضحة.',
    descEn: 'Comprehensive vertical subscription/pricing columns targeting different investor net-worth brackets.',
    sectionData: {
      nameAr: 'باقات الأسعار والتملك',
      nameEn: 'Investment & Pricing Matrix',
      visible: true,
      backgroundColor: '#ffffff',
      paddingY: 'medium',
      rows: [
        {
          id: '',
          columns: [
            {
              id: '',
              span: 12,
              widgets: [
                {
                  id: '',
                  type: 'heading',
                  settings: {
                    textAr: 'باقات التملك العقاري الفاخر',
                    textEn: 'Luxury Property & Enclave Pricing Matrix',
                    align: 'center',
                    size: '2xl',
                    color: '#0f172a'
                  }
                },
                {
                  id: '',
                  type: 'text',
                  settings: {
                    textAr: 'خطط ممتازة للتملك الفوري وحجز الوحدات في الضواحي الكبرى.',
                    textEn: 'Select from our highly structured luxury options and secure direct property equity.',
                    align: 'center',
                    size: 'sm',
                    color: '#64748b'
                  }
                }
              ]
            }
          ]
        },
        {
          id: '',
          columns: [
            {
              id: '',
              span: 12,
              widgets: [
                {
                  id: '',
                  type: 'pricing_table',
                  settings: {
                    tiersAr: [
                      {
                        name: 'فلل ديلوكس ريزيدنس',
                        price: '٨,٤٠٠,٠٠٠ ر.س',
                        features: [
                          'مساحة أرض ٥٥٠ م² مع حديقة وموقف سيارتين',
                          'أجنحة نوم مع غرف ملابس متكاملة',
                          'ضمان هيكلي لمدة ٢٠ عاماً بالاتفاق'
                        ],
                        buttonText: 'احجز زيارة استكشافية الموقعة',
                        hot: false
                      },
                      {
                        name: 'دوق بالاس الصرح الأرستقراطي',
                        price: '٢٤,٠٠٠,٠٠٠ ر.س',
                        features: [
                          'مساحة قصر ١٥٠٠ م² بتصميم معماري إيطالي مميز',
                          'مسبح infinity بانورامي شاسع بمناور ليلية ذاتية',
                          'أتمتة ذكية فائقة من Crestron ومجلس مستقل',
                          'مهبط هليكوبتر حقيقي وضمانة استشارية مدى الحياة'
                        ],
                        buttonText: 'تواصل لحجز تملك ملكي مع المبيعات',
                        hot: true
                      }
                    ],
                    tiersEn: [
                      {
                        name: 'Deluxe Residence Mansions',
                        price: 'SAR 8,400,000',
                        features: [
                          '550 SQM premium land size with custom pool',
                          '4 Master suite layout featuring detailed dressing salons',
                          '20-Year legal ironclad building structural guarantee'
                        ],
                        buttonText: 'Book VIP Private Showing',
                        hot: false
                      },
                      {
                        name: 'Grand Sovereign Ducal Palace',
                        price: 'SAR 24,000,000',
                        features: [
                          '1500 SQM palace built with pure Italian marble claddings',
                          'Vast infinity visual pool with autonomous filter automation',
                          'Sovereign IoT networks controlling light, sound, & security',
                          'Landing helipad, private butler wing + lifelong board VIP advisor'
                        ],
                        buttonText: 'Secure Sovereign Palace Direct',
                        hot: true
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // ----------- FAQ -----------
  {
    key: 'faq_accordions_elite',
    category: 'faq',
    nameAr: 'تبويبات الأسئلة القانونية والإنشائية',
    nameEn: 'Legal & Engineering FAQs FAQ',
    descAr: 'أسئلة تفاعلية تهم العميل حول الدفعات وتملك الأجانب وتراخيص الفلل والمخططات الهندسية.',
    descEn: 'Compact navigable FAQ accordion resolving client ambiguities around pricing, ownership laws, and handovers.',
    sectionData: {
      nameAr: 'الأسئلة العقارية الشائعة',
      nameEn: 'Frequently Asked Real Estate Questions',
      visible: true,
      backgroundColor: '#f8fafc',
      paddingY: 'medium',
      rows: [
        {
          id: '',
          columns: [
            {
              id: '',
              span: 12,
              widgets: [
                {
                  id: '',
                  type: 'heading',
                  settings: {
                    textAr: 'الأسئلة الشائعة حول صفقات الاستحواذ والتملك',
                    textEn: 'Bespoke Answers to Common Inquiries',
                    align: 'center',
                    size: '2xl',
                    color: '#0f172a'
                  }
                }
              ]
            }
          ]
        },
        {
          id: '',
          columns: [
            {
              id: '',
              span: 12,
              widgets: [
                {
                  id: '',
                  type: 'faq',
                  settings: {
                    questionsAr: [
                      { q: 'هل يحصل المستثمر الدولي على ترخيص تملك عقاري كامل؟', a: 'نعم بالتأكيد، كافة عقاراتنا مرخصة وفق الهيئة العامة للعقار ويمكن إصدار صك ملكية فوري بالهوية أو جواز السفر للمستثمرين النخبة بالتسهيلات المعتمدة.' },
                      { q: 'ما هي مواصفات الخرسانة وحديد التسليح في البنيان؟', a: 'يتم البناء حصرياً بإسمنت مقاوم للكبريتات وحديد سابك المتين، وتخضع لـ ٧ مراحل من فحوص واختبارات الجودة وضغط التربة بالرياض قبل التشييد.' },
                      { q: 'هل يمكنني التعديل الفردي على مواد التشطيب والرخام؟', a: 'بكل تأكيد، يتيح لك نظام البناء البصري لدينا حجز باقات معينة وتغيير نوع الرخام وحجم المسبح من التاب المخصص للمواد والدرجات اللونية.' }
                    ],
                    questionsEn: [
                      { q: 'Are international elite buyers granted instant land deeds?', a: 'Yes. All residential compounds are legally cleared with the Saudi Real Estate Authority. Instant digitized land deeds are issued instantly upon purchase.' },
                      { q: 'What concrete and steel structures are used in formulation?', a: 'We build exclusively utilizing Saudi SABIC rebar steel and high-pressure sulfate-resistant concrete, subject to 7 third-party soil and pressure compression audits before delivery.' },
                      { q: 'Can I swap marbles or adjust custom bathroom sizing internally?', a: 'Absolutely. Our customized visual page-builder properties console allows client-driven adjustments to cladding types and layout spaces.' }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // ----------- CONTACT -----------
  {
    key: 'contact_hybrid_interactive',
    category: 'contact',
    nameAr: 'منظومة الاتصال الهجين (خريطة + نموذج)',
    nameEn: 'Bespoke Contact Form & Live Map',
    descAr: 'اتصال متكامل: خريطة جغرافية للموقع ومكتب المبيعات مع نموذج تواصل لحفظ بيانات العميل فوراً.',
    descEn: 'High-end layout featuring satellite project geo-pins coupled with private sales consultation forms.',
    sectionData: {
      nameAr: 'اتصل بنا وحل الاستشارة',
      nameEn: 'Contact VIP Sales Hub',
      visible: true,
      backgroundColor: '#ffffff',
      paddingY: 'medium',
      rows: [
        {
          id: '',
          columns: [
            {
              id: '',
              span: 6,
              widgets: [
                {
                  id: '',
                  type: 'heading',
                  settings: {
                    textAr: 'احصل على جدول أسعار ومشاهدة خاصة لقصرك اليوم',
                    textEn: 'Request Private Showing & Premium Quote Today',
                    align: 'right',
                    size: 'xl',
                    color: '#0f172a'
                  }
                },
                {
                  id: '',
                  type: 'text',
                  settings: {
                    textAr: 'املأ تفاصيلك الهامة وسيقوم وكيل مرخص بالاتصال بك وترتيب استقبالك بمقر الشركة الفاخر بالمملكة.',
                    textEn: 'Fill in your inquiries. A licensed sovereign concierge advisor will trigger a brief call and organize your VIP headquarter tour.',
                    align: 'right',
                    size: 'sm',
                    color: '#475569'
                  }
                },
                {
                  id: '',
                  type: 'contact_form',
                  settings: {
                    buttonTextAr: 'احجز زيارة استثنائية مجانية',
                    buttonTextEn: 'Verify My VIP Showing Booking',
                    placeholderNameAr: 'اكتب اسمك الثلاثي الكريم...',
                    placeholderNameEn: 'Enter Your Full Name Here',
                    submittingTextAr: 'جاري إرسال الطلب للمستشارين العقاريين...',
                    submittingTextEn: 'Syncing details with sales advisors...'
                  }
                }
              ]
            },
            {
              id: '',
              span: 6,
              widgets: [
                {
                  id: '',
                  type: 'map',
                  settings: {
                    coordinates: 'Riyadh, Saudi Arabia',
                    zoom: 14,
                    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115915.695379667!2d46.6046777!3d24.7135517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d48939b%3A0xf2aa23c67621255a!2sRiyadh%20Saudi%20Arabia!5e0!3m2!1sen!2sus!4v1687399812491!5m2!1sen!2sus'
                  }
                },
                {
                  id: '',
                  type: 'rich_text',
                  settings: {
                    textAr: '🏙️ <b>مقرنا الرئيسي:</b> طريق الملك فهد، حي الملقا، الرياض، المملكة العربية السعودية.<br>📞 <b>اتصال مباشر مخصص:</b> ٩٢٠٠١٢٤٥٦',
                    textEn: '🏙️ <b>VIP Head Office:</b> King Fahd Road, Al-Malqa District, Riyadh, Kingdom of Saudi Arabia.<br>📞 <b>Direct Dedicated Hotlines:</b> +966920012456',
                    align: 'right',
                    color: '#1e293b'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // ----------- FOOTERS -----------
  {
    key: 'footer_multi_columns',
    category: 'footers',
    nameAr: 'التذييل الكلي الفاخر (فوتير)',
    nameEn: 'Elite Quad-Column Footer Layout',
    descAr: 'تذييل متكامل من أربع أعمدة يعرض الشركاء، النشرة الإخبارية، ومعلومات الملكية الفكرية العقارية.',
    descEn: 'Immersive bottom segment managing structural pages navigation, company credentials, and VIP newsletter capture.',
    sectionData: {
      nameAr: 'تذييل الصفحة الشامل',
      nameEn: 'Comprehensive Grand Footer',
      visible: true,
      backgroundColor: '#090d16',
      paddingY: 'small',
      rows: [
        {
          id: '',
          columns: [
            {
              id: '',
              span: 4,
              widgets: [
                {
                  id: '',
                  type: 'heading',
                  settings: {
                    textAr: 'بناء وإدارة العقار النخبوي بالمملكة',
                    textEn: 'Imperial Construction & Realty Governance',
                    align: 'right',
                    size: 'lg',
                    color: '#D4AF37'
                  }
                },
                {
                  id: '',
                  type: 'text',
                  settings: {
                    textAr: 'نهدف للريادة العمرانية الفاخرة وتقديم حلول مخصصة تعكس الطموح السعودي والارتقاء السكني الرصين كلياً.',
                    textEn: 'Spearheading premium architectural legacy and delivering bespoke custom-tailored residential systems reflecting Saudi excellence.',
                    align: 'right',
                    size: 'xs',
                    color: '#64748b'
                  }
                }
              ]
            },
            {
              id: '',
              span: 4,
              widgets: [
                {
                  id: '',
                  type: 'newsletter',
                  settings: {
                    titleAr: 'عروض الصفقات المغلقة للأراضي ببريدك',
                    titleEn: 'Off-Market Releases Digest directly',
                    buttonTextAr: 'اشتراك النخبة',
                    buttonTextEn: 'Verify Subscription'
                  }
                }
              ]
            },
            {
              id: '',
              span: 4,
              widgets: [
                {
                  id: '',
                  type: 'logo_grid',
                  settings: {
                    logos: [
                      { name: 'Sovereign Real Estate Partner', url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80' }
                    ],
                    grayscale: true,
                    cols: 1
                  }
                },
                {
                  id: '',
                  type: 'rich_text',
                  settings: {
                    textAr: '<p style="font-size:10px; color:#475569;">© جميع الحقوق محفوظة لشبكة التملك ٢٠٢٦.</p>',
                    textEn: '<p style="font-size:10px; color:#475569;">© All Rights Reserved. Sovereign Acquisition 2026.</p>'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  }
];

export let SECTION_TEMPLATES: SectionTemplateDef[] = DEFAULT_SECTION_TEMPLATES;


// ================= FULL PAGE CATEGORIES / TEMPLATES =================

export type TemplateCategoryType = 
  | 'Landing_Pages' 
  | 'Corporate' 
  | 'Agency' 
  | 'Medical' 
  | 'Legal' 
  | 'Real_Estate' 
  | 'Education' 
  | 'Restaurant' 
  | 'Hotel' 
  | 'Portfolio' 
  | 'Blog';

export interface PageTemplateDef {
  key: string;
  category: TemplateCategoryType;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  sections: Omit<VisualSection, 'id'>[];
}

export const TEMPLATE_CATEGORIES: { key: TemplateCategoryType; labelAr: string; labelEn: string; descriptionAr: string; descriptionEn: string }[] = [
  {
    key: 'Landing_Pages',
    labelAr: 'صفحات الهبوط المبيعاتية',
    labelEn: 'Landing Pages',
    descriptionAr: 'مخصصة للتسويق الرقمي الفعال وجذب العملاء المحتملين لفلل معينة.',
    descriptionEn: 'Engineered for high-conversion performance marketing & target sales capture.'
  },
  {
    key: 'Corporate',
    labelAr: 'المواقع التعريفية والمطورين',
    labelEn: 'Corporate Portal',
    descriptionAr: 'قالب كبار المطورين والمقاولين يعرض الإحصائيات والأخبار والكوادر الإدارية.',
    descriptionEn: 'The authoritative corporate profile of construction, stats, & leadership portfolios.'
  },
  {
    key: 'Agency',
    labelAr: 'مكاتب العمارة والديكور الإقليمية',
    labelEn: 'Creative Agency',
    descriptionAr: 'صمم خصيصاً للمكاتب الهندسية ومستشاري العمارة والديكور الإيطالي.',
    descriptionEn: 'Sleek architectural and design agency profile detailing solutions & past blueprints.'
  },
  {
    key: 'Medical',
    labelAr: 'المستشفيات والعيادات الطبية الفاخرة',
    labelEn: 'Medical & Wellness Enclaves',
    descriptionAr: 'صفحة للمشاريع الحاضنة للمراكز الصحية، أو عيادات حطين والملقا الراقية.',
    descriptionEn: 'Pristine setup targeting elite health practices & premium diagnostic enclaves.'
  },
  {
    key: 'Legal',
    labelAr: 'كاتب العدل والاستشارات القانونية',
    labelEn: 'Legal & Escrow Counsel',
    descriptionAr: 'مصمم للمحامين وعقود الإفراغ العقاري وتأمين صفقات الاستثمار الكبيرة.',
    descriptionEn: 'Clean high-trust layout for VIP attorneys, land contracts & notary legal escrow.'
  },
  {
    key: 'Real_Estate',
    labelAr: 'الوساطة والاستثمار العقاري النخبوي',
    labelEn: 'Real Estate Elite Brokerage',
    descriptionAr: 'صفحة متكاملة تعرض الفلل المتاحة، وخرائط التوزيع والأسعار بمصفوفة راقية.',
    descriptionEn: 'Full-sweep template housing active estates grids, satellite location maps & pricing cards.'
  },
  {
    key: 'Education',
    labelAr: 'الأكاديميات والمدارس الأهلية النخبوية',
    labelEn: 'Education & Academies',
    descriptionAr: 'للمدارس والجامعات الأجنبية بالمدن السكنية ببرامج وخطوط للتسجيل والرسوم الفنية.',
    descriptionEn: 'Immersive setup showcasing premium curricula, campus amenities & VIP registration tiers.'
  },
  {
    key: 'Restaurant',
    labelAr: 'المطاعم الفاخرة والمقاهي المصقولة',
    labelEn: 'Gourmet Restaurants',
    descriptionAr: 'لعرض لوحات المطاعم وجداول المقارنة وحجوزات الطاولات والكونسيرج الغذائي.',
    descriptionEn: 'Bespoke culinary layout illustrating seasonal menus, reservations & VIP dining suites.'
  },
  {
    key: 'Hotel',
    labelAr: 'الفنادق والمنتجعات والقصور المستضيفة',
    labelEn: 'Hotel & Resorts Wellness',
    descriptionAr: 'مخصص للمنتجعات الكبرى والأجنحة، يشتمل على صور وشهادات آراء غامرة وتقييمات خماسية.',
    descriptionEn: 'Grand hospitality canvas supporting spacious visual suites galleries, star ratings & direct booking portals.'
  },
  {
    key: 'Portfolio',
    labelAr: 'سير الأعمال الشخصية ومستشاري النخبة',
    labelEn: 'Personal Portfolio & Consults',
    descriptionAr: 'لوحة لمشاريع المستشارين الفرديين والمهندسين يعرضون فيها سوابق التميز الخاص بهم.',
    descriptionEn: 'Bespoke profile for elite freelance architects, detailing timeline achievements & legacy drafts.'
  },
  {
    key: 'Blog',
    labelAr: 'المدونات والمجلات العقارية والاتجاهات',
    labelEn: 'Magazines & Design Blogs',
    descriptionAr: 'مخصص لنشر المعايير المعمارية وأخبار اتجاهات الفخامة ومستحدثات الضواحي السكنية.',
    descriptionEn: 'Clean layout publishing architectural trend blogs, Najdi legacy papers & market insights.'
  }
];

const DEFAULT_PAGE_TEMPLATES: PageTemplateDef[] = [
  // ----------- REAL ESTATE PAGE TEMPLATE -----------
  {
    key: 'page_real_estate_premium',
    category: 'Real_Estate',
    nameAr: 'موقع التملك والوساطة المتكامل (الملكي)',
    nameEn: 'Royal Real Estate Portal Template',
    descAr: 'صفحة تملك عقارية متكاملة: تحتوى الترويسة العريضة، المميزات الأيقونية، مصفوفة الأسعار، والاتصال المزدوج.',
    descEn: 'Full-sweep commercial template containing high-contrast Hero, Bento Features, Pricing Matrix, & Maps Contact.',
    sections: [
      SECTION_TEMPLATES.find(s => s.key === 'hero_luxury')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'features_grid_luxury')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'pricing_cards_luxury')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'faq_accordions_elite')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'contact_hybrid_interactive')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'footer_multi_columns')!.sectionData
    ]
  },
  
  // ----------- LANDING PAGES TEMPLATE -----------
  {
    key: 'page_landing_pitch',
    category: 'Landing_Pages',
    nameAr: 'صفحة الهبوط والتسويق الرقمي الفعال',
    nameEn: 'High-Conversion Target Landing Page',
    descAr: 'صفحة تسويقية مركزة تعرض سكن حطين مع سرد منقسم للعملاء وأزرار حث فورية ونموذج تواصل مباشر.',
    descEn: 'Laser-focused sales page with heavy copy sections, split layouts, direct whatsapp triggers, and lead capture.',
    sections: [
      SECTION_TEMPLATES.find(s => s.key === 'hero_split_screen')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'services_three_columns')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'testimonials_grid')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'contact_hybrid_interactive')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'footer_multi_columns')!.sectionData
    ]
  },

  // ----------- CORPORATE TEMPLATE -----------
  {
    key: 'page_corporate_main',
    category: 'Corporate',
    nameAr: 'البوابة التعريفية الفاخرة للمطور العقاري',
    nameEn: 'Elite Master Developer Corporate Portal',
    descAr: 'بوابة مطور كبرى تعرض سرد من نحن التاريخي، إحصائيات الأصول المليارية، شهادات الآراء والتذييل.',
    descEn: 'Stately portal focusing on about legacy, statistics trackers, core advisory services, & platform ratings.',
    sections: [
      SECTION_TEMPLATES.find(s => s.key === 'hero_luxury')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'about_corporate')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'services_three_columns')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'testimonials_grid')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'footer_multi_columns')!.sectionData
    ]
  },

  // ----------- AGENCY TEMPLATE -----------
  {
    key: 'page_agency_studios',
    category: 'Agency',
    nameAr: 'استوديو التصاميم المعمارية الإيطالية',
    nameEn: 'Bespoke Milanese Architecture Agency Portal',
    descAr: 'تمثيل فخم لاستوديوهات العمارة: سرد الخدمات الإيطالية وميزات البصمة المعمارية وشهادات الثقة.',
    descEn: 'Pristine profile highlighting Italian heritage designs, architectural features lists, and direct consultation CTAs.',
    sections: [
      SECTION_TEMPLATES.find(s => s.key === 'hero_split_screen')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'about_corporate')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'services_three_columns')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'footer_multi_columns')!.sectionData
    ]
  },

  // ----------- MEDICAL TEMPLATE -----------
  {
    key: 'page_medical_wellness',
    category: 'Medical',
    nameAr: 'صرح العيادات المتكاملة والمراكز الصحية',
    nameEn: 'Hittin Wellness Clinics Portal',
    descAr: 'ترويسة ممتدة، آراء العملاء الطبية، أسئلة شائعة فنية وتذييل متماسك لإقناع المرضى والعملاء.',
    descEn: 'Clean medical presentation mapping bespoke clinical services, health FAQ and direct reservation form.',
    sections: [
      SECTION_TEMPLATES.find(s => s.key === 'hero_luxury')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'services_three_columns')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'faq_accordions_elite')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'contact_hybrid_interactive')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'footer_multi_columns')!.sectionData
    ]
  },

  // ----------- LEGAL TEMPLATE -----------
  {
    key: 'page_legal_notary',
    category: 'Legal',
    nameAr: 'استشارات صكوك وفراغ الأصول السكنية',
    nameEn: 'Sovereign Real Estate Notary Portal',
    descAr: 'ميزات الأمان القانونية وعقود تملك الأجانب وجداول الأسئلة القانونية الصارمة مع التذييل وحفظ الصكوك.',
    descEn: 'Bespoke escrow attorney profile demonstrating client warranties, property agreements FAQ and secure consultation triggers.',
    sections: [
      SECTION_TEMPLATES.find(s => s.key === 'hero_split_screen')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'about_corporate')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'faq_accordions_elite')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'contact_hybrid_interactive')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'footer_multi_columns')!.sectionData
    ]
  },

  // ----------- EDUCATION TEMPLATE -----------
  {
    key: 'page_education_academy',
    category: 'Education',
    nameAr: 'أكاديمية المعايير العقارية وتدريب النخبة',
    nameEn: 'Immersive Real Estate Academy Portal',
    descAr: 'خدمات تدريب كبار المستشارين وتطوير صفقات البناء ومخطط الأسئلة الأكاديمية ونموذج التسجيل.',
    descEn: 'Premium knowledge academy structure featuring elite curricula modules, client trust ratings, and registration lead form.',
    sections: [
      SECTION_TEMPLATES.find(s => s.key === 'hero_luxury')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'services_three_columns')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'testimonials_grid')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'contact_hybrid_interactive')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'footer_multi_columns')!.sectionData
    ]
  },

  // ----------- RESTAURANT TEMPLATE -----------
  {
    key: 'page_restaurant_gourmet',
    category: 'Restaurant',
    nameAr: 'تجمع المقاهي وسلسلة النخبة الغذائية',
    nameEn: 'Gourmet Culinary Concierge Hub',
    descAr: 'لوحة مطعم فخم تظهر باقات الوجبات وتجربة الصالات والآراء الشائعة مع قنوات الحجز الجغرافي السريعة.',
    descEn: 'Delightful culinary portal map showcasing gourmet suites, seasonal dishes lists & secure dining slots consultation.',
    sections: [
      SECTION_TEMPLATES.find(s => s.key === 'hero_split_screen')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'features_grid_luxury')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'testimonials_grid')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'contact_hybrid_interactive')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'footer_multi_columns')!.sectionData
    ]
  },

  // ----------- HOTEL TEMPLATE -----------
  {
    key: 'page_hotel_resort',
    category: 'Hotel',
    nameAr: 'المنتجعات والقصور المستضيفة الخاصة',
    nameEn: 'Private Wellness Palace & Resorts Template',
    descAr: 'قالب كبار الفنادق يعرض غرف الأجنحة الرئاسية، ومراجعات النزلاء، وتكامل الأزرار وخرائط الاتصال.',
    descEn: 'Full hospitality canvas mapping 대통령 master suites, interactive gallery details, star ratings and private tour request.',
    sections: [
      SECTION_TEMPLATES.find(s => s.key === 'hero_luxury')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'about_corporate')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'features_grid_luxury')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'testimonials_grid')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'contact_hybrid_interactive')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'footer_multi_columns')!.sectionData
    ]
  },

  // ----------- PORTFOLIO TEMPLATE -----------
  {
    key: 'page_portfolio_architect',
    category: 'Portfolio',
    nameAr: 'معرض أعمال مستشار المعمار الملكي',
    nameEn: 'Bespoke Architect Design Portfolio',
    descAr: 'قالب سيرة لمهندس رائد يعرض سوابق تشييد القصور والمنافع والمقالات وفقه العمل الخاص بي.',
    descEn: 'Personal profile of a top structural designer featuring legacy projects progress, testimonials & map pins contact.',
    sections: [
      SECTION_TEMPLATES.find(s => s.key === 'hero_split_screen')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'about_corporate')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'services_three_columns')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'testimonials_grid')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'footer_multi_columns')!.sectionData
    ]
  },

  // ----------- BLOG TEMPLATE -----------
  {
    key: 'page_blog_trends',
    category: 'Blog',
    nameAr: 'مجلة الفخامة السكنية واتجاهات الإفراغ',
    nameEn: 'Prestige Architectural & Custom Design Blog',
    descAr: 'مقالات ونقاشات غنية متكاملة مع جداول ميزات فنية وباقات أسعار الضواحي الاستثمارية.',
    descEn: 'Blogging template with list guidelines, FAQ, rich text sections and elite subscription captures.',
    sections: [
      SECTION_TEMPLATES.find(s => s.key === 'hero_luxury')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'about_corporate')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'faq_accordions_elite')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'contact_hybrid_interactive')!.sectionData,
      SECTION_TEMPLATES.find(s => s.key === 'footer_multi_columns')!.sectionData
    ]
  }
];

export let PAGE_TEMPLATES: PageTemplateDef[] = DEFAULT_PAGE_TEMPLATES;


// ================= PERSISTENT CUSTOM TEMPLATES STORAGE MANAGEMENT =================

const BUILDER_SECTION_KIND = 'section_template';
const BUILDER_PAGE_KIND = 'page_template';

type PersistedSectionTemplate = Omit<SectionTemplateDef, 'category'> & { recordId?: string };
type PersistedPageTemplate = Omit<PageTemplateDef, 'category'> & { recordId?: string };
type SystemSectionTemplateRecord = SectionTemplateDef & { isSystem?: boolean };
type SystemPageTemplateRecord = PageTemplateDef & { isSystem?: boolean };

let customSectionTemplatesCache: PersistedSectionTemplate[] = [];
let customPageTemplatesCache: PersistedPageTemplate[] = [];
let customTemplatesLoaded = false;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const unwrapBuilderAssetList = (response: unknown) => {
  if (!isRecord(response)) return [];
  const data = isRecord(response.data) ? response.data : response;
  if (Array.isArray((data as any).data)) return (data as any).data;
  if (Array.isArray((data as any).items)) return (data as any).items;
  if (Array.isArray(data)) return data;
  return [];
};

const mapSectionTemplateRecord = (item: any): PersistedSectionTemplate => ({
  ...(item.data as Omit<SectionTemplateDef, 'category'>),
  recordId: item.id,
});

const mapPageTemplateRecord = (item: any): PersistedPageTemplate => ({
  ...(item.data as Omit<PageTemplateDef, 'category'>),
  recordId: item.id,
});

const mapSystemSectionTemplate = (item: any): SectionTemplateDef | null => {
  const data = item?.data as SystemSectionTemplateRecord | undefined;
  if (!data || !data.category || !data.sectionData) {
    return null;
  }

  return {
    key: data.key || item.key || item.id,
    category: data.category,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    descAr: data.descAr,
    descEn: data.descEn,
    sectionData: data.sectionData,
  };
};

const mapSystemPageTemplate = (item: any): PageTemplateDef | null => {
  const data = item?.data as SystemPageTemplateRecord | undefined;
  if (!data || !data.category || !Array.isArray(data.sections)) {
    return null;
  }

  return {
    key: data.key || item.key || item.id,
    category: data.category,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    descAr: data.descAr,
    descEn: data.descEn,
    sections: data.sections,
  };
};

const syncTemplateLibraryFromApi = async (): Promise<void> => {
  if (!apiClient.enabled) return;
  if (customTemplatesLoaded) return;
  customTemplatesLoaded = true;
  try {
    if (import.meta.env?.DEV) {
      console.log('[LayoutTemplatesRegistry] Loading custom template library from API');
    }
    const [sectionsResponse, pagesResponse] = await Promise.all([
      apiClient.get('/builder-assets?kind=section_template'),
      apiClient.get('/builder-assets?kind=page_template'),
    ]);
    const sectionItems = unwrapBuilderAssetList(sectionsResponse);
    const pageItems = unwrapBuilderAssetList(pagesResponse);

    const systemSections = sectionItems
      .filter((item: any) => item?.data?.isSystem)
      .map(mapSystemSectionTemplate)
      .filter((item): item is SectionTemplateDef => Boolean(item));
    const systemPages = pageItems
      .filter((item: any) => item?.data?.isSystem)
      .map(mapSystemPageTemplate)
      .filter((item): item is PageTemplateDef => Boolean(item));

    SECTION_TEMPLATES = systemSections.length > 0 ? systemSections : DEFAULT_SECTION_TEMPLATES;
    PAGE_TEMPLATES = systemPages.length > 0 ? systemPages : DEFAULT_PAGE_TEMPLATES;

    customSectionTemplatesCache = sectionItems
      .filter((item: any) => !item?.data?.isSystem)
      .map(mapSectionTemplateRecord);
    customPageTemplatesCache = pageItems
      .filter((item: any) => !item?.data?.isSystem)
      .map(mapPageTemplateRecord);
  } catch {
    SECTION_TEMPLATES = DEFAULT_SECTION_TEMPLATES;
    PAGE_TEMPLATES = DEFAULT_PAGE_TEMPLATES;
    // Keep in-memory caches if the API is temporarily unavailable.
  }
};

export const refreshCustomTemplatesFromApi = async (): Promise<void> => {
  customTemplatesLoaded = false;
  customSectionTemplatesCache = [];
  customPageTemplatesCache = [];
  SECTION_TEMPLATES = DEFAULT_SECTION_TEMPLATES;
  PAGE_TEMPLATES = DEFAULT_PAGE_TEMPLATES;
  await syncTemplateLibraryFromApi();
};

/**
 * Loads custom Section templates saved by the users in their local storage.
 */
export const loadCustomSections = (): Omit<SectionTemplateDef, 'category'>[] => {
  void syncTemplateLibraryFromApi();
  return customSectionTemplatesCache.map(({ recordId: _recordId, ...template }) => template);
};

/**
 * Saves a custom Section template to the user's local storage database list.
 */
export const saveCustomSectionTemplate = (nameAr: string, nameEn: string, section: VisualSection): void => {
  const cleanedSection = {
    ...JSON.parse(JSON.stringify(section)),
    id: '' // remove ID so it forces generation when inserted
  };
  
  const newTemplate = {
    key: `custom_sec_${Date.now()}`,
    nameAr,
    nameEn,
    descAr: 'قالب قسم مخصص تم حفظه وإعادة تدويره ومشاركته بنجاح.',
    descEn: 'A custom designed section template saved locally for unlimited page reusability.',
    sectionData: cleanedSection
  };

  customSectionTemplatesCache = [...customSectionTemplatesCache, { ...newTemplate, recordId: newTemplate.key }];
  if (apiClient.enabled) {
    apiClient.post('/builder-assets', {
      id: newTemplate.key,
      kind: BUILDER_SECTION_KIND,
      key: newTemplate.key,
      nameAr,
      nameEn,
      data: newTemplate,
    }).catch(() => undefined);
  }
};

/**
 * Deletes a custom Section template.
 */
export const deleteCustomSectionTemplate = (key: string): void => {
  customSectionTemplatesCache = customSectionTemplatesCache.filter(x => x.key !== key && x.recordId !== key);
  if (apiClient.enabled) {
    apiClient.delete(`/builder-assets/${key}`).catch(() => undefined);
  }
};

/**
 * Loads custom full Page templates saved by the users in their local storage.
 */
export const loadCustomPages = (): Omit<PageTemplateDef, 'category'>[] => {
  void syncTemplateLibraryFromApi();
  return customPageTemplatesCache.map(({ recordId: _recordId, ...template }) => template);
};

/**
 * Saves a custom full Page template to the user's local storage database list.
 */
export const saveCustomPageTemplate = (nameAr: string, nameEn: string, sections: VisualSection[]): void => {
  const cleanedSections = sections.map(s => {
    return {
      ...JSON.parse(JSON.stringify(s)),
      id: '' // clean ID to enable clean cloning
    };
  });

  const newTemplate = {
    key: `custom_page_${Date.now()}`,
    nameAr,
    nameEn,
    descAr: 'قالب صفحة متكامل ومخصص تم صياغته وإعادة تدويره.',
    descEn: 'A fully personalized custom page layout saved locally for speedy template cloning.',
    sections: cleanedSections
  };

  customPageTemplatesCache = [...customPageTemplatesCache, { ...newTemplate, recordId: newTemplate.key }];
  if (apiClient.enabled) {
    apiClient.post('/builder-assets', {
      id: newTemplate.key,
      kind: BUILDER_PAGE_KIND,
      key: newTemplate.key,
      nameAr,
      nameEn,
      data: newTemplate,
    }).catch(() => undefined);
  }
};

/**
 * Deletes a custom Page template.
 */
export const deleteCustomPageTemplate = (key: string): void => {
  customPageTemplatesCache = customPageTemplatesCache.filter(x => x.key !== key && x.recordId !== key);
  if (apiClient.enabled) {
    apiClient.delete(`/builder-assets/${key}`).catch(() => undefined);
  }
};
