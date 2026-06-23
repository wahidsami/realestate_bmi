import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';

export interface VisualEffects {
  enabled?: boolean;
  fade?: boolean;
  slide?: boolean;
  slideDirection?: 'up' | 'down' | 'left' | 'right';
  zoom?: boolean;
  zoomScale?: number;
  rotate?: boolean;
  rotateDegree?: number;
  scale?: boolean;
  scaleAmount?: number;

  // Animation Controls
  duration?: number;
  delay?: number;
  trigger?: 'load' | 'scroll' | 'hover';
  repeat?: 'once' | 'infinite';
  mobileEnabled?: boolean;

  // Parallax Options
  parallax?: boolean;
  parallaxSpeed?: number; // Speed multiplier, e.g. -0.2 to 0.2

  // Interactive Hover Effects
  hoverEffect?: 'none' | 'lift' | 'scaleUp' | 'glow' | 'glassShine' | 'borderShift';
  hoverScaleAmount?: number;

  // 3D Motion Follow
  mouseTracking?: boolean;
  mouseTrackingStrength?: number;

  // Ongoing CSS Floating Options
  floating?: 'none' | 'floatY' | 'sway' | 'pulsePlay' | 'slantedFloat';
  floatingSpeed?: number;

  // Aesthetic Styles
  glassmorphism?: boolean;
  glassBlur?: number;
  glassBgOpacity?: number;
  glassBorderColor?: string;

  neumorphism?: 'none' | 'flat' | 'concave' | 'convex' | 'pressed';
  neumorphicColor?: string;

  gradientBackground?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  gradientAnimate?: boolean;

  // Section Dividers
  shapeDividerTop?: 'none' | 'waves' | 'curves' | 'slant' | 'triangle';
  shapeDividerTopColor?: string;
  shapeDividerTopHeight?: number;
  shapeDividerBottom?: 'none' | 'waves' | 'curves' | 'slant' | 'triangle';
  shapeDividerBottomColor?: string;
  shapeDividerBottomHeight?: number;

  // Interactive Animations (Marquee, Counters, Reveals)
  marquee?: boolean;
  marqueeSpeed?: number;
  marqueeText?: string;
  marqueeDirection?: 'left' | 'right';

  counter?: boolean;
  counterTarget?: number;
  counterPrefix?: string;
  counterSuffix?: string;

  textReveal?: 'none' | 'chars' | 'words';
  imageReveal?: 'none' | 'wipeLeft' | 'wipeRight' | 'maskGrow';

  sticky?: boolean;
  stickyTopOffset?: number;
}

interface EffectsWrapperProps {
  effects: VisualEffects | undefined;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// ----------------- SHAPE DIVIDERS RENDERER -----------------
export const ShapeDivider: React.FC<{
  type: 'waves' | 'curves' | 'slant' | 'triangle';
  position: 'top' | 'bottom';
  color: string;
  height: number;
}> = ({ type, position, color = '#ffffff', height = 120 }) => {
  const isTop = position === 'top';
  const style: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width: '100%',
    overflow: 'hidden',
    lineHeight: 0,
    zIndex: 10,
    height: `${height}px`,
    ...(isTop ? { top: 0, transform: 'scaleY(-1)' } : { bottom: 0 }),
  };

  const svgStyle: React.CSSProperties = {
    position: 'relative',
    display: 'block',
    width: 'calc(100% + 1.3px)',
    height: `${height}px`,
  };

  const getPath = () => {
    switch (type) {
      case 'waves':
        return 'M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z';
      case 'curves':
        return 'M0,0 M1200,120 C900,120 900,0 600,0 C300,0 300,120 0,120 L0,120 L1200,120 Z';
      case 'slant':
        return 'M1200,120 L0,120 L0,0 Z';
      case 'triangle':
        return 'M600,0 L1200,120 L0,120 Z';
      default:
        return '';
    }
  };

  const getSvgProps = () => {
    switch (type) {
      case 'waves':
        return { viewBox: '0 0 1200 120', preserveAspectRatio: 'none' };
      case 'curves':
        return { viewBox: '0 0 1200 120', preserveAspectRatio: 'none' };
      case 'slant':
        return { viewBox: '0 0 1200 120', preserveAspectRatio: 'none' };
      case 'triangle':
        return { viewBox: '0 0 1200 120', preserveAspectRatio: 'none' };
      default:
        return { viewBox: '0 0 1200 120', preserveAspectRatio: 'none' };
    }
  };

