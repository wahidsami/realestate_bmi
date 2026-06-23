/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface VectorProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Premium Bilingual Brand Logo
 */
export const CorporateLogo: React.FC<VectorProps> = ({ className = 'h-12 w-auto' }) => (
  <svg
    viewBox="0 0 400 100"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Abstract geometric 'ب' and 'E' representing construction pillars */}
    <g className="text-(--color-secondary)">
      <path d="M15 15 H50 V45 H75 V15 H110 V85 H15 Z" fill="currentColor" opacity="0.9" />
      <rect x="35" y="65" width="10" height="10" fill="currentColor" />
      <path d="M110 50 L125 35 L140 50 Z" fill="currentColor" />
    </g>
    <g className="text-white">
      <path d="M150 25 H210 V35 H170 V48 H200 V58 H170 V75 H210 V85 H150 Z" fill="currentColor" />
    </g>
    {/* Clean brand text representation */}
    <text
      x="225"
      y="55"
      className="font-sans font-bold fill-white tracking-wider"
      fontSize="24"
    >
      BINA
    </text>
    <text
      x="225"
      y="80"
      className="font-mono tracking-widest font-semibold fill-(--color-secondary)"
      fontSize="14"
    >
      & EDARAH
    </text>
    <text
      x="350"
      y="60"
      className="font-sans font-extrabold fill-(--color-secondary)"
      fontSize="24"
      textAnchor="end"
    >
      بناء وإدارة
    </text>
  </svg>
);

/**
 * Premium Luxury Najdi Villa Isometric Illustration
 */
export const NajdiVillaVector: React.FC<VectorProps> = ({ className = 'w-full h-48', ...props }) => (
  <svg
    viewBox="0 0 500 350"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <rect width="100%" height="100%" fill="url(#najdiGrad)" />
    <defs>
      <linearGradient id="najdiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0E1B17" />
        <stop offset="100%" stopColor="#0B251E" />
      </linearGradient>
      <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#aa8210" />
      </linearGradient>
    </defs>
    
    {/* Floor plane shadow */}
    <ellipse cx="250" cy="280" rx="200" ry="40" fill="#030806" opacity="0.8" />
    
    {/* Najdi traditional geometric building segments */}
    {/* Left Wall Block */}
    <path d="M120 180 L220 230 L220 120 L120 70 Z" fill="#D4AF37" opacity="0.35" />
    {/* Right Wall Block */}
    <path d="M220 230 L380 150 L380 40 L220 120 Z" fill="#C5A059" opacity="0.5" />
    {/* Roof */}
    <path d="M120 70 L220 120 L380 40 L280 -10 Z" fill="#15382F" opacity="0.4" />
    
    {/* Modern architectural extension - glass facade */}
    <path d="M180 210 L300 150 L300 90 L180 150 Z" fill="#4ea5cd" opacity="0.3" />
    <path d="M210 195 L270 165 L270 115 L210 145 Z" fill="#9de6ff" opacity="0.25" />
    
    {/* Royal entrance door in Saudi gold decoration */}
    <path d="M240 220 L270 205 L270 160 L240 175 Z" fill="url(#goldAccent)" />
    <circle cx="255" cy="190" r="2" fill="#fff" />
    
    {/* Traditional triangular Najdi wall cutouts */}
    <polygon points="150,110 160,110 155,100" fill="#000" opacity="0.5" />
    <polygon points="175,123 185,123 180,113" fill="#000" opacity="0.5" />
    <polygon points="320,90 330,90 325,80" fill="#000" opacity="0.5" />
    <polygon points="345,78 355,78 350,68" fill="#000" opacity="0.5" />
    
    {/* Premium geometric layout bars */}
    <rect x="20" y="20" width="8" height="60" fill="#D4AF37" opacity="0.6" />
    <rect x="35" y="20" width="3" height="40" fill="#D4AF37" opacity="0.3" />
    
    {/* Luxury title indicator */}
    <text x="30" y="320" fill="#C5A059" fontSize="16" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.1em">BINA ENTERPRISE VILLA</text>
  </svg>
);

