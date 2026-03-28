=== FILE: app/globals.css ===
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* ── Light Mode (default) ── */
  :root {
    --card: 0 0% 100%;
    --ring: 38 92% 44%;
    --input: 220 13% 91%;
    --muted: 210 20% 98%;
    --accent: 48 100% 96%;
    --border: 220 13% 91%;
    --radius: 0.5rem;
    --chart-1: 38 92% 50%;
    --chart-2: 32 95% 44%;
    --chart-3: 26 90% 37%;
    --chart-4: 21 82% 31%;
    --chart-5: 18 78% 26%;
    --popover: 0 0% 100%;
    --primary: 38 92% 44%;
    --sidebar: 210 20% 98%;
    --spacing: 0.25rem;
    --font-mono: "JetBrains Mono", "Fira Code", monospace;
    --font-sans: "DM Sans", "Inter", "Helvetica Neue", Arial, sans-serif;
    --font-serif: "Source Serif 4", Georgia, serif;
    --secondary: 220 14% 96%;
    --background: 0 0% 100%;
    --foreground: 0 0% 15%;
    --destructive: 0 84% 60%;
    --shadow-blur: 8px;
    --shadow-color: hsl(0 0% 0%);
    --sidebar-ring: 38 92% 44%;
    --shadow-spread: -1px;
    --letter-spacing: 0em;
    --shadow-opacity: 0.1;
    --sidebar-accent: 48 100% 96%;
    --sidebar-border: 220 13% 91%;
    --card-foreground: 0 0% 15%;
    --shadow-offset-x: 0px;
    --shadow-offset-y: 4px;
    --sidebar-primary: 38 92% 44%;
    --muted-foreground: 220 9% 46%;
    --accent-foreground: 21 82% 31%;
    --popover-foreground: 0 0% 15%;
    --primary-foreground: 0 0% 100%;
    --sidebar-foreground: 0 0% 15%;
    --secondary-foreground: 215 14% 34%;
    --destructive-foreground: 0 0% 100%;
    --sidebar-accent-foreground: 21 82% 31%;
    --sidebar-primary-foreground: 0 0% 100%;
    --success: 142 71% 45%;
    --success-foreground: 0 0% 100%;
    --warning: 35 92% 50%;
    --warning-foreground: 0 0% 100%;
    color-scheme: light;
  }

  /* ── Dark Mode ── */
  .dark {
    --card: 24 10% 10%;
    --ring: 38 92% 44%;
    --input: 20 8% 16%;
    --muted: 24 10% 10%;
    --accent: 32 80% 18%;
    --border: 20 6% 14%;
    --chart-1: 43 96% 56%;
    --chart-2: 38 92% 44%;
    --chart-3: 32 95% 37%;
    --chart-4: 26 90% 31%;
    --chart-5: 21 82% 26%;
    --popover: 24 10% 10%;
    --primary: 38 92% 44%;
    --sidebar: 20 14% 5%;
    --secondary: 24 10% 10%;
    --background: 20 14% 4%;
    --foreground: 40 6% 97%;
    --destructive: 0 84% 60%;
    --sidebar-ring: 38 92% 44%;
    --sidebar-accent: 32 80% 18%;
    --sidebar-border: 20 6% 14%;
    --card-foreground: 40 6% 97%;
    --sidebar-primary: 38 92% 44%;
    --muted-foreground: 0 0% 50%;
    --accent-foreground: 43 96% 56%;
    --popover-foreground: 40 6% 97%;
    --primary-foreground: 0 0% 100%;
    --sidebar-foreground: 40 6% 97%;
    --secondary-foreground: 40 6% 90%;
    --destructive-foreground: 0 0% 100%;
    --sidebar-accent-foreground: 43 96% 56%;
    --sidebar-primary-foreground: 0 0% 100%;
    --success: 142 71% 45%;
    --success-foreground: 0 0% 100%;
    --warning: 35 92% 50%;
    --warning-foreground: 0 0% 100%;
    color-scheme: dark;
  }
}

/* Smooth theme transition */
*,
*::before,
*::after {
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.1s ease,
    box-shadow 0.2s ease;
}

/* Disable transition on page load to prevent flash */
.no-transition * {
  transition: none !important;
}

/* Improved focus ring using primary color */
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-family: 'DM Sans', var(--font-sans, 'Inter', system-ui, sans-serif);
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'DM Sans', var(--font-geist-sans, 'Inter', system-ui, sans-serif);
    font-feature-settings: "ss01", "ss02";
  }
}

html {
  scroll-behavior: smooth;
}

/* ── Custom Scrollbar ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.08);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.15);
}

/* Light mode scrollbar */
:root ::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
}
:root ::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.4);
}

/* ── Global Input/Select Focus ── */
input:focus,
select:focus,
textarea:focus {
  border-color: #D97706 !important;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1) !important;
  outline: none;
}

/* ── Global Button Styles ── */
button {
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

/* ── Aurora Background (layout-level, all pages) ── */
.aurora-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
  background: hsl(0, 0%, 99%);
}

.dark .aurora-bg {
  background: #0C0A09;
}

.aurora-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  will-change: transform;
  transform: translateZ(0);
}

/* Light mode orbs — subtle amber */
.orb-1 {
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, hsl(38 92% 50% / 0.08) 0%, transparent 70%);
  top: -200px;
  left: -150px;
  animation: orb1 22s ease-in-out infinite alternate;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, hsl(32 95% 44% / 0.06) 0%, transparent 70%);
  top: 30%;
  right: -100px;
  animation: orb2 18s ease-in-out infinite alternate;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, hsl(38 92% 50% / 0.05) 0%, transparent 70%);
  bottom: 10%;
  left: 25%;
  animation: orb3 25s ease-in-out infinite alternate;
}

/* Dark mode orbs — amber glow */
.dark .orb-1 {
  background: radial-gradient(circle, hsl(38 92% 50% / 0.15) 0%, transparent 70%);
}

.dark .orb-2 {
  background: radial-gradient(circle, hsl(32 95% 44% / 0.10) 0%, transparent 70%);
}

.dark .orb-3 {
  background: radial-gradient(circle, hsl(26 90% 37% / 0.08) 0%, transparent 70%);
}

@keyframes orb1 {
  0%   { transform: translate(0px, 0px) scale(1); }
  100% { transform: translate(120px, 80px) scale(1.15); }
}
@keyframes orb2 {
  0%   { transform: translate(0px, 0px) scale(1); }
  100% { transform: translate(-80px, 100px) scale(0.9); }
}
@keyframes orb3 {
  0%   { transform: translate(0px, 0px); }
  100% { transform: translate(60px, -90px); }
}

/* ── Animated Background Orbs (landing page only) ── */
.bg-animated {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: hsl(0, 0%, 99%);
}

.dark .bg-animated {
  background: #0C0A09;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  will-change: transform;
  transform: translateZ(0);
}

.bg-orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, hsl(38 92% 50%) 0%, transparent 70%);
  top: -200px;
  left: -100px;
  animation: orbFloat1 20s linear infinite;
}

