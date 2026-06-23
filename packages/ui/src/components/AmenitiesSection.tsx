import React from 'react';
import { motion } from 'motion/react';
import { 
  Car, Lock, Waves, Dumbbell, ArrowUpDown, ShieldCheck, Compass, 
  Smile, Trees, Bed, UserCheck, Cpu, Wifi, Tv, Coffee, Sun, 
  Flame, Wind, Key, Sparkles, GlassWater, Heart, Home, 
  Grid, Book, CheckCircle2, Shield, Moon
} from 'lucide-react';
import { Property, BilingualText } from '@bina/types';

interface AmenitiesSectionProps {
  property: Property;
  language: 'ar' | 'en';
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  car: Car,
  lock: Lock,
  waves: Waves,
  dumbbell: Dumbbell,
  arrowupdown: ArrowUpDown,
  shieldcheck: ShieldCheck,
  compass: Compass,
  smile: Smile,
  trees: Trees,
  bed: Bed,
  usercheck: UserCheck,
  cpu: Cpu,
  wifi: Wifi,
  tv: Tv,
  coffee: Coffee,
  sun: Sun,
  flame: Flame,
  wind: Wind,
  key: Key,
  sparkles: Sparkles,
  glasswater: GlassWater,
  heart: Heart,
  home: Home,
  grid: Grid,
  book: Book,
  shield: Shield,
  checkcircle2: CheckCircle2,
  moon: Moon,
};

export const getIconComponent = (name: string | undefined): React.ComponentType<any> => {
  if (!name) return Sparkles;
  const normalized = name.toLowerCase().trim();
  return ICON_MAP[normalized] || Sparkles;
};

export const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({ property, language }) => {
  const t = (val: BilingualText | undefined) => {
    if (!val) return '';
    return language === 'ar' ? val.ar : val.en;
  };

  // Compile standard amenities with their values, titles and icons
  const standardAmenitiesList = [
    { value: property.amenityParking, ar: 'موقف سيارات', en: 'Parking Space', icon: 'car' },
    { value: property.amenityCoveredParking, ar: 'موقف مغطى خاص', en: 'Private Covered Garage', icon: 'lock' },
    { value: property.amenityPool, ar: 'مسبح مشترك', en: 'Shared Pool Complex', icon: 'waves' },
    { value: property.amenityPrivatePool, ar: 'مسبح خاص فاخر', en: 'Private Infinity Pool', icon: 'glasswater' },
    { value: property.amenityGym, ar: 'صالة رياضية متكاملة', en: 'Premium Health Club / Gym', icon: 'dumbbell' },
    { value: property.amenityElevator, ar: 'مصاعد ذكية متطورة', en: 'Smart High-Speed Elevators', icon: 'arrowupdown' },
    { value: property.amenitySecurity, ar: 'أمن وحراسة ٢٤ ساعة', en: '24/7 CCTV & Security Guard', icon: 'shieldcheck' },
    { value: property.amenityMosque, ar: 'مسجد قريب جداً', en: 'Mosque in Vicinity', icon: 'compass' },
    { value: property.amenityChildrenArea, ar: 'منطقة ألعاب أطفال آمنة', en: 'Kids Play Zone / Daycare', icon: 'smile' },
    { value: property.amenityGarden, ar: 'حدائق ومساحات خضراء', en: 'Landscaped Garden Gardens', icon: 'trees' },
    { value: property.amenityMaidRoom, ar: 'غرفة عاملة إضافية', en: "Private Maid's Room", icon: 'bed' },
    { value: property.amenityDriverRoom, ar: 'غرفة سائق خاصة', en: "Dedicated Driver's Suite", icon: 'usercheck' },
    { value: property.amenitySmartHome, ar: 'أنظمة ذكية Smart Home', en: 'Smart Home Automation System', icon: 'cpu' },
  ];

  const activeStandard = standardAmenitiesList.filter(amen => amen.value);

  // Compile custom amenities with optional icons
  const customList = (property.customAmenities || []).map(am => ({
    ar: am.ar,
    en: am.en,
    icon: am.icon || 'sparkles'
  }));

  const totalCount = activeStandard.length + customList.length;

  if (totalCount === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
        <p className="text-xs text-slate-400 font-sans font-medium">
          {language === 'ar' ? 'لم يتم تحديد خدمات أو تجهيزات خاصة لهذا العقار بعد.' : 'No unique services or amenities registered yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-sans font-extrabold text-sm text-[#0F172A] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]" />
          {language === 'ar' ? 'الخدمات والتجهيزات الترفيهية' : 'Bespoke Amenities & Luxury Services'}
        </h3>
        <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
          {totalCount} {language === 'ar' ? 'ميزة' : 'Features'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Render standard configured elements */}
        {activeStandard.map((item, idx) => {
          const IconComponent = getIconComponent(item.icon);
          return (
            <motion.div
              key={`std-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white border border-slate-150 p-4 rounded-xl flex flex-col items-center justify-between text-center gap-3 shadow-xs hover:border-[#B45309]/30 hover:shadow-md transition-all cursor-default select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-[#B45309]/10 text-[#B45309] flex items-center justify-center transition-all duration-300">
                <IconComponent className="w-5 h-5" />
              </div>
              <span className="text-slate-800 font-sans font-bold text-xs leading-snug">
                {language === 'ar' ? item.ar : item.en}
              </span>
            </motion.div>
          );
        })}

        {/* Render bespoke custom elements with dynamic icon selection */}
        {customList.map((item, idx) => {
          const IconComponent = getIconComponent(item.icon);
          return (
            <motion.div
              key={`custom-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (activeStandard.length + idx) * 0.04 }}
              className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col items-center justify-between text-center gap-3 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-md transition-all cursor-default select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-100/70 text-indigo-600 flex items-center justify-center transition-all duration-300">
                <IconComponent className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-slate-700 font-sans font-bold text-xs leading-snug">
                {language === 'ar' ? item.ar : item.en}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