/**
 * Premium Luxury Penthouse High-Rise Illustration
 */
export const PenthouseVector: React.FC<VectorProps> = ({ className = 'w-full h-48', ...props }) => (
  <svg
    viewBox="0 0 500 350"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <rect width="100%" height="100%" fill="url(#skyGrad)" />
    <defs>
      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0B1A30" />
        <stop offset="100%" stopColor="#050C16" />
      </linearGradient>
      <linearGradient id="glowPool" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#00838F" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    
    {/* Backdrop glowing grid representing modern city skylines */}
    <line x1="80" y1="50" x2="80" y2="350" stroke="#102543" strokeWidth="1" />
    <line x1="160" y1="50" x2="160" y2="350" stroke="#102543" strokeWidth="1" />
    <line x1="340" y1="50" x2="340" y2="350" stroke="#102543" strokeWidth="1" />
    <line x1="420" y1="50" x2="420" y2="350" stroke="#102543" strokeWidth="1" />
    
    {/* Ground reflections */}
    <ellipse cx="250" cy="300" rx="180" ry="25" fill="#010408" opacity="0.9" />

    {/* Tower structure */}
    <path d="M180 320 L320 320 L320 60 L180 60 Z" fill="#1A334E" opacity="0.7" />
    
    {/* Glowing elite glass terraces and luxury penthouses */}
    <rect x="185" y="70" width="130" height="35" rx="2" fill="url(#glowPool)" stroke="#D4AF37" strokeWidth="1.5" />
    <rect x="185" y="115" width="130" height="25" rx="2" fill="#0C1F35" stroke="#1E5288" strokeWidth="1" />
    <rect x="185" y="150" width="130" height="25" rx="2" fill="#0C1F35" stroke="#1E5288" strokeWidth="1" />
    <rect x="185" y="185" width="130" height="25" rx="2" fill="#0C1F35" stroke="#1E5288" strokeWidth="1" />
    <rect x="185" y="220" width="130" height="25" rx="2" fill="#0C1F35" stroke="#1E5288" strokeWidth="1" />
    <rect x="185" y="255" width="130" height="65" rx="2" fill="#152B44" stroke="#D4AF37" strokeWidth="0.5" />

    {/* Helipad / roof architectural fins */}
    <path d="M160 60 L340 60 L310 50 L190 50 Z" fill="#D4AF37" opacity="0.8" />
    <line x1="250" y1="50" x2="250" y2="20" stroke="#D4AF37" strokeWidth="3" />
    <circle cx="250" cy="15" r="4" fill="#E65100" />
    
    {/* Private sky pool glowing cascade */}
    <path d="M190 95 L240 95 L240 102 L190 97 Z" fill="#00E5FF" opacity="0.7" />
    
    {/* VIP textual sign */}
    <text x="250" y="295" fill="#FFF" opacity="0.4" fontSize="12" fontFamily="monospace" textAnchor="middle" letterSpacing="0.4em">ROYAL LEVEL</text>
  </svg>
);

/**
 * Premium Modern Urban Apartments Vector
 */