.bg-orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, hsl(32 95% 44%) 0%, transparent 70%);
  top: 10%;
  right: -150px;
  animation: orbFloat2 25s linear infinite;
  opacity: 0.2;
}

.bg-orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, hsl(26 90% 37%) 0%, transparent 70%);
  bottom: 20%;
  left: 20%;
  animation: orbFloat3 18s linear infinite;
  opacity: 0.15;
}

.bg-orb-4 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, hsl(142 71% 45%) 0%, transparent 70%);
  bottom: -100px;
  right: 10%;
  animation: orbFloat4 22s linear infinite;
  opacity: 0.12;
}

@keyframes orbFloat1 {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  25%       { transform: translate(80px, 60px) scale(1.1); }
  50%       { transform: translate(40px, 120px) scale(0.95); }
  75%       { transform: translate(-40px, 60px) scale(1.05); }
}

@keyframes orbFloat2 {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  33%      { transform: translate(-60px, 80px) scale(1.1); }
  66%      { transform: translate(-100px, 30px) scale(0.9); }
}

@keyframes orbFloat3 {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  50%      { transform: translate(60px, -80px) scale(1.15); }
}

@keyframes orbFloat4 {
  0%, 100% { transform: translate(0px, 0px); }
  25%      { transform: translate(-50px, -40px); }
  75%      { transform: translate(30px, -60px); }
}

.dark .bg-animated::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(12, 10, 9, 0.3);
  pointer-events: none;
}

/* ── Page Hero Background ── */
.page-hero-bg {
  background:
    radial-gradient(ellipse 100% 60% at 50% -10%,
      hsl(38 92% 50% / 0.10) 0%,
      hsl(32 95% 44% / 0.04) 50%,
      transparent 100%
    ),
    white;
}

.dark .page-hero-bg {
  background:
    radial-gradient(ellipse 100% 60% at 50% -10%,
      hsl(38 92% 50% / 0.08) 0%,
      transparent 100%
    ),
    hsl(var(--background));
}

/* ── Gradient Hero Background (hero section) ── */
.hero-gradient {
  background: transparent;
}

/* ── Glass utility ── */
@layer utilities {
  .glass {
    background: hsl(var(--card) / 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid hsl(var(--border) / 0.5);
  }
  .glass-dark {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .gradient-text {
    @apply bg-clip-text text-transparent;
    background-image: linear-gradient(135deg, #F59E0B, #D97706);
  }
  .gradient-text-amber {
    @apply bg-clip-text text-transparent;
    background-image: linear-gradient(135deg, #F59E0B, #D97706);
  }
  .gradient-text-blue {
    @apply bg-clip-text text-transparent;
    background-image: linear-gradient(135deg, #F59E0B, #D97706);
  }
  .btn-shine {
    position: relative;
    overflow: hidden;
  }
  .btn-shine::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -75%;
    width: 50%;
    height: 200%;
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
    transform: skewX(-20deg);
    transition: left 0.6s ease;
  }
  .btn-shine:hover::after {
    left: 125%;
  }
}

/* ── Marquee (sonsuz kayan şerit) ── */
.marquee-container {
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 30s linear infinite;
}
.marquee-track:hover {
  animation-play-state: paused;
}
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ── Bento grid ── */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto;
  gap: 1rem;
}
@media (max-width: 1024px) {
  .bento-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .bento-grid { grid-template-columns: 1fr; }
}

/* ── Gradient border card ── */
.gradient-border-card {
  background: hsl(var(--card));
  border: 1px solid transparent;
  background-clip: padding-box;
  position: relative;
}
.gradient-border-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(135deg, hsl(var(--primary) / 0.4), transparent 50%, hsl(var(--secondary) / 0.2));
  z-index: -1;
}

/* ── Animated underline ── */
.animated-underline {
  background-image: linear-gradient(hsl(var(--primary)), hsl(var(--primary)));
  background-size: 0% 2px;
  background-repeat: no-repeat;
  background-position: left bottom;
  transition: background-size 0.3s ease;
}
.animated-underline:hover {
  background-size: 100% 2px;
}

/* ── Sonner toast fix ── */
[data-sonner-toaster] { pointer-events: none !important; }
[data-sonner-toast] { pointer-events: auto !important; }

/* ── Dashboard sidebar scrollbar thin ── */
.scrollbar-thin::-webkit-scrollbar { width: 4px; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 2px; }

/* ── Blog prose ── */
.prose-blog { color: rgba(255,255,255,0.75); font-size: 0.9375rem; line-height: 1.8; }
.prose-blog h2 { color: #fff; font-size: 1.2rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; }
.prose-blog p { margin-bottom: 1.25rem; }
.prose-blog ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
.prose-blog ul li { margin-bottom: 0.4rem; }
.prose-blog strong { color: rgba(255,255,255,0.9); font-weight: 600; }
.prose-blog em { color: rgba(255,255,255,0.5); font-style: italic; }
.prose-blog pre { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; padding: 1rem 1.25rem; overflow-x: auto; margin-bottom: 1.25rem; }
.prose-blog code { font-family: "JetBrains Mono", "Fira Code", monospace; font-size: 0.85em; color: #F59E0B; }
=== END ===

=== FILE: tailwind.config.ts ===
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        geist: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium-sm': '0 1px 2px rgba(2,6,23,.06)',
        'premium-md': '0 8px 24px rgba(2,6,23,.08)',
        'premium-lg': '0 16px 48px rgba(2,6,23,.12)',
        'glow-sm': '0 0 15px rgba(217, 119, 6, 0.15)',
        'glow-md': '0 0 30px rgba(217, 119, 6, 0.2)',
        'glow-amber': '0 0 20px rgba(217, 119, 6, 0.3)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%, 90%, 100%': { opacity: '1' },
          '60%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'border-beam': {
          '100%': { 'offset-distance': '100%' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'gradient-shift': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
        'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        marquee: 'marquee 30s linear infinite',
        'marquee-slow': 'marquee 50s linear infinite',
        'count-up': 'count-up 0.6s ease-out both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
=== END ===

=== FILE: components/layout/sidebar.tsx ===
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import {
  Crown, FileText, Upload, CreditCard, ArrowRight, Shield, Store,
} from 'lucide-react';
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from '@/config/navigation';
import { isProUser } from '@/utils/access';
import { ProStatusCard } from '@/components/shared/ProStatusCard';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isPro = isProUser(user);

  return (
    <aside className="flex h-full w-full flex-col bg-[rgba(255,255,255,0.01)] border-r border-[rgba(255,255,255,0.06)] overflow-y-auto scrollbar-thin">
      <div className="flex h-full flex-col px-3 py-5 gap-6">

        {/* Pro Status */}
        <div className="w-full">
          <ProStatusCard />
        </div>

        {/* Main Nav */}
        <div>
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.3)]">
            Menu
          </p>
          <div className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const isLocked = (item as any).restricted && !isPro;

              if (isLocked) {
                return (
                  <div key={item.href} className="group relative">
                    <div className="absolute right-2.5 top-2.5 z-10 pointer-events-none">
                      <div className="bg-amber-900/40 text-amber-400 p-0.5 rounded-full">
                        <Crown className="h-2.5 w-2.5" />
                      </div>
                    </div>
                    <Link
                      href="/pricing"
                      className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.3)] hover:bg-white/5 transition-all duration-150"
                    >
                      <item.icon className="h-4 w-4 shrink-0 opacity-50" />
                      <span className="opacity-60">{item.label}</span>
                    </Link>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-amber-500/10 border border-amber-500/15 text-amber-400 font-semibold'
                      : 'text-[rgba(255,255,255,0.5)] hover:bg-white/5 hover:text-white border border-transparent'
                  )}
                >
                  <item.icon className={cn(
                    'h-4 w-4 shrink-0 transition-colors duration-150',
                    isActive ? 'text-amber-400' : 'text-[rgba(255,255,255,0.5)] group-hover:text-white'
                  )} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.3)]">
            Hizli Islemler
          </p>
          <div className="flex flex-col gap-0.5">
            {[
              { href: '/dashboard', icon: FileText, label: 'PDF Rapor' },
              { href: '/products', icon: Upload, label: 'CSV Ice Aktar' },
              { href: '/settings/commission-rates', icon: Store, label: 'Komisyon Oranlari' },
              { href: '/pricing', icon: CreditCard, label: 'Fiyatlandirma' },
            ].map((action) => (
              <Link
                key={action.href + action.label}
                href={action.href}
                className="group flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-xs font-medium text-[rgba(255,255,255,0.5)] hover:bg-white/5 hover:text-white transition-all duration-150"
              >
                <div className="p-1 rounded-lg bg-white/[0.03] group-hover:bg-white/[0.06] border border-[rgba(255,255,255,0.06)] transition-all">
                  <action.icon className="h-3 w-3" />
                </div>
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Nav */}
        <div>
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.3)]">
            Hesap
          </p>
          <div className="flex flex-col gap-0.5">
            {BOTTOM_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const isPremium = item.label === 'Premium';

              if (isPremium) {
                if (isPro) return null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative block overflow-hidden rounded-2xl p-3.5 text-sm font-semibold transition-all duration-200 mb-1"
                    style={{
                      background: 'rgba(217,119,6,0.05)',
                      border: '1px solid rgba(217,119,6,0.12)',
                    }}
                  >
                    <p className="text-amber-400 font-semibold text-sm mb-1">Pro&apos;ya Yukselt</p>
                    <p className="text-[rgba(255,255,255,0.3)] text-xs mb-3">Tum ozelliklere eris</p>
                    <div
                      className="w-full text-center py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}
                    >
                      Planlari Gor
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-amber-500/10 border border-amber-500/15 text-amber-400 font-semibold'
                      : 'text-[rgba(255,255,255,0.5)] hover:bg-white/5 hover:text-white border border-transparent'
                  )}
                >
                  <item.icon className={cn(
                    'h-4 w-4 shrink-0 transition-colors duration-150',
                    isActive ? 'text-amber-400' : 'text-[rgba(255,255,255,0.5)] group-hover:text-white'
                  )} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin */}
        {user?.plan === 'admin' && (
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.5)] hover:bg-white/5 hover:text-white transition-all border border-transparent"
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </Link>
        )}

        {/* Version */}
        <div className="text-[9px] text-[rgba(255,255,255,0.15)] font-mono text-center pb-1">
          v{process.env.NEXT_PUBLIC_BUILD_ID || '1.0.0'}
        </div>

      </div>
    </aside>
  );
}
=== END ===