  return (
    <div style={style}>
      <svg style={svgStyle} {...getSvgProps()}>
        <path d={getPath()} fill={color} />
      </svg>
    </div>
  );
};

// ----------------- COUNTER ANIMATION -----------------
const Counter: React.FC<{
  target: number;
  duration: number;
  prefix?: string;
  suffix?: string;
}> = ({ target, duration = 2, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggerRef.current) {
          triggerRef.current = true;
          let startTime: number | null = null;
          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / (duration * 1000);
            if (progress < 1) {
              setCount(Math.floor(progress * target));
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={elementRef} className="font-bold tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// ----------------- TEXT REVEAL ANIMATION -----------------
const TextReveal: React.FC<{
  text: string;
  mode: 'chars' | 'words';
  delay: number;
  duration: number;
}> = ({ text, mode, delay = 0, duration = 0.5 }) => {
  if (mode === 'words') {
    const words = text.split(' ');
    return (
      <span className="inline-flex flex-wrap gap-x-1">
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden py-0.5">
            <motion.span
              className="inline-block"
              initial={{ y: '100%', opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                delay: delay + i * 0.08,
                duration: duration,
                ease: [0.215, 0.61, 0.355, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </span>
    );
  }

  // Chars mode
  const chars = Array.from(text);
  return (
    <span className="inline-flex flex-wrap">
      {chars.map((char, i) => (
        <span key={i} className="inline-block overflow-hidden py-0.5" style={{ minWidth: char === ' ' ? '0.35em' : 'auto' }}>
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              delay: delay + i * 0.02,
              duration: duration * 0.7,
              ease: 'easeOut',
            }}
          >
            {char}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

// ----------------- IMAGE REVEAL COVER ANIMATION -----------------
const ImageRevealWrapper: React.FC<{
  type: 'wipeLeft' | 'wipeRight' | 'maskGrow';
  delay: number;
  duration: number;
  children: React.ReactNode;
}> = ({ type, delay = 0, duration = 0.8, children }) => {
  const isWipe = type === 'wipeLeft' || type === 'wipeRight';
  return (
    <div className="relative overflow-hidden group w-full h-full rounded-xl">
      <motion.div
        className="w-full h-full"
        initial={{ scale: type === 'maskGrow' ? 1.15 : 1 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: duration * 1.2, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
      {isWipe && (
        <motion.div
          className="absolute inset-0 bg-[#D4AF37] z-20"
          initial={{ x: 0 }}
          whileInView={{ x: type === 'wipeLeft' ? '-101%' : '101%' }}
          viewport={{ once: true }}
          transition={{
            delay,
            duration,
            ease: [0.77, 0, 0.175, 1],
          }}
        />
      )}
      {type === 'maskGrow' && (
        <motion.div
          className="absolute inset-0 bg-[#0F172A] z-20"
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 0 }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.1, duration: duration * 0.8, ease: 'easeOut' }}
        />
      )}
    </div>
  );
};

// ----------------- MAIN ADVANCED EFFECTS ENGINE WRAPPER -----------------
export const EffectsWrapper: React.FC<EffectsWrapperProps> = ({
  effects,
  children,
  className = '',
  style = {} as React.CSSProperties,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Hover 3D mouse tracking tilt coordinates
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // useScroll hook must be called unconditionally at the top level
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // useTransform hook must be called unconditionally at the top level
  const parallaxSpeed = effects?.parallaxSpeed || 0.15;
  const transformedY = useTransform(scrollYProgress, [0, 1], [150 * parallaxSpeed, -150 * parallaxSpeed]);

  useEffect(() => {
    setHasLoaded(true);
    const checkViewportMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewportMobile();
    window.addEventListener('resize', checkViewportMobile);
    return () => window.removeEventListener('resize', checkViewportMobile);
  }, []);

  if (!effects || effects.enabled === false) {
    return <div ref={containerRef} className={className} style={style}>{children}</div>;
  }

  // Mobile Enable Check
  const bypassAnimations = isMobile && effects.mobileEnabled === false;

  // Custom Parallax Scroll Computation
  const yParallax = (effects.parallax && !bypassAnimations && hasLoaded) ? transformedY : 0;

  // Configure transition mechanics
  const isScrollTrigger = effects.trigger === 'scroll';
  const isInstantLoad = effects.trigger === 'load' || !effects.trigger;
  const durationValue = effects.duration !== undefined ? effects.duration : 0.6;
  const delayValue = effects.delay !== undefined ? effects.delay : 0;
  const repeatMode = effects.repeat === 'infinite' ? Infinity : 0;

  // Base Entrance Transition values
  const transitionConfig = {
    duration: durationValue,
    delay: delayValue,
    repeat: repeatMode,
    repeatType: repeatMode === Infinity ? ('reverse' as const) : undefined,
    ease: 'easeOut',
  };

  // Build Initial properties
  const initialStyles: any = {};
  const animateStyles: any = {};
  const inViewStyles: any = {};

  if (!bypassAnimations) {
    // Fade
    if (effects.fade) {
      initialStyles.opacity = 0;
      if (isInstantLoad) animateStyles.opacity = 1;
      else inViewStyles.opacity = 1;
    }

    // Slide
    if (effects.slide) {
      const dir = effects.slideDirection || 'up';
      const distance = 45;
      if (dir === 'up') {
        initialStyles.y = distance;
        if (isInstantLoad) animateStyles.y = 0;
        else inViewStyles.y = 0;
      } else if (dir === 'down') {
        initialStyles.y = -distance;
        if (isInstantLoad) animateStyles.y = 0;
        else inViewStyles.y = 0;
      } else if (dir === 'left') {
        initialStyles.x = distance;
        if (isInstantLoad) animateStyles.x = 0;
        else inViewStyles.x = 0;
      } else if (dir === 'right') {
        initialStyles.x = -distance;
        if (isInstantLoad) animateStyles.x = 0;
        else inViewStyles.x = 0;
      }
    }

    // Zoom
    if (effects.zoom) {
      const zScale = effects.zoomScale || 0.85;
      initialStyles.scale = zScale;
      if (isInstantLoad) animateStyles.scale = 1;
      else inViewStyles.scale = 1;
    }

    // Rotate
    if (effects.rotate) {
      const rot = effects.rotateDegree || 12;
      initialStyles.rotate = rot;
      if (isInstantLoad) animateStyles.rotate = 0;
      else inViewStyles.rotate = 0;
    }

    // Scale
    if (effects.scale) {
      const baseScale = effects.scaleAmount || 1;
      initialStyles.scale = baseScale;
      if (isInstantLoad) animateStyles.scale = 1;
      else inViewStyles.scale = 1;
    }
  }

  // Floating Ongoing Animation Loop
  let floatingAnimate: any = {};
  let floatingTransition: any = {};

  if (effects.floating && effects.floating !== 'none' && !bypassAnimations) {
    const floatSpeed = effects.floatingSpeed || 1.0;
    switch (effects.floating) {
      case 'floatY':
        floatingAnimate = { y: [0, -12, 0] };
        floatingTransition = {
          duration: 3.5 / floatSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        };
        break;
      case 'sway':
        floatingAnimate = { rotate: [0, 4, -4, 0], x: [0, 6, -6, 0] };
        floatingTransition = {
          duration: 4.5 / floatSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        };
        break;
      case 'pulsePlay':
        floatingAnimate = { scale: [1, 1.03, 1] };
        floatingTransition = {
          duration: 2.8 / floatSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        };
        break;
      case 'slantedFloat':
        floatingAnimate = { y: [0, -10, 0], rotate: [0, 2, 0] };
        floatingTransition = {
          duration: 4.2 / floatSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        };
        break;
    }
  }

  // Hover Styling Properties
  let whileHoverAction: any = {};
  const hScaleValue = effects.hoverScaleAmount || (effects.hoverEffect === 'scaleUp' ? 1.05 : effects.hoverEffect === 'lift' ? 1.03 : 1);
  const hoverLiftY = effects.hoverEffect === 'lift' ? -8 : 0;

  if (effects.hoverEffect && effects.hoverEffect !== 'none' && !isMobile) {
    whileHoverAction = {
      scale: hScaleValue,
      y: hoverLiftY,
      transition: { duration: 0.3, ease: 'easeOut' },
    };

    if (effects.hoverEffect === 'glow') {
      whileHoverAction.boxShadow = '0 0 25px rgba(212,175,55,0.45)';
    } else if (effects.hoverEffect === 'borderShift') {
      whileHoverAction.borderColor = '#D4AF37';
    }
  }

  // Mouse tilt tracking coordinate calculator
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!effects.mouseTracking || isMobile || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate normalized point from central node (-0.5 to 0.5)
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;
    
    const strength = effects.mouseTrackingStrength || 15;
    setRotateY(relativeX * strength);
    setRotateX(-relativeY * strength);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Visual Class Builder mapping to support layout requirements
  let styledClasses = `relative select-none ${className}`;

  // Custom Glassmorphism Stylesheet properties
  const glassStyles: React.CSSProperties = {};
  if (effects.glassmorphism) {
    const blurAmount = effects.glassBlur !== undefined ? effects.glassBlur : 12;
    const opacityValue = effects.glassBgOpacity !== undefined ? effects.glassBgOpacity : 0.12;
    const borderCol = effects.glassBorderColor || 'rgba(255,255,255,0.15)';
    
    Object.assign(glassStyles, {
      backdropFilter: `blur(${blurAmount}px)`,
      WebkitBackdropFilter: `blur(${blurAmount}px)`,
      background: `rgba(255, 255, 255, ${opacityValue})`,
      border: `1px solid ${borderCol}`,
      borderRadius: style?.borderRadius || '16px',
    });
    styledClasses += ' shadow-glass';
  }

  // Neumorphism Double Shadows Setup
  const neumorphicStyles: React.CSSProperties = {};
  if (effects.neumorphism && effects.neumorphism !== 'none') {
    const bgCol = effects.neumorphicColor || '#eceff1';
    
    let boxShad = '';
    const lightColor = 'rgba(255, 255, 255, 0.82)';
    const darkShadow = 'rgba(13, 22, 34, 0.08)';
    
    if (effects.neumorphism === 'flat') {
      boxShad = `9px 12px 20px -5px ${darkShadow}, -9px -12px 20px -3px ${lightColor}`;
    } else if (effects.neumorphism === 'convex') {
      boxShad = `8px 8px 16px ${darkShadow}, -8px -8px 16px ${lightColor}`;
    } else if (effects.neumorphism === 'concave') {
      boxShad = `inset 4px 4px 10px ${darkShadow}, inset -4px -4px 10px ${lightColor}`;
    } else if (effects.neumorphism === 'pressed') {
      boxShad = `inset 6px 6px 12px ${darkShadow}, inset -6px -6px 12px ${lightColor}`;
    }

    Object.assign(neumorphicStyles, {
      backgroundColor: bgCol,
      boxShadow: boxShad,
      borderRadius: style?.borderRadius || '18px',
      border: 'none',
    });
  }

  // Gradient Background properties
  const gradientStyles: React.CSSProperties = {};
  if (effects.gradientBackground) {
    const from = effects.gradientFrom || '#0c1020';
    const to = effects.gradientTo || '#161d36';
    const angle = effects.gradientAngle !== undefined ? effects.gradientAngle : 135;

    Object.assign(gradientStyles, {
      background: `linear-gradient(${angle}deg, ${from}, ${to})`,
    });
    
    if (effects.gradientAnimate) {
      styledClasses += ' animate-gradient-shift bg-[length:400%_400%]';
    }
  }

  // Sticky Section placement
  if (effects.sticky) {
    const topOffset = effects.stickyTopOffset !== undefined ? effects.stickyTopOffset : 80;
    Object.assign(gradientStyles, {
      position: 'sticky',
      top: `${topOffset}px`,
      zIndex: 40,
    });
  }

  // Merge Styles
  const computedStyles: React.CSSProperties = {
    ...style,
    ...glassStyles,
    ...neumorphicStyles,
    ...gradientStyles,
    transformStyle: effects.mouseTracking ? 'preserve-3d font-sans' : undefined,
  };

  // ----------------- MARQUEE TICKER -----------------
  if (effects.marquee) {
    const mText = effects.marqueeText || 'BINA & EDARAH LUXURY LIVING';
    const mSpeed = effects.marqueeSpeed || 15;
    const isRtlDir = effects.marqueeDirection === 'right';
    return (
      <div 
        ref={containerRef}
        style={computedStyles}
        className={`${styledClasses} overflow-hidden whitespace-nowrap py-4 w-full select-none relative flex border-t border-b border-neutral-200/50`}
      >
        <div className="flex gap-16 shrink-0 min-w-full justify-around animate-marquee direction-normal inline-flex" style={{ flexFlow: 'row nowrap' }}>
          {Array(8).fill(mText).map((text, i) => (
            <span key={i} className="text-xl md:text-2xl font-black tracking-widest text-[#D4AF37] font-sans px-4">
              {text}
            </span>
          ))}
        </div>
        <div className="flex gap-16 shrink-0 min-w-full justify-around animate-marquee direction-normal inline-flex" aria-hidden="true" style={{ flexFlow: 'row nowrap' }}>
          {Array(8).fill(mText).map((text, i) => (
            <span key={i} className="text-xl md:text-2xl font-black tracking-widest text-[#D4AF37] font-sans px-4">
              {text}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ----------------- COUNTER WIDGET INTERACTION -----------------
  if (effects.counter && effects.counterTarget) {
    return (
      <div ref={containerRef} className={styledClasses} style={computedStyles}>
        <Counter
          target={effects.counterTarget}
          duration={durationValue}
          prefix={effects.counterPrefix}
          suffix={effects.counterSuffix}
        />
      </div>
    );
  }

  // ----------------- TEXT REVEAL CONVERSION -----------------
  if (effects.textReveal && effects.textReveal !== 'none' && typeof children === 'string') {
    return (
      <div ref={containerRef} className={styledClasses} style={computedStyles}>
        <TextReveal
          text={children}
          mode={effects.textReveal}
          delay={delayValue}
          duration={durationValue}
        />
      </div>
    );
  }

  // ----------------- IMAGE REVEAL LAYERS CONVERSION -----------------
  if (effects.imageReveal && effects.imageReveal !== 'none') {
    return (
      <ImageRevealWrapper
        type={effects.imageReveal}
        delay={delayValue}
        duration={durationValue}
      >
        <div ref={containerRef} className={styledClasses} style={computedStyles}>
          {children}
        </div>
      </ImageRevealWrapper>
    );
  }

  // Configure continuous floating position styles dynamically
  const animatedVariants = {
    initial: initialStyles,
    animate: {
      ...animateStyles,
      ...floatingAnimate,
    },
    hover: whileHoverAction,
  };

  // Compose tracking rotational matrices if active
  const mouseMotionStyles = effects.mouseTracking && !isMobile ? {
    rotateX: rotateX,
    rotateY: rotateY,
    y: yParallax,
    transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)',
  } : {
    y: yParallax,
  };

  return (
    <motion.div
      ref={containerRef}
      className={styledClasses}
      style={{ ...computedStyles, ...mouseMotionStyles }}
      initial="initial"
      animate={effects.floating && effects.floating !== 'none' ? 'animate' : (isScrollTrigger ? undefined : 'animate')}
      whileInView={isScrollTrigger ? inViewStyles : undefined}
      viewport={isScrollTrigger ? { once: true, amount: 0.12 } : undefined}
      whileHover={effects.hoverEffect && effects.hoverEffect !== 'none' ? 'hover' : undefined}
      variants={animatedVariants}
      transition={effects.floating && effects.floating !== 'none' ? floatingTransition : transitionConfig}
      onMouseMove={effects.mouseTracking ? handleMouseMove : undefined}
      onMouseLeave={effects.mouseTracking ? handleMouseLeave : undefined}
    >
      {effects.hoverEffect === 'glassShine' && (
        <div className="absolute inset-0 z-10 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none rounded-xl" />
      )}
      {children}
    </motion.div>
  );
};