export const SmartApartmentVector: React.FC<VectorProps> = ({ className = 'w-full h-48', ...props }) => (
  <svg
    viewBox="0 0 500 350"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <rect width="100%" height="100%" fill="url(#aptGrad)" />
    <defs>
      <linearGradient id="aptGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#151A18" />
        <stop offset="100%" stopColor="#0B1C17" strokeWidth="1" />
      </linearGradient>
    </defs>
    
    {/* Floor plane */}
    <ellipse cx="250" cy="270" rx="220" ry="30" fill="#020806" opacity="0.9" />

    {/* Linear sleek block representation with copper lines */}
    <path d="M100 240 L400 240 L370 100 L130 100 Z" fill="#1C382F" opacity="0.6" stroke="#C5A059" strokeWidth="2" />
    
    {/* Individual window bays */}
    <rect x="150" y="120" width="35" height="40" fill="#D4AF37" opacity="0.3" />
    <rect x="150" y="175" width="35" height="45" fill="#1F2A26" stroke="#C5A059" strokeWidth="0.5" />
    
    <rect x="205" y="120" width="35" height="40" fill="#3D8270" opacity="0.4" />
    <rect x="205" y="175" width="35" height="45" fill="#1F2A26" stroke="#C5A059" strokeWidth="0.5" />
    
    <rect x="260" y="120" width="35" height="40" fill="#D4AF37" opacity="0.35" />
    <rect x="260" y="175" width="35" height="45" fill="#1F2A26" stroke="#C5A059" strokeWidth="0.5" />
    
    <rect x="315" y="120" width="35" height="40" fill="#366F60" opacity="0.2" />
    <rect x="315" y="175" width="35" height="45" fill="#1F2A26" stroke="#C5A059" strokeWidth="0.5" />

    {/* Balcony lines */}
    <line x1="90" y1="240" x2="410" y2="240" stroke="#D4AF37" strokeWidth="3" />
    
    {/* Abstract trees for greenery */}
    <circle cx="80" cy="230" r="15" fill="#104335" opacity="0.9" />
    <rect x="77" y="230" width="6" height="20" fill="#332211" />
    
    <circle cx="410" cy="230" r="20" fill="#1B5545" opacity="0.8" />
    <rect x="407" y="230" width="6" height="20" fill="#332211" />
  </svg>
);

/**
 * Render procedural icon representing any generic project or property
 * without media items uploaded.
 */
export const ArchitecturalPlanSVG: React.FC<VectorProps> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="all"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="0.5"
  >
    <rect width="100" height="100" fill="var(--color-primary, #0B251E)" opacity="0.9" />
    <g stroke="var(--color-secondary, #C5A059)" opacity="0.5">
      {/* Blueprint grid lines */}
      <line x1="10" y1="0" x2="10" y2="100" />
      <line x1="20" y1="0" x2="20" y2="100" />
      <line x1="30" y1="0" x2="30" y2="100" />
      <line x1="40" y1="0" x2="40" y2="100" />
      <line x1="50" y1="0" x2="50" y2="100" />
      <line x1="60" y1="0" x2="60" y2="100" />
      <line x1="70" y1="0" x2="70" y2="100" />
      <line x1="80" y1="0" x2="80" y2="100" />
      <line x1="90" y1="0" x2="90" y2="100" />
      
      <line x1="0" y1="10" x2="100" y2="10" />
      <line x1="0" y1="20" x2="100" y2="20" />
      <line x1="0" y1="30" x2="100" y2="30" />
      <line x1="0" y1="40" x2="100" y2="40" />
      <line x1="0" y1="50" x2="100" y2="50" />
      <line x1="0" y1="60" x2="100" y2="60" />
      <line x1="0" y1="70" x2="100" y2="70" />
      <line x1="0" y1="80" x2="100" y2="80" />
      <line x1="0" y1="90" x2="100" y2="90" />
      
      {/* Structural floor plan drafts */}
      <rect x="25" y="25" width="50" height="50" fill="none" strokeWidth="1.5" />
      <line x1="25" y1="25" x2="75" y2="75" strokeWidth="1" />
      <line x1="75" y1="25" x2="25" y2="75" strokeWidth="1" />
      <circle cx="50" cy="50" r="15" fill="none" strokeWidth="1.2" />
    </g>
    <text x="50" y="93" fill="var(--color-secondary)" fontSize="5" textAnchor="middle" letterSpacing="0.1em" opacity="0.8">BINA DESIGN SCHEME</text>
  </svg>
);