=== FILE: components/layout/navbar.tsx ===
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { NotificationDrawer } from '@/components/dashboard/notification-drawer';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from '@/config/navigation';
import { KarnetLogo } from '@/components/shared/KarnetLogo';

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(12,10,9,0.85)] backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6">
        <Link href={user ? '/dashboard' : '/'} className="flex items-center">
          <KarnetLogo size={36} />
        </Link>
        <div className="flex flex-1" />

        <div className="hidden items-center gap-2 md:flex">
          {!user ? (
            <>
              <Link href="/pricing">
                <Button variant="ghost" size="sm" className="rounded-xl font-medium text-[rgba(255,255,255,0.5)] hover:text-white">Fiyatlandirma</Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" size="sm" className="rounded-xl font-medium border-[rgba(255,255,255,0.06)]">Giris Yap</Button>
              </Link>
              <Link href="/auth">
                <Button size="sm" className="rounded-xl font-medium text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}>
                  Ucretsiz Basla
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[rgba(255,255,255,0.5)] mr-2 hidden lg:inline-block">
                {user.email}
              </span>
              <NotificationDrawer />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user && <NotificationDrawer />}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[rgba(255,255,255,0.06)] bg-[#0C0A09] px-4 py-4 md:hidden overflow-y-auto max-h-[calc(100vh-64px)]">
          <div className="flex flex-col gap-1.5">
            {user ? (
              <>
                {NAV_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start rounded-xl gap-2 text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-white/5">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}

                <div className="my-2 border-t border-[rgba(255,255,255,0.06)]" />

                {BOTTOM_NAV_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start rounded-xl gap-2 text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-white/5">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}

                <Button variant="outline" className="w-full rounded-xl mt-2 border-[rgba(255,255,255,0.06)]" onClick={() => { logout(); setMobileOpen(false); }}>
                  Cikis
                </Button>
              </>
            ) : (
              <>
                <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-xl text-[rgba(255,255,255,0.5)] hover:text-white">Fiyatlandirma</Button>
                </Link>
                <Link href="/auth" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}>Giris Yap</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
=== END ===

=== FILE: components/layout/dashboard-layout.tsx ===
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

import { useAuth } from '@/contexts/auth-context';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sticky Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex w-full pt-16">
        {/* Fixed Left Sidebar (Desktop) */}
        <div className="hidden md:fixed md:left-0 md:top-16 md:bottom-0 md:flex md:w-60 md:flex-col">
          <Sidebar />
        </div>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto md:pl-60 h-[calc(100vh-64px)]">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
=== END ===

=== FILE: app/layout.tsx ===
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { ThemeProvider } from '@/contexts/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { AlertProvider } from '@/contexts/alert-context';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Karnet',
    template: '%s | Karnet',
  },
  description: 'Urun portfolyonuzun anlik karlilik ve risk durumu.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://karnet.com',
    title: 'Karnet',
    description: 'Urun portfolyonuzun anlik karlilik ve risk durumu.',
    siteName: 'Karnet',
    images: [
      {
        url: '/brand/og.png',
        width: 1200,
        height: 630,
        alt: 'Karnet Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karnet',
    description: 'Urun portfolyonuzun anlik karlilik ve risk durumu.',
    images: ['/brand/og.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} ${GeistSans.variable} font-sans`}>
        {/* Aurora animated background — all pages */}
        <div className="aurora-bg">
          <div className="aurora-orb orb-1" />
          <div className="aurora-orb orb-2" />
          <div className="aurora-orb orb-3" />
        </div>
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <AuthProvider>
            <AlertProvider>
              {children}
            </AlertProvider>
            <Toaster
              richColors
              position="top-right"
              style={{ pointerEvents: 'none' }}
              toastOptions={{
                style: { pointerEvents: 'auto' },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
=== END ===

=== FILE: app/dashboard/page.tsx ===
'use client';

import { useState, useEffect } from 'react';
import { useAlerts } from '@/contexts/alert-context';
import { deleteAnalysis as storageDeleteAnalysis } from '@/lib/api/analyses';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { KPICard } from '@/components/shared/kpi-card';
import { ProductsTable } from '@/components/dashboard/products-table';
import { RiskChart } from '@/components/dashboard/risk-chart';
import { ProfitTrendChart } from '@/components/dashboard/profit-trend-chart';
import { ParetoChart } from '@/components/dashboard/pareto-chart';
import { PazaryeriIstatistikKarti } from '@/components/shared/PazaryeriIstatistikKarti';
import { formatCurrency, formatPercent } from '@/components/shared/format';
import { TrendingUp, Percent, AlertTriangle, Star, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GeneralRiskCard } from '@/components/dashboard/general-risk-card';
import { RecommendationsPanel } from '@/components/dashboard/recommendations-panel';

interface ConnStatus {
  status: string;
  seller_id?: string;
}

export default function DashboardPage() {
  const { analyses, loading, refresh } = useAlerts();

  const [trendyolConn, setTrendyolConn] = useState<ConnStatus>({ status: 'disconnected' });

  useEffect(() => {
    fetch('/api/marketplace/trendyol')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setTrendyolConn({ status: d.status ?? 'disconnected', seller_id: d.seller_id });
      })
      .catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await storageDeleteAnalysis(id);
      if (res.success) {
        toast.success('Analiz silindi.');
        await refresh();
      } else {
        toast.error('Silme islemi basarisiz.');
      }
    } catch {
      toast.error('Hata olustu.');
    }
  };

  const totalProfit = analyses.reduce((sum, a) => sum + a.result.monthly_net_profit, 0);
  const avgMargin =
    analyses.length > 0
      ? analyses.reduce((sum, a) => sum + a.result.margin_pct, 0) / analyses.length
      : 0;
  const riskyCount = analyses.filter(
    (a) => a.risk.level === 'risky' || a.risk.level === 'dangerous'
  ).length;
  const mostProfitable =
    analyses.length > 0
      ? analyses.reduce(
          (best, a) =>
            a.result.monthly_net_profit > best.result.monthly_net_profit ? a : best,
          analyses[0]
        )
      : null;

  if (loading && analyses.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Veriler yukleniyor...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Header with Risk Card */}
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-between border-b border-[rgba(255,255,255,0.06)] pb-6">
          <div className="space-y-1.5 w-full lg:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Panel</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Urun portfolyonuzun anlik karlilik ve risk durumu.
            </p>
          </div>
          <div className="w-full lg:w-auto min-w-0 lg:min-w-[300px]">
            <GeneralRiskCard />
          </div>
        </div>

        {/* Actionable Recommendations */}
        <RecommendationsPanel analyses={analyses} />

        {/* Dashboard KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Aylik Tahmini Kar"
            value={formatCurrency(totalProfit)}
            subtitle={totalProfit >= 0 ? 'Toplam net kar' : 'Toplam zarar'}
            icon={TrendingUp}
            trend={totalProfit >= 0 ? 'up' : 'down'}
          />
          <KPICard
            title="Ortalama Marj"
            value={formatPercent(avgMargin)}
            subtitle={`${analyses.length} aktif urun`}
            icon={Percent}
            trend={avgMargin >= 15 ? 'up' : avgMargin >= 5 ? 'neutral' : 'down'}
          />
          <KPICard
            title="Kritik Urun"
            value={riskyCount.toString()}
            subtitle={riskyCount > 0 ? 'Acil aksiyon gerekli' : 'Risk bulunamadi'}
            icon={AlertTriangle}
            trend={riskyCount > 0 ? 'down' : 'up'}
          />
          <KPICard
            title="En Karli Urun"
            value={mostProfitable ? mostProfitable.input.product_name : '-'}
            subtitle={
              mostProfitable
                ? formatCurrency(mostProfitable.result.monthly_net_profit)
                : 'Henuz veri yok'
            }
            icon={Star}
          />
        </div>

        {/* Pazaryeri Istatistikleri */}
        <PazaryeriIstatistikKarti
          bagliPazaryerleri={[
            { id: 'trendyol', status: trendyolConn.status, supplier_id: trendyolConn.seller_id },
            { id: 'hepsiburada', status: 'disconnected' },
          ]}
        />

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProfitTrendChart analyses={analyses} />
          </div>
          <div className="space-y-6">
            <ParetoChart analyses={analyses} />
            <RiskChart analyses={analyses} />
          </div>
        </div>

        {/* Products Table Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Son Analizler</h2>
            </div>
          </div>
          <ProductsTable analyses={analyses.slice(0, 10)} onDelete={handleDelete} />
        </div>
      </div>
    </DashboardLayout>
  );
}
=== END ===

=== FILE: app/products/page.tsx ===
'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useAlerts } from '@/contexts/alert-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProductsTable } from '@/components/dashboard/products-table';
import { deleteAnalysis, saveAnalysis, generateId } from '@/lib/api/analyses';
import { parseCSV, analysesToCSV, analysesToJSON } from '@/lib/csv';
import { calculateProfit } from '@/utils/calculations';
import { calculateRisk } from '@/utils/risk-engine';
import { UpgradeModal } from '@/components/shared/upgrade-modal';
import { Button } from '@/components/ui/button';
import { Upload, Download, Lock, Settings2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { BulkUpdateModal } from '@/components/dashboard/bulk-update-modal';
import { CSVImportSection } from '@/components/dashboard/csv-import-section';
import { toast } from 'sonner';
import { isProUser } from '@/utils/access';

export default function ProductsPage() {
  const { user } = useAuth();
  const { analyses, loading, refresh } = useAlerts();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);

  const isPro = isProUser(user);

  const handleDelete = async (id: string) => {
    const result = await deleteAnalysis(id);
    if (!result.success) {
      toast.error(`Silme islemi basarisiz: ${result.error}`);
      return;
    }

    toast.success('Urun analizi silindi.');
    await refresh();
  };

  const performImport = async (data: any[]) => {
    if (!user) return;

    if (!isPro && analyses.length + data.length > 5) {
      setShowUpgrade(true);
      toast.error('Ucretsiz planda en fazla 5 analiz yapabilirsiniz. Toplu yukleme icin Pro plana gecmelisiniz.');
      return;
    }

    toast.info(`${data.length} urun yukleniyor...`);
    for (const input of data) {
      const result = calculateProfit(input);
      const risk = calculateRisk(input, result);
      await saveAnalysis({
        id: generateId(),
        userId: user.id,
        input,
        result,
        risk,
        createdAt: new Date().toISOString(),
      });
    }
    toast.success('Import tamamlandi.');
    await refresh();
  };

  const handleExportJSON = () => {
    if (analyses.length === 0) return;
    const json = analysesToJSON(analyses);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'urunler.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (analyses.length === 0 || !isPro) {
      if (!isPro) setShowUpgrade(true);
      return;
    }
    const csv = analysesToCSV(analyses);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'urunler.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && analyses.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Urunler yukleniyor...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Urunler</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {analyses.length} urun analizi{!isPro && ` (Ucretsiz: maks 5)`}
              </p>
            </div>
            <Link href="/analysis/new" className="w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto">Yeni Analiz</Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            <Button variant="outline" size="sm" onClick={handleExportJSON} disabled={analyses.length === 0} className="whitespace-nowrap">
              <Download className="mr-1.5 h-4 w-4" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={analyses.length === 0} className="whitespace-nowrap">
              <Download className="mr-1.5 h-4 w-4" />
              {isPro ? 'CSV' : 'CSV (Pro)'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowBulkUpdate(true)} disabled={analyses.length === 0} className="whitespace-nowrap">
              <Settings2 className="mr-1.5 h-4 w-4" />
              Toplu Guncelle
            </Button>
          </div>
        </div>

        <CSVImportSection onImport={performImport} />

        <BulkUpdateModal
          open={showBulkUpdate}
          onOpenChange={setShowBulkUpdate}
          analyses={analyses}
          onComplete={refresh}
        />

        <ProductsTable analyses={analyses} onDelete={handleDelete} />
      </div>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </DashboardLayout>
  );
}
=== END ===

=== FILE: app/settings/page.tsx ===
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PRICING } from '@/config/pricing';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Sun,
    Moon,
    Monitor,
    Bell,
    Shield,
    Database,
    LogOut,
    Store,
    Key,
    Mail,
    Download,
    Trash2,
    AlertTriangle,
    CheckCircle2,
    Settings,
    Crown,
    CreditCard,
    ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteAnalysis, getStoredAnalyses } from '@/lib/api/analyses';
import { analysesToCSV, analysesToJSON } from '@/lib/csv';
// REMOVED: import { supabase } from '@/lib/supabaseClient';
import { isProUser } from '@/utils/access';
import { useRouter } from 'next/navigation';
import type { Marketplace, Analysis } from '@/types';

const MARKETPLACE_OPTIONS: { key: Marketplace; label: string }[] = [
    { key: 'trendyol', label: 'Trendyol' },
    { key: 'hepsiburada', label: 'Hepsiburada' },
    { key: 'amazon_tr', label: 'Amazon TR' },
    { key: 'n11', label: 'N11' },
    { key: 'custom', label: 'Diger' },
];

export default function SettingsPage() {
    const { user, logout, updateProfile } = useAuth();
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const isPro = isProUser(user);

    // — Delete dialog —
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    // — Billing —
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    // — Notifications (tercihli) —
    const [weeklyReport, setWeeklyReport] = useState(user?.email_weekly_report !== false);
    const [riskAlert, setRiskAlert] = useState(user?.email_risk_alert !== false);
    const [marginAlert, setMarginAlert] = useState(user?.email_margin_alert !== false);
    const [proExpiry, setProExpiry] = useState(user?.email_pro_expiry !== false);

    // — Analysis Defaults —
    const [defaultMp, setDefaultMp] = useState<Marketplace>(user?.default_marketplace ?? 'trendyol');
    const [defaultCommission, setDefaultCommission] = useState(user?.default_commission ?? 12);
    const [defaultVat, setDefaultVat] = useState(user?.default_vat ?? 20);
    const [defaultReturn, setDefaultReturn] = useState(user?.default_return_rate ?? 5);
    const [defaultAds, setDefaultAds] = useState(user?.default_ads_cost ?? 0);
    const [saving, setSaving] = useState(false);
    // — Auth providers —
    const [providers, setProviders] = useState<string[]>([]);

    // — Password change —
    const [newPassword, setNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // — Export —
    const [analyses, setAnalyses] = useState<Analysis[]>([]);

    useEffect(() => setMounted(true), []);

    // Seed state from user
    useEffect(() => {
        if (user) {
            setWeeklyReport(user.email_weekly_report !== false);
            setRiskAlert(user.email_risk_alert !== false);
            setMarginAlert(user.email_margin_alert !== false);
            setProExpiry(user.email_pro_expiry !== false);
            setDefaultMp(user.default_marketplace ?? 'trendyol');
            setDefaultCommission(user.default_commission ?? 12);
            setDefaultVat(user.default_vat ?? 20);
            setDefaultReturn(user.default_return_rate ?? 5);
            setDefaultAds(user.default_ads_cost ?? 0);
        }
    }, [user]);

    // Load analyses & providers
    useEffect(() => {
        if (!user) return;
        (async () => {
            const data = await getStoredAnalyses();
            setAnalyses(data);
        })();
        // TODO: fetch from lib/api/ — get auth providers via API instead of direct supabase call
        // Previously: const { data } = await supabase.auth.getUser();
        setProviders(['email']); // fallback until API endpoint is created
    }, [user]);

    // Save helper
    const save = useCallback(async (updates: Record<string, any>, successMsg = 'Kaydedildi.') => {
        if (!user) return;
        setSaving(true);
        const res = await updateProfile(updates);
        if (res.success) {
            toast.success(successMsg);
        } else {
            toast.error(res.error || 'Bir hata olustu.');
        }
        setSaving(false);
    }, [user, updateProfile]);

    // Delete all data
    const handleDeleteAll = async () => {
        if (!user) return;
        setDeleting(true);
        try {
            const all = await getStoredAnalyses();
            await Promise.all(all.map((a) => deleteAnalysis(a.id)));
            setAnalyses([]);
            toast.success('Tum analiz verileri silindi.');
            setDeleteDialogOpen(false);
            setDeleteConfirmText('');
        } catch {
            toast.error('Silme sirasinda hata olustu.');
        } finally {
            setDeleting(false);
        }
    };

    // Export helpers
    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportCSV = () => {
        if (analyses.length === 0) {
            toast.error('Disa aktarilacak analiz yok.');
            return;
        }
        downloadFile(analysesToCSV(analyses), 'karnet-analizler.csv', 'text/csv;charset=utf-8');
        toast.success('CSV disa aktarildi.');
    };

    const handleExportJSON = () => {
        if (analyses.length === 0) {
            toast.error('Disa aktarilacak analiz yok.');
            return;
        }
        downloadFile(analysesToJSON(analyses), 'karnet-analizler.json', 'application/json');
        toast.success('JSON disa aktarildi.');
    };

    // Password change — via API instead of direct supabase
    const handlePasswordChange = async () => {
        if (newPassword.length < 6) {
            toast.error('Sifre en az 6 karakter olmalidir.');
            return;
        }
        setPasswordLoading(true);
        // TODO: fetch from lib/api/ — change password via API
        try {
            const res = await fetch('/api/v1/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(`Hata: ${data.error || 'Bilinmeyen hata'}`);
            } else {
                toast.success('Sifre basariyla degistirildi.');
                setNewPassword('');
            }
        } catch {
            toast.error('Baglanti hatasi.');
        }
        setPasswordLoading(false);
    };

    if (!user) return null;

    const themeOptions = [
        { key: 'light', label: 'Acik', icon: Sun, desc: 'Aydinlik tema' },
        { key: 'dark', label: 'Koyu', icon: Moon, desc: 'Karanlik tema' },
        { key: 'system', label: 'Sistem', icon: Monitor, desc: 'Cihaz ayari' },
    ];

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-3xl space-y-8 pb-12">

                {/* Page Header */}
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        <h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Gorunum, bildirim, analiz varsayilanlari ve guvenlik tercihlerinizi yonetin.
                    </p>
                </div>

                {/* 1. Appearance */}
                <section className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                            <Sun className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold">Gorunum</h2>
                            <p className="text-xs text-muted-foreground">Tema tercihini secin.</p>
                        </div>
                    </div>

                    {mounted && (
                        <div className="grid grid-cols-3 gap-3">
                            {themeOptions.map((opt) => {
                                const active = theme === opt.key;
                                return (
                                    <button
                                        key={opt.key}
                                        onClick={() => setTheme(opt.key)}
                                        className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${active
                                            ? 'border-amber-500/50 bg-amber-500/10'
                                            : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] hover:bg-white/5 hover:border-[rgba(255,255,255,0.12)]'
                                            }`}
                                    >
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${active ? 'bg-amber-500/10' : 'bg-[rgba(255,255,255,0.06)]'
                                            }`}>
                                            <opt.icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                                        </div>
                                        <span className={`text-sm font-medium ${active ? 'text-primary' : 'text-foreground'}`}>
                                            {opt.label}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                                        {active && (
                                            <div className="absolute top-2 right-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* 2. Plan & Billing */}
                <section className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <Crown className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-semibold">Plan & Faturalandirma</h2>
                                <p className="text-xs text-muted-foreground">Mevcut planinizi ve odeme detaylarinizi yonetin.</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isPro ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.4)]'
                            }`}>
                            {isPro ? 'Pro Aktif' : 'Ucretsiz Plan'}
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Plan Details */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Plan Avantajlari</p>
                                <ul className="space-y-2">
                                    {[
                                        { label: 'Sinirsiz Analiz Gecmisi', active: isPro },
                                        { label: 'CSV Inceleme & Disa Aktar', active: isPro },
                                        { label: 'Pazaryeri Karsilastirma', active: isPro },
                                        { label: 'Gelismis Risk Analizi', active: isPro },
                                        { label: 'E-posta Bildirimleri', active: true },
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs">
                                            <CheckCircle2 className={`h-3.5 w-3.5 ${item.active ? 'text-emerald-500' : 'text-muted-foreground opacity-30'}`} />
                                            <span className={item.active ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Button
                                onClick={() => router.push('/pricing')}
                                className="w-full gap-2 rounded-xl"
                            >
                                {isPro ? 'Plani Yonet' : 'Pro\'ya Gec'}
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Pricing UI (Optional Toggle) */}
                        {!isPro && (
                            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium">Fiyatlandirma</span>
                                    <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.04)] p-0.5 rounded-lg border border-[rgba(255,255,255,0.06)]">
                                        <button
                                            onClick={() => setBillingCycle('monthly')}
                                            className={`px-2 py-1 text-[10px] rounded-md transition-all ${billingCycle === 'monthly' ? 'bg-[rgba(255,255,255,0.08)] text-foreground' : 'text-[rgba(255,255,255,0.4)]'}`}
                                        >
                                            Aylik
                                        </button>
                                        <button
                                            onClick={() => setBillingCycle('yearly')}
                                            className={`px-2 py-1 text-[10px] rounded-md transition-all ${billingCycle === 'yearly' ? 'bg-[rgba(255,255,255,0.08)] text-foreground' : 'text-[rgba(255,255,255,0.4)]'}`}
                                        >
                                            Yillik
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold">TL{billingCycle === 'monthly' ? PRICING.proMonthly : PRICING.proYearly.toLocaleString('tr-TR')}</span>
                                        <span className="text-muted-foreground">/ {billingCycle === 'monthly' ? 'ay' : 'yil'}</span>
                                    </div>
                                    {billingCycle === 'yearly' && (
                                        <p className="text-[10px] text-emerald-600 font-medium">~2 ay ucretsiz! (Yillik %17 tasarruf)</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {isPro && (
                            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 flex flex-col justify-center items-center text-center space-y-2">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-1">
                                    <CreditCard className="h-5 w-5 text-emerald-600" />
                                </div>
                                <p className="text-xs font-medium">Odeme Yontemi</p>
                                <p className="text-[10px] text-muted-foreground">Kart bilgileriniz Stripe uzerinden guvenle saklanmaktadir.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 3. Email Settings & Notifications */}
                <section className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl opacity-50"></div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                            <Mail className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold">E-posta Bildirimleri</h2>
                            <p className="text-xs text-muted-foreground">Hangi e-postalari almak istediginizi yonetin.</p>
                        </div>
                    </div>

                    {/* BOLUM 1 — Hesap Bildirimleri (zorunlu) */}
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pb-1">Hesap Bildirimleri</p>
                        {[
                            { label: 'Hos geldin e-postasi', desc: 'Kayit oldugunuzda gonderilir.' },
                            { label: 'E-posta dogrulama', desc: 'Hesap dogrulama linki.' },
                            { label: 'Sifre sifirlama', desc: 'Sifre sifirlama linki.' },
                            { label: 'Pro plan aktivasyonu', desc: 'Pro plan aktif oldugunda bildirim.' },
                            { label: 'Pro plan sona erme', desc: 'Pro planiniz sona erdiginde bildirim.' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between rounded-xl p-4 hover:bg-white/5 transition-colors">
                                <div className="flex-1">
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        {item.label}
                                        <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">Zorunlu</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </div>
                                <Switch checked={true} disabled className="opacity-50" />
                            </div>
                        ))}
                    </div>

                    <div className="divider border-t border-border" />

                    {/* BOLUM 2 — Tercihli Bildirimler */}
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pb-1">Tercihli Bildirimler</p>

                        {/* Haftalik Ozet Raporu */}
                        <div className="flex items-center justify-between rounded-xl p-4 hover:bg-white/5 transition-colors">
                            <div className="flex-1">
                                <p className="text-sm font-medium">Haftalik Ozet Raporu</p>
                                <p className="text-xs text-muted-foreground">Her hafta performans ozeti e-posta ile gonderilir.</p>
                            </div>
                            <Switch
                                checked={weeklyReport}
                                onCheckedChange={async (v) => {
                                    setWeeklyReport(v);
                                    await save({ email_weekly_report: v }, `Haftalik ozet ${v ? 'acildi' : 'kapatildi'}.`);
                                }}
                            />
                        </div>

                        {/* Zarar Eden Urun Tespiti */}
                        <div className="flex items-center justify-between rounded-xl p-4 hover:bg-white/5 transition-colors">
                            <div className="flex-1">
                                <p className="text-sm font-medium">Zarar Eden Urun Tespiti</p>
                                <p className="text-xs text-muted-foreground">Zarar eden urun tespit edildiginde uyari gonderir.</p>
                            </div>
                            <Switch
                                checked={riskAlert}
                                onCheckedChange={async (v) => {
                                    setRiskAlert(v);
                                    await save({ email_risk_alert: v }, `Zarar uyarisi ${v ? 'acildi' : 'kapatildi'}.`);
                                }}
                            />
                        </div>

                        {/* Hedef Marj Uyarisi */}
                        <div className="flex items-center justify-between rounded-xl p-4 hover:bg-white/5 transition-colors">
                            <div className="flex-1">
                                <p className="text-sm font-medium">Hedef Marj Uyarisi</p>
                                <p className="text-xs text-muted-foreground">Marj, belirlediginiz hedefin altina duserse uyarir.</p>
                            </div>
                            <Switch
                                checked={marginAlert}
                                onCheckedChange={async (v) => {
                                    setMarginAlert(v);
                                    await save({ email_margin_alert: v }, `Marj uyarisi ${v ? 'acildi' : 'kapatildi'}.`);
                                }}
                            />
                        </div>

                        {/* Pro Bitis Hatirlaticisi */}
                        <div className="flex items-center justify-between rounded-xl p-4 hover:bg-white/5 transition-colors">
                            <div className="flex-1">
                                <p className="text-sm font-medium">Pro Bitis Hatirlaticisi</p>
                                <p className="text-xs text-muted-foreground">Pro planiniz bitmeden 7 ve 1 gun once hatirlatma gonderir.</p>
                            </div>
                            <Switch
                                checked={proExpiry}
                                onCheckedChange={async (v) => {
                                    setProExpiry(v);
                                    await save({ email_pro_expiry: v }, `Pro bitis hatirlaticisi ${v ? 'acildi' : 'kapatildi'}.`);
                                }}
                            />
                        </div>
                    </div>

                    <div className="divider border-t border-border" />

                    {/* Sistem Testi */}
                    <div className="rounded-xl border border-border p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div>
                            <p className="text-sm font-medium flex items-center gap-1.5">Sistem Testi <CheckCircle2 className="h-4 w-4 text-emerald-500" /></p>
                            <p className="text-xs text-muted-foreground">Test e-postasi gonder (Brevo SMTP)</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={async () => {
                                toast.loading('Brevo SMTP uzerinden test maili gonderiliyor...', { id: 'test-email' });
                                try {
                                    const res = await fetch('/api/email/test', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ template: 'test_email' })
                                    });
                                    const data = await res.json();

                                    if (res.ok) {
                                        toast.success(`Basarili! (ID: ${data.provider_message_id})`, { id: 'test-email' });
                                    } else {
                                        toast.error(`Hata: ${data.error}`, { id: 'test-email' });
                                    }
                                } catch (e) {
                                    toast.error('Baglanti hatasi.', { id: 'test-email' });
                                }
                            }}
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Test Gonder
                        </Button>
                    </div>
                </section>

                {/* 3. Analysis Defaults */}
                <section className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                            <Store className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold">Analiz Varsayilanlari</h2>
                            <p className="text-xs text-muted-foreground">&quot;Yeni Analiz&quot; formunda otomatik doldurulacak degerler.</p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label className="text-sm font-medium">Varsayilan Pazaryeri</Label>
                            <select
                                value={defaultMp}
                                onChange={(e) => setDefaultMp(e.target.value as Marketplace)}
                                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                {MARKETPLACE_OPTIONS.map((mp) => (
                                    <option key={mp.key} value={mp.key}>{mp.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Komisyon Orani</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={defaultCommission}
                                    onChange={(e) => setDefaultCommission(parseFloat(e.target.value) || 0)}
                                    min={0} max={100} className="h-10 pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">KDV Orani</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={defaultVat}
                                    onChange={(e) => setDefaultVat(parseFloat(e.target.value) || 0)}
                                    min={0} max={100} className="h-10 pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Iade Orani</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={defaultReturn}
                                    onChange={(e) => setDefaultReturn(parseFloat(e.target.value) || 0)}
                                    min={0} max={100} className="h-10 pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Reklam Maliyeti</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={defaultAds}
                                    onChange={(e) => setDefaultAds(parseFloat(e.target.value) || 0)}
                                    min={0} className="h-10 pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">TL</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        size="sm"
                        disabled={saving}
                        className="rounded-[10px]"
                        onClick={() => save({
                            default_marketplace: defaultMp,
                            default_commission: defaultCommission,
                            default_vat: defaultVat,
                            default_return_rate: defaultReturn,
                            default_ads_cost: defaultAds,
                        }, 'Varsayilanlar kaydedildi.')}
                    >
                        {saving ? 'Kaydediliyor...' : 'Varsayilanlari Kaydet'}
                    </Button>
                </section>

                {/* 4. Security */}
                <section className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                            <Shield className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold">Hesap Guvenligi</h2>
                            <p className="text-xs text-muted-foreground">Giris yontemlerinizi ve oturum guvenliginizi yonetin.</p>
                        </div>
                    </div>

                    {/* Profile info */}
                    <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-[11px] text-muted-foreground">E-posta Adresi</p>
                                <p className="text-sm font-medium">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-[11px] text-muted-foreground">Bagli Saglayicilar</p>
                                <div className="flex gap-1.5 mt-0.5">
                                    {(providers.length > 0 ? providers : ['email']).map((p) => (
                                        <span key={p} className="inline-flex items-center gap-1 rounded-full border bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[10px] font-medium capitalize">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                            {p === 'email' ? 'E-posta' : p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password change */}
                    {(providers.includes('email') || providers.length === 0) && (
                        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 space-y-3">
                            <p className="text-sm font-medium">Sifre Degistir</p>
                            <div className="flex gap-2">
                                <Input
                                    type="password"
                                    placeholder="Yeni sifre (min 6 karakter)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="h-10 flex-1"
                                />
                                <Button
                                    size="sm"
                                    disabled={passwordLoading || newPassword.length < 6}
                                    onClick={handlePasswordChange}
                                    className="rounded-[10px] h-10"
                                >
                                    {passwordLoading ? 'Degistiriliyor...' : 'Degistir'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Session actions */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10 rounded-[10px]"
                            onClick={logout}
                        >
                            <LogOut className="h-4 w-4" />
                            Oturumu Kapat
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10 rounded-[10px]"
                            onClick={async () => {
                                // TODO: fetch from lib/api/ — global signout via API
                                await fetch('/api/v1/auth/signout-all', { method: 'POST' });
                                router.push('/auth');
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            Tum Cihazlardan Cikis
                        </Button>
                    </div>
                </section>

                {/* 5. Data Management */}
                <section className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                            <Database className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold">Veri Yonetimi</h2>
                            <p className="text-xs text-muted-foreground">
                                {analyses.length} analiz kaydiniz var.
                            </p>
                        </div>
                    </div>

                    {/* Export */}
                    <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 space-y-3">
                        <p className="text-sm font-medium">Verileri Disa Aktar</p>
                        <p className="text-xs text-muted-foreground">Tum analizlerinizi CSV veya JSON formatinda indirin.</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1.5 rounded-[10px]" onClick={handleExportCSV}>
                                <Download className="h-4 w-4" />
                                CSV Indir
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1.5 rounded-[10px]" onClick={handleExportJSON}>
                                <Download className="h-4 w-4" />
                                JSON Indir
                            </Button>
                        </div>
                    </div>

                    {/* Delete all */}
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <p className="text-sm font-medium text-red-400">Tehlikeli Bolge</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tum analiz gecmisinizi ve kaydedilen urun verilerinizi kalici olarak silebilirsiniz. Bu islem geri alinamaz.
                        </p>
                        <Dialog open={deleteDialogOpen} onOpenChange={(v) => {
                            setDeleteDialogOpen(v);
                            if (!v) setDeleteConfirmText('');
                        }}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10 rounded-[10px]"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Tum Verileri Sil
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        Tum Verileri Sil
                                    </DialogTitle>
                                    <DialogDescription>
                                        Bu islem tum analizlerinizi kalici olarak silecek. Onaylamak icin asagiya <strong>KARNET</strong> yazin.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 py-2">
                                    <Input
                                        placeholder='Onaylamak icin "KARNET" yazin'
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        className="font-mono"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => { setDeleteDialogOpen(false); setDeleteConfirmText(''); }}
                                        disabled={deleting}
                                    >
                                        Iptal
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteAll}
                                        disabled={deleting || deleteConfirmText !== 'KARNET'}
                                    >
                                        {deleting ? 'Siliniyor...' : 'Evet, Tumunu Sil'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </section>

            </div>
        </DashboardLayout>
    );
}
=== END ===

=== FILE: app/support/page.tsx ===
'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TicketForm } from '@/components/support/ticket-form'
import { TicketList } from '@/components/support/ticket-list'
import { TicketDetailDialog } from '@/components/support/ticket-detail-dialog'
import { useSupportTickets } from '@/hooks/use-support-tickets'
import { Ticket } from '@/types'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function SupportPage() {
  const { tickets, loading, createTicket, refetch } = useSupportTickets()
  const [formOpen, setFormOpen] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreateSuccess = () => {
    toast.success('Destek talebiniz olusturuldu.')
    setFormOpen(false)
    refetch()
  }

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setDialogOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 p-4 sm:p-0">
        <div className="pt-4">
          <h1 className="text-2xl font-bold tracking-tight">Destek</h1>
          <p className="text-muted-foreground text-sm mt-1">Yeni talep olustur veya mevcut taleplerinizi goruntuyleyin.</p>
        </div>

        {/* Yeni Talep Formu */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] overflow-hidden">
          <button
            onClick={() => setFormOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold hover:bg-white/5 transition-colors"
          >
            <span>Yeni Destek Talebi Olustur</span>
            {formOpen
              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />
            }
          </button>
          {formOpen && (
            <div className="px-5 pb-5 border-t border-border">
              <div className="pt-4">
                <TicketForm
                  onSuccess={handleCreateSuccess}
                  onCreate={createTicket}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mevcut Talepler */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Taleplerim</h2>
          <TicketList
            tickets={tickets}
            loading={loading}
            onSelectTicket={handleSelectTicket}
          />
        </div>

        {/* Dogrudan Iletisim */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Dogrudan Iletisim
          </h3>
          <p className="text-sm text-[rgba(255,255,255,0.5)] mb-4">
            Acil durumlar veya destek talebi disindaki sorulariniz icin bize dogrudan ulasabilirsiniz.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[rgba(255,255,255,0.4)]">E-posta</p>
                <a href="mailto:karnet.destek@gmail.com" className="text-sm font-medium text-blue-400 hover:underline">
                  karnet.destek@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-[rgba(255,255,255,0.4)]">WhatsApp</p>
                <a href="https://wa.me/905433824521" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:underline">
                  +90 543 382 45 21
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TicketDetailDialog
        ticket={selectedTicket}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </DashboardLayout>
  )
}
=== END ===

=== FILE: app/page.tsx ===
'use client';

import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { SocialProofBar } from '@/components/landing/social-proof-bar';
import { MarketplaceCards } from '@/components/landing/marketplace-cards';
import { QuickCalc } from '@/components/landing/quick-calc';
import { Features } from '@/components/landing/features';
import { ComparisonTable } from '@/components/landing/comparison-table';
import { TrustCards } from '@/components/landing/trust-cards';
import { HowItWorks } from '@/components/landing/how-it-works';
import { BenefitsList } from '@/components/landing/benefits-list';
import { StatsSection } from '@/components/landing/stats-section';
import { Testimonials } from '@/components/landing/testimonials';
import { TrustStrip } from '@/components/landing/trust-strip';
import { FAQSection } from '@/components/landing/faq-section';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/layout/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Header />

      <main>
        <Hero />
        <SocialProofBar />
        <MarketplaceCards />
        <QuickCalc />
        <Features />
        <ComparisonTable />
        <TrustCards />
        <HowItWorks />
        <BenefitsList />
        <StatsSection />
        <Testimonials />
        <TrustStrip />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
=== END ===

=== FILE: components/shared/kpi-card.tsx ===
'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, className }: KPICardProps) {
  const accentClass = trend === 'up' ? 'bg-emerald-500' : trend === 'down' ? 'bg-red-500' : 'bg-border';

  return (
    <div className={cn(
      'flex overflow-hidden rounded-2xl border border-border/30 bg-card hover:border-border/60 transition-colors duration-200',
      className
    )}>
      <div className={cn('w-[3px] shrink-0', accentClass)} />
      <div className="flex flex-1 items-start justify-between p-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight mt-1">{value}</p>
          {subtitle && (
            <p className={cn(
              'text-xs font-medium',
              trend === 'up' && 'text-emerald-400',
              trend === 'down' && 'text-red-400',
              trend === 'neutral' && 'text-[rgba(255,255,255,0.4)]',
              !trend && 'text-[rgba(255,255,255,0.4)]'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-primary/8 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
=== END ===

=== FILE: components/shared/risk-badge.tsx ===
'use client';

import { RiskLevel } from '@/types';
import { riskLevelConfig } from '@/utils/risk-engine';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = riskLevelConfig[level];

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      config.bgColor,
      config.textColor,
      className
    )}>
      {config.label}
    </span>
  );
}
=== END ===
