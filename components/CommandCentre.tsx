'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  LayoutGrid, Layers, Heart, Home, Users, Sun, Cloud, CloudRain, CloudSnow,
  CloudLightning, CloudFog, Wind, Clock, Feather, Newspaper, Calendar,
  CheckSquare, Target, Plus, X, ArrowUpRight, Trash2, Check,
  ChevronDown, ChevronLeft, ChevronRight, Moon, Mountain, Waves, Leaf,
  Flame, Activity, Edit3, Maximize2, Minimize2, CircleCheck,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Project   = { id: number; title: string; cat: string; status: string; phases: string[]; cp: number; next: string; last: string; dl: string; who: string; block: string; log: { d: string; n: string }[] }
type Reflection = { id: number; content: string; created_at: string }
type Task       = { id: number; title: string; done: boolean; due_date: string }
type FamilyNote = { id: number; member: string; content: string; created_at: string }
type FriendNote = { id: number; name: string; content: string; created_at: string }
type NewsItem   = { title: string; link: string; pubDate: string; description: string }
type Page       = 'dashboard' | 'projects' | 'health' | 'family' | 'friends'
type Landscape  = 'sunset' | 'mountain' | 'ocean' | 'forest'
type TimeOfDay  = 'morning' | 'afternoon' | 'evening' | 'night'

// ─── Typography scale ─────────────────────────────────────────────────────────

const T = {
  display: { fontSize: 56, fontWeight: 200, letterSpacing: '-0.03em', lineHeight: 1.0 } as React.CSSProperties,
  h1:      { fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.2 } as React.CSSProperties,
  h2:      { fontSize: 22, fontWeight: 300, letterSpacing: '-0.01em', lineHeight: 1.3 } as React.CSSProperties,
  h3:      { fontSize: 16, fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.4 } as React.CSSProperties,
  body:    { fontSize: 14, fontWeight: 400, letterSpacing: '0em', lineHeight: 1.65 } as React.CSSProperties,
  sm:      { fontSize: 12, fontWeight: 400, letterSpacing: '0.005em', lineHeight: 1.5 } as React.CSSProperties,
  label:   { fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, lineHeight: 1.4 } as React.CSSProperties,
}

// ─── Colour tokens ────────────────────────────────────────────────────────────

const C = {
  text:       'rgba(255,255,255,0.93)',
  textSub:    'rgba(255,255,255,0.65)',
  textMuted:  'rgba(255,255,255,0.38)',
  champagne:  'rgba(224,204,158,0.90)',
  sage:       'rgba(160,210,170,0.85)',
  border:     'rgba(255,255,255,0.12)',
  borderHov:  'rgba(255,255,255,0.24)',
}

// ─── Time of day ──────────────────────────────────────────────────────────────

function getTOD(): TimeOfDay {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

const TOD_DATA: Record<TimeOfDay, { label: string; icon: React.ReactNode; greeting: string }> = {
  morning:   { label: 'Morning',   icon: <Sun size={13} strokeWidth={1.5}/>,  greeting: 'Good morning' },
  afternoon: { label: 'Afternoon', icon: <Sun size={13} strokeWidth={1.5}/>,  greeting: 'Good afternoon' },
  evening:   { label: 'Evening',   icon: <Sun size={13} strokeWidth={1.5}/>,  greeting: 'Good evening' },
  night:     { label: 'Night',     icon: <Moon size={13} strokeWidth={1.5}/>, greeting: 'Good night' },
}

// ─── Scene contrast config ────────────────────────────────────────────────────
// overlayOpacity: black overlay to dampen background brightness
// tint: subtle color grading overlay
// Calculated to ensure WCAG AA (4.5:1) for primary text on glass panels

type SceneConfig = { overlay: number; tint: string }

const SCENE: Record<Landscape, Record<TimeOfDay, SceneConfig>> = {
  sunset:   {
    morning:   { overlay: 0.50, tint: 'rgba(30,0,60,0.10)' },
    afternoon: { overlay: 0.46, tint: 'rgba(20,0,50,0.08)' },
    evening:   { overlay: 0.38, tint: 'rgba(50,0,20,0.12)' },
    night:     { overlay: 0.28, tint: 'rgba(10,0,40,0.15)' },
  },
  mountain: {
    morning:   { overlay: 0.65, tint: 'rgba(255,200,100,0.06)' },
    afternoon: { overlay: 0.63, tint: 'rgba(200,220,255,0.05)' },
    evening:   { overlay: 0.52, tint: 'rgba(180,80,30,0.10)'  },
    night:     { overlay: 0.32, tint: 'rgba(20,30,80,0.12)'   },
  },
  ocean:    {
    morning:   { overlay: 0.62, tint: 'rgba(255,210,150,0.08)' },
    afternoon: { overlay: 0.65, tint: 'rgba(200,230,255,0.05)' },
    evening:   { overlay: 0.50, tint: 'rgba(180,80,40,0.10)'  },
    night:     { overlay: 0.30, tint: 'rgba(10,20,60,0.15)'   },
  },
  forest:   {
    morning:   { overlay: 0.52, tint: 'rgba(255,200,100,0.07)' },
    afternoon: { overlay: 0.50, tint: 'rgba(180,255,180,0.04)' },
    evening:   { overlay: 0.42, tint: 'rgba(140,70,20,0.10)'  },
    night:     { overlay: 0.26, tint: 'rgba(0,10,5,0.15)'     },
  },
}

// ─── Landscape gradient data ──────────────────────────────────────────────────

const LS_GRAD: Record<Landscape, Record<TimeOfDay, [string,string,string,string]>> = {
  sunset: {
    morning:   ['#3a1058','#8a3070','#d46848','#f4a838'],
    afternoon: ['#2c0848','#7a1c58','#c84e3c','#f09028'],
    evening:   ['#16002a','#500a46','#b02e2c','#e86018'],
    night:     ['#070010','#10001e','#220834','#160518'],
  },
  mountain: {
    morning:   ['#d0e0ec','#a8c0d8','#88a8c0','#6888a4'],
    afternoon: ['#b8d0e8','#90b8d8','#6898be','#5080a6'],
    evening:   ['#785068','#a87088','#c89090','#d8a080'],
    night:     ['#0a0e1e','#161c34','#1e263c','#161c2c'],
  },
  ocean: {
    morning:   ['#feeed4','#c4dcea','#76acd4','#287094'],
    afternoon: ['#eef6ff','#b4d6ec','#64a4cc','#185e8c'],
    evening:   ['#ec7c58','#be647c','#4c7c9c','#184664'],
    night:     ['#060c16','#0e1626','#162c3c','#0e2434'],
  },
  forest: {
    morning:   ['#183626','#234832','#2e563c','#264e46'],
    afternoon: ['#1c4030','#284e36','#346244','#2c5e54'],
    evening:   ['#28261c','#382e16','#463e1c','#3c3616'],
    night:     ['#050a06','#0a160c','#0e1c10','#0c180e'],
  },
}

// ─── CSS keyframes ────────────────────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes wv1 {
    0%,100% { d:path("M-100,460 Q200,422 400,455 Q600,488 800,445 Q1000,402 1200,445 Q1400,488 1640,455"); }
    50%      { d:path("M-100,448 Q200,488 400,448 Q600,408 800,458 Q1000,508 1200,458 Q1400,408 1640,448"); }
  }
  @keyframes wv2 {
    0%,100% { d:path("M-100,522 Q220,488 440,520 Q660,552 880,512 Q1100,472 1320,512 Q1440,532 1640,512"); }
    50%      { d:path("M-100,510 Q220,552 440,510 Q660,468 880,520 Q1100,568 1320,520 Q1440,490 1640,520"); }
  }
  @keyframes wv3 {
    0%,100% { d:path("M-100,592 Q240,555 460,590 Q680,625 900,580 Q1120,535 1340,578 Q1460,598 1640,572"); }
    50%      { d:path("M-100,578 Q240,618 460,578 Q680,538 900,592 Q1120,640 1340,592 Q1460,565 1640,592"); }
  }
  @keyframes mistMove { from{transform:translateX(0)} to{transform:translateX(-90px)} }
  @keyframes fogMove  { from{transform:translateX(0) scaleX(1)} to{transform:translateX(-70px) scaleX(1.06)} }
  @keyframes rayPulse { from{opacity:0.55} to{opacity:1} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  @keyframes breathe  { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.12);opacity:0.2} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes taskPop  { 0%{transform:scale(1)} 40%{transform:scale(1.35)} 100%{transform:scale(1)} }
  @keyframes focusIn  { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes grain    { 0%,100%{transform:translate(0,0)} 25%{transform:translate(-2%,-1%)} 50%{transform:translate(1%,2%)} 75%{transform:translate(2%,-1%)} }
`

// ─── Landscape SVG layers ─────────────────────────────────────────────────────

function SunsetLayer({ tod }: { tod: TimeOfDay }) {
  const op = tod === 'night' ? 0.05 : 0.65
  const sy = tod === 'evening' ? 540 : tod === 'night' ? 700 : 460
  return (
    <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <defs>
        <radialGradient id="sg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffe88a" stopOpacity={op}/>
          <stop offset="45%"  stopColor="#ff9040" stopOpacity={op * 0.45}/>
          <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
        </radialGradient>
        <filter id="sb"><feGaussianBlur stdDeviation="22"/></filter>
      </defs>
      <ellipse cx="720" cy={sy} rx="160" ry="120" fill="url(#sg)" filter="url(#sb)" style={{ animation:'float 20s ease-in-out infinite' }}/>
      <ellipse cx="720" cy="640" rx="580" ry="90" fill="#ff8030" opacity={tod==='night'?0:0.12} filter="url(#sb)"/>
      <path d="M0,690 Q220,600 440,650 Q660,600 720,630 Q900,565 1100,640 Q1300,600 1440,640 L1440,800 L0,800Z" fill="rgba(0,0,0,0.22)"/>
      <path d="M0,755 Q360,710 720,740 Q1080,710 1440,750 L1440,800 L0,800Z" fill="rgba(0,0,0,0.30)"/>
    </svg>
  )
}

function MountainLayer({ tod }: { tod: TimeOfDay }) {
  const dark = tod === 'night'
  const snow = dark ? 0.35 : 0.90
  const mist = dark ? 0.06 : 0.20
  return (
    <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <defs>
        <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity={mist}/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <filter id="mf"><feGaussianBlur stdDeviation="14"/></filter>
      </defs>
      {/* Far range */}
      <path d="M-80,700 L200,260 L400,490 L560,180 L730,460 L910,130 L1090,400 L1270,230 L1440,440 L1540,700Z" fill={dark?'rgba(12,18,32,0.88)':'rgba(110,148,178,0.68)'}/>
      <path d="M560,180 L522,308 L598,308Z" fill={`rgba(255,255,255,${snow*0.60})`}/>
      <path d="M910,130 L867,268 L953,268Z" fill={`rgba(255,255,255,${snow*0.82})`}/>
      <path d="M1270,230 L1232,348 L1308,348Z" fill={`rgba(255,255,255,${snow*0.50})`}/>
      {/* Mid range */}
      <path d="M-80,750 L110,465 L290,590 L470,334 L650,545 L830,358 L1010,525 L1190,384 L1350,508 L1540,750Z" fill={dark?'rgba(8,13,26,0.94)':'rgba(72,104,136,0.84)'}/>
      <path d="M470,334 L438,440 L502,440Z" fill={`rgba(255,255,255,${snow})`}/>
      <path d="M830,358 L800,458 L860,458Z" fill={`rgba(255,255,255,${snow})`}/>
      <path d="M1190,384 L1162,478 L1218,478Z" fill={`rgba(255,255,255,${snow*0.88})`}/>
      {/* Foreground */}
      <path d="M0,778 Q360,726 720,758 Q1080,726 1440,768 L1440,800 L0,800Z" fill={dark?'rgba(4,8,18,1)':'rgba(42,64,84,0.96)'}/>
      {/* Mist */}
      <rect x="-60" y="470" width="1560" height="210" fill="url(#mg)" filter="url(#mf)" style={{ animation:'mistMove 28s linear infinite' }}/>
    </svg>
  )
}

function OceanLayer({ tod }: { tod: TimeOfDay }) {
  const wop = tod === 'night' ? 0.12 : 0.32
  const glop = tod === 'evening' ? 0.45 : tod === 'night' ? 0 : 0.28
  return (
    <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <defs>
        <radialGradient id="hg" cx="50%" cy="0%" r="65%">
          <stop offset="0%"   stopColor="#ffe8b0" stopOpacity={glop}/>
          <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
        </radialGradient>
        <filter id="wf"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <rect x="0" y="440" width="1440" height="360" fill={tod==='night'?'rgba(8,22,42,0.55)':'rgba(24,84,124,0.22)'}/>
      <rect x="0" y="330" width="1440" height="160" fill="url(#hg)"/>
      <path d="M-100,460 Q200,422 400,455 Q600,488 800,445 Q1000,402 1200,445 Q1400,488 1640,455" stroke={`rgba(255,255,255,${wop*0.5})`} strokeWidth="2" fill="none" style={{ animation:'wv1 15s ease-in-out infinite' }}/>
      <path d="M-100,522 Q220,488 440,520 Q660,552 880,512 Q1100,472 1320,512 Q1440,532 1640,512" stroke={`rgba(255,255,255,${wop*0.72})`} strokeWidth="2.5" fill="none" style={{ animation:'wv2 11s ease-in-out infinite' }}/>
      <path d="M-100,592 Q240,555 460,590 Q680,625 900,580 Q1120,535 1340,578 Q1460,598 1640,572" stroke={`rgba(255,255,255,${wop})`} strokeWidth="3" fill="none" style={{ animation:'wv3 8s ease-in-out infinite' }}/>
      <path d="M0,685 Q360,665 720,675 Q1080,665 1440,672 L1440,800 L0,800Z" fill={tod==='night'?'rgba(8,18,38,0.68)':'rgba(255,255,255,0.05)'}/>
    </svg>
  )
}

function ForestLayer({ tod }: { tod: TimeOfDay }) {
  const dark = tod === 'night'
  const rop = tod === 'morning' ? 0.11 : tod === 'afternoon' ? 0.08 : 0.02
  const fop = tod === 'morning' ? 0.16 : dark ? 0.07 : 0.09
  return (
    <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <defs>
        <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(200,220,208,0)" />
          <stop offset="50%"  stopColor={`rgba(200,220,208,${fop})`}/>
          <stop offset="100%" stopColor="rgba(200,220,208,0)"/>
        </linearGradient>
        <filter id="ff"><feGaussianBlur stdDeviation="10"/></filter>
      </defs>
      {[0,1,2,3].map(i => (
        <polygon key={i}
          points={`${180+i*130},0 ${162+i*130},0 ${290+i*190},800 ${340+i*190},800`}
          fill={`rgba(255,240,190,${rop})`}
          style={{ animation:`rayPulse ${6+i*2}s ease-in-out ${i*1.5}s infinite alternate` }}
          transform={`skewX(${-8+i*4})`}/>
      ))}
      {Array.from({length:20}).map((_,i) => {
        const x=i*78-20; const h=260+Math.sin(i*1.4)*80; const w=54+Math.cos(i*1.1)*18
        return <polygon key={i} points={`${x+w/2},${548-h} ${x},565 ${x+w},565`} fill={dark?'rgba(4,10,6,0.88)':'rgba(18,46,28,0.68)'}/>
      })}
      {Array.from({length:14}).map((_,i) => {
        const x=i*112-10; const h=195+Math.sin(i*1.7)*58; const w=78+Math.cos(i*1.3)*24
        return <polygon key={i} points={`${x+w/2},${648-h} ${x},665 ${x+w},665`} fill={dark?'rgba(3,8,4,0.93)':'rgba(13,38,20,0.84)'}/>
      })}
      {Array.from({length:10}).map((_,i) => {
        const x=i*162-22; const h=155+Math.sin(i*2)*48; const w=98+Math.cos(i*1.5)*28
        return <polygon key={i} points={`${x+w/2},${755-h} ${x},772 ${x+w},772`} fill={dark?'rgba(2,5,3,1)':'rgba(9,26,14,0.94)'}/>
      })}
      <path d="M0,772 Q720,760 1440,772 L1440,800 L0,800Z" fill={dark?'rgba(2,4,2,1)':'rgba(7,20,10,1)'}/>
      <rect x="-60" y="575" width="1560" height="230" fill="url(#fg)" filter="url(#ff)" style={{ animation:'fogMove 32s linear infinite' }}/>
    </svg>
  )
}

// ─── Grain texture ────────────────────────────────────────────────────────────

function GrainLayer() {
  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.035 }} xmlns="http://www.w3.org/2000/svg">
      <filter id="grain-f">
        <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-f)" style={{ animation:'grain 0.8s steps(4) infinite' }}/>
    </svg>
  )
}

// ─── Ambient background ───────────────────────────────────────────────────────

function AmbientBg({ landscape, tod }: { landscape: Landscape; tod: TimeOfDay }) {
  const [g1,g2,g3,g4] = LS_GRAD[landscape][tod]
  const { overlay, tint } = SCENE[landscape][tod]
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, overflow:'hidden' }}>
      {/* Layer 1: Base gradient */}
      <div style={{ position:'absolute', inset:0, background:`linear-gradient(180deg,${g1} 0%,${g2} 33%,${g3} 66%,${g4} 100%)`, transition:'background 2.5s ease' }}/>
      {/* Layer 2: Landscape SVG */}
      {landscape === 'sunset'   && <SunsetLayer   tod={tod}/>}
      {landscape === 'mountain' && <MountainLayer tod={tod}/>}
      {landscape === 'ocean'    && <OceanLayer    tod={tod}/>}
      {landscape === 'forest'   && <ForestLayer   tod={tod}/>}
      {/* Layer 3: Color grading */}
      <div style={{ position:'absolute', inset:0, background:tint, transition:'background 2s ease' }}/>
      {/* Layer 4: Brightness damping (WCAG contrast engine) */}
      <div style={{ position:'absolute', inset:0, background:`rgba(0,0,0,${overlay})`, transition:'opacity 2s ease' }}/>
      {/* Layer 5: Vignette */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.45) 100%)' }}/>
      {/* Layer 6: Grain */}
      <GrainLayer/>
    </div>
  )
}

// ─── Glass panel (Layer 7 — UI surface) ──────────────────────────────────────
// rgba(0,0,0,0.30) base guarantees WCAG AA compliance across all scene configs

function Glass({ children, style, float }: { children: React.ReactNode; style?: React.CSSProperties; float?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(0,0,0,0.32)' : 'rgba(0,0,0,0.28)',
        backdropFilter: 'blur(32px) saturate(160%)',
        WebkitBackdropFilter: 'blur(32px) saturate(160%)',
        border: `1px solid ${hov ? C.borderHov : C.border}`,
        borderRadius: 22,
        boxShadow: hov
          ? '0 24px 64px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)'
          : '0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.07)',
        transition: 'all 0.32s cubic-bezier(0.4,0,0.2,1)',
        animation: float ? 'float 8s ease-in-out infinite' : undefined,
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        ...style,
      }}
    >{children}</div>
  )
}

// ─── Glass input ──────────────────────────────────────────────────────────────

const gIn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)', border: `1px solid ${C.border}`, borderRadius: 10,
  padding: '10px 14px', color: C.text, width: '100%', boxSizing: 'border-box', outline: 'none',
  ...T.body,
}

// ─── Widget label ─────────────────────────────────────────────────────────────

function WLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
      <span style={{ color: C.champagne, opacity:0.8, display:'flex' }}>{icon}</span>
      <span style={{ ...T.label, color: C.textMuted }}>{children}</span>
    </div>
  )
}

// ─── Landscape selector ───────────────────────────────────────────────────────

const LS_OPTS: { key: Landscape; label: string; icon: React.ReactNode }[] = [
  { key:'sunset',   label:'Sunset',   icon:<Sun size={14} strokeWidth={1.5}/> },
  { key:'mountain', label:'Mountain', icon:<Mountain size={14} strokeWidth={1.5}/> },
  { key:'ocean',    label:'Ocean',    icon:<Waves size={14} strokeWidth={1.5}/> },
  { key:'forest',   label:'Forest',   icon:<Leaf size={14} strokeWidth={1.5}/> },
]

function LandscapeSelector({ value, onChange }: { value: Landscape; onChange: (l: Landscape) => void }) {
  const [open, setOpen] = useState(false)
  const cur = LS_OPTS.find(o => o.key === value)!
  return (
    <div style={{ position:'relative' }}>
      <button onClick={() => setOpen(o=>!o)} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(0,0,0,0.30)', backdropFilter:'blur(20px)', border:`1px solid ${C.border}`, borderRadius:22, color:C.textSub, padding:'8px 18px', cursor:'pointer', ...T.sm, fontWeight:500 }}>
        <span style={{ display:'flex', color:C.champagne }}>{cur.icon}</span>
        <span>{cur.label}</span>
        <ChevronDown size={11} strokeWidth={2}/>
      </button>
      {open && (
        <div style={{ position:'absolute', top:46, right:0, background:'rgba(8,8,12,0.88)', backdropFilter:'blur(36px)', border:`1px solid ${C.border}`, borderRadius:18, padding:8, zIndex:200, minWidth:170, boxShadow:'0 24px 64px rgba(0,0,0,0.5)' }}>
          {LS_OPTS.map(o => (
            <button key={o.key} onClick={() => { onChange(o.key); setOpen(false) }}
              style={{ display:'flex', alignItems:'center', gap:10, width:'100%', background: value===o.key ? 'rgba(255,255,255,0.10)' : 'transparent', border:'none', borderRadius:11, color: value===o.key ? C.text : C.textSub, padding:'11px 16px', cursor:'pointer', ...T.sm, fontWeight: value===o.key?600:400, transition:'background 0.15s' }}
              onMouseEnter={e => { if(value!==o.key) e.currentTarget.style.background='rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if(value!==o.key) e.currentTarget.style.background='transparent' }}
            >
              <span style={{ color:C.champagne, display:'flex' }}>{o.icon}</span>{o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Focus mode ───────────────────────────────────────────────────────────────

function FocusMode({ task, onExit }: { task: Task; onExit: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onExit() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onExit])

  return (
    <div style={{ position:'fixed', inset:0, zIndex:900, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
      onClick={onExit}>
      {/* Dark overlay */}
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.90)', backdropFilter:'blur(48px) saturate(60%)', WebkitBackdropFilter:'blur(48px) saturate(60%)' }}/>
      {/* Breathing ring */}
      <div style={{ position:'absolute', width:320, height:320, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.08)', animation:'breathe 5s ease-in-out infinite' }}/>
      <div style={{ position:'absolute', width:240, height:240, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.05)', animation:'breathe 5s ease-in-out 0.8s infinite' }}/>
      {/* Content */}
      <div onClick={e => e.stopPropagation()} style={{ position:'relative', textAlign:'center', maxWidth:560, padding:'0 40px', animation:'focusIn 0.5s cubic-bezier(0.4,0,0.2,1) both' }}>
        <div style={{ ...T.label, color: C.champagne, marginBottom:28, opacity:0.7 }}>Focus Mode</div>
        <div style={{ ...T.display, color: C.text, marginBottom:task.due_date?20:40, fontSize: task.title.length > 40 ? 36 : task.title.length > 25 ? 44 : 56 }}>
          {task.title}
        </div>
        {task.due_date && (
          <div style={{ ...T.body, color: C.textMuted, marginBottom:40 }}>Due {task.due_date}</div>
        )}
        <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', color: C.textMuted, ...T.sm }}>
          <span>Press Esc or click anywhere to exit</span>
        </div>
      </div>
      {/* Exit button */}
      <button onClick={onExit} style={{ position:'absolute', top:28, right:28, background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, borderRadius:12, color:C.textSub, padding:'8px 18px', cursor:'pointer', ...T.sm, fontWeight:500 }}>
        Exit Focus
      </button>
    </div>
  )
}

// ─── Mini calendar ────────────────────────────────────────────────────────────

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa']

function MiniCalendar() {
  const now = new Date()
  const [yr, setYr] = useState(now.getFullYear())
  const [mo, setMo] = useState(now.getMonth())
  const first = new Date(yr, mo, 1).getDay()
  const dim = new Date(yr, mo+1, 0).getDate()
  const cells = Array.from({ length: first+dim }, (_,i) => i < first ? null : i-first+1)
  const td = now.getDate(), isCur = yr===now.getFullYear() && mo===now.getMonth()
  const prev = () => mo===0 ? (setMo(11), setYr(y=>y-1)) : setMo(m=>m-1)
  const next = () => mo===11 ? (setMo(0), setYr(y=>y+1)) : setMo(m=>m+1)
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <button onClick={prev} style={{ background:'none', border:'none', color:C.textMuted, cursor:'pointer', display:'flex', padding:4 }}><ChevronLeft size={13} strokeWidth={2}/></button>
        <span style={{ ...T.sm, color: C.textSub, fontWeight:500 }}>{MONTHS[mo].slice(0,3)} {yr}</span>
        <button onClick={next} style={{ background:'none', border:'none', color:C.textMuted, cursor:'pointer', display:'flex', padding:4 }}><ChevronRight size={13} strokeWidth={2}/></button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1 }}>
        {DAY_LABELS.map(d => <div key={d} style={{ ...T.label, textAlign:'center', color:C.textMuted, padding:'2px 0', fontSize:8 }}>{d}</div>)}
        {cells.map((d,i) => (
          <div key={i} style={{
            textAlign:'center', fontSize:11, padding:'5px 2px', borderRadius:7,
            background: d && isCur && d===td ? 'rgba(224,204,158,0.22)' : 'transparent',
            color: d ? (isCur && d===td ? C.champagne : C.textMuted) : 'transparent',
            fontWeight: d && isCur && d===td ? 700 : 400,
            border: d && isCur && d===td ? '1px solid rgba(224,204,158,0.35)' : '1px solid transparent',
          }}>{d ?? ''}</div>
        ))}
      </div>
    </div>
  )
}

// ─── Sidebar tasks (with focus trigger) ───────────────────────────────────────

function SidebarTasks({ onFocus }: { onFocus: (t: Task) => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [justDone, setJustDone] = useState<number|null>(null)
  const [hovId, setHovId] = useState<number|null>(null)
  const load = useCallback(async () => { const r=await fetch('/api/tasks'); setTasks(await r.json()) }, [])
  useEffect(() => { load() }, [load])

  const toggle = async (t: Task) => {
    if (!t.done) { setJustDone(t.id); setTimeout(()=>setJustDone(null), 600) }
    await fetch('/api/tasks', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id:t.id, done:!t.done }) })
    load()
  }
  const add = async () => {
    if (!newTask.trim()) return
    await fetch('/api/tasks', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ title:newTask.trim() }) })
    setNewTask(''); load()
  }

  return (
    <div>
      <div style={{ ...T.label, color: C.textMuted, marginBottom:12 }}>Tasks</div>
      <div style={{ display:'flex', flexDirection:'column', gap:4, maxHeight:190, overflowY:'auto' }}>
        {tasks.map(t => (
          <div key={t.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 0', position:'relative' }}
            onMouseEnter={() => setHovId(t.id)} onMouseLeave={() => setHovId(null)}>
            <button onClick={() => toggle(t)} style={{ background:'none', border:'none', padding:0, cursor:'pointer', display:'flex', animation: justDone===t.id ? 'taskPop 0.5s ease' : undefined }}>
              <div style={{
                width:15, height:15, borderRadius:4, border: t.done ? 'none' : `1.5px solid ${C.textMuted}`,
                background: t.done ? 'rgba(160,210,170,0.55)' : 'rgba(255,255,255,0.05)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                boxShadow: justDone===t.id ? '0 0 14px rgba(160,210,170,0.7)' : 'none',
                transition:'all 0.28s ease',
              }}>
                {t.done && <Check size={9} color="rgba(40,80,40,0.9)" strokeWidth={2.5}/>}
              </div>
            </button>
            <span style={{ ...T.sm, flex:1, color: t.done ? C.textMuted : C.textSub, textDecoration: t.done ? 'line-through' : 'none', transition:'all 0.25s', lineHeight:1.4 }}>{t.title}</span>
            {hovId===t.id && !t.done && (
              <button onClick={() => onFocus(t)} style={{ background:'none', border:'none', cursor:'pointer', color:C.textMuted, display:'flex', padding:0, flexShrink:0 }} title="Focus on this task">
                <Target size={12} strokeWidth={1.5}/>
              </button>
            )}
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:7, marginTop:12 }}>
        <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Add task..." style={{ ...gIn, fontSize:11, padding:'7px 10px' }}/>
        <button onClick={add} style={{ background:'rgba(255,255,255,0.12)', border:`1px solid ${C.border}`, borderRadius:8, color:C.textSub, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 10px', cursor:'pointer', flexShrink:0 }}><Plus size={14} strokeWidth={2}/></button>
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV: { id: Page; label: string; icon: React.ReactNode; sub?: { id: string; label: string }[] }[] = [
  { id:'dashboard', label:'Dashboard', icon:<LayoutGrid size={15} strokeWidth={1.5}/> },
  { id:'projects',  label:'Projects',  icon:<Layers size={15} strokeWidth={1.5}/> },
  { id:'health',    label:'Health',    icon:<Heart size={15} strokeWidth={1.5}/> },
  { id:'family',    label:'Family',    icon:<Home size={15} strokeWidth={1.5}/>, sub:[{id:'kids',label:'Kids'},{id:'wife',label:'Wife'},{id:'parents',label:'Parents'}] },
  { id:'friends',   label:'Friends',   icon:<Users size={15} strokeWidth={1.5}/> },
]

function Sidebar({ page, setPage, familySub, setFamilySub, tod, onFocus }: {
  page: Page; setPage: (p: Page) => void; familySub: string; setFamilySub: (s: string) => void
  tod: TimeOfDay; onFocus: (t: Task) => void
}) {
  return (
    <div style={{
      width:268, minHeight:'100vh', flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto',
      background:'rgba(0,0,0,0.32)', backdropFilter:'blur(48px) saturate(150%)', WebkitBackdropFilter:'blur(48px) saturate(150%)',
      borderRight:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column',
    }}>
      {/* Brand */}
      <div style={{ padding:'30px 24px 22px' }}>
        <div style={{ ...T.label, color: C.champagne, marginBottom:4 }}>Dr Muhammad Qasim</div>
        <div style={{ ...T.label, color: C.textMuted, fontWeight:400, letterSpacing:'0.06em' }}>Command Centre</div>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:16, ...T.sm, color: C.textMuted }}>
          <span style={{ display:'flex', color:C.champagne, opacity:0.7 }}>{TOD_DATA[tod].icon}</span>
          <span>{TOD_DATA[tod].greeting}</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding:'0 12px', flex:1 }}>
        {NAV.map(item => {
          const active = page === item.id
          return (
            <div key={item.id}>
              <div onClick={() => setPage(item.id)}
                style={{ display:'flex', alignItems:'center', gap:11, padding:'11px 14px', borderRadius:12, cursor:'pointer', marginBottom:3, background: active ? 'rgba(255,255,255,0.10)' : 'transparent', color: active ? C.text : C.textMuted, border: active ? `1px solid rgba(255,255,255,0.12)` : '1px solid transparent', transition:'all 0.2s', ...T.body, fontWeight: active ? 500 : 400 }}
                onMouseEnter={e => { if(!active){e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color=C.textSub} }}
                onMouseLeave={e => { if(!active){e.currentTarget.style.background='transparent'; e.currentTarget.style.color=C.textMuted} }}
              >
                <span style={{ display:'flex', color: active ? C.champagne : 'inherit' }}>{item.icon}</span>
                {item.label}
              </div>
              {item.sub && active && (
                <div style={{ paddingLeft:40, marginBottom:4 }}>
                  {item.sub.map(s => (
                    <div key={s.id} onClick={() => setFamilySub(s.id)}
                      style={{ ...T.sm, padding:'7px 12px', borderRadius:9, cursor:'pointer', color: familySub===s.id ? C.champagne : C.textMuted, background: familySub===s.id ? 'rgba(224,204,158,0.10)' : 'transparent', marginBottom:2, transition:'all 0.15s' }}
                    >{s.label}</div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div style={{ height:1, background:'rgba(255,255,255,0.05)', margin:'14px 22px' }}/>

      <div style={{ padding:'0 20px 16px' }}>
        <div style={{ ...T.label, color:C.textMuted, marginBottom:12 }}>Calendar</div>
        <MiniCalendar/>
      </div>

      <div style={{ height:1, background:'rgba(255,255,255,0.05)', margin:'0 22px 14px' }}/>

      <div style={{ padding:'0 20px 30px' }}>
        <SidebarTasks onFocus={onFocus}/>
      </div>
    </div>
  )
}

// ─── Weather icon helper ──────────────────────────────────────────────────────

function WxIcon({ code, size=36 }: { code: number; size?: number }) {
  const p = { size, color: C.text, strokeWidth: 1.2 }
  if (code === 0 || code === 1) return <Sun {...p}/>
  if (code === 2 || code === 3) return <Cloud {...p}/>
  if (code >= 45 && code <= 48) return <CloudFog {...p}/>
  if (code >= 51 && code <= 65) return <CloudRain {...p}/>
  if (code >= 71 && code <= 77) return <CloudSnow {...p}/>
  if (code >= 80 && code <= 82) return <CloudRain {...p}/>
  if (code >= 95)                return <CloudLightning {...p}/>
  return <Sun {...p}/>
}

const WX_DESC: Record<number, string> = { 0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Icy fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',71:'Light snow',73:'Snow',75:'Heavy snow',80:'Showers',81:'Rain showers',82:'Heavy showers',95:'Thunderstorm' }

// ─── Widgets ──────────────────────────────────────────────────────────────────

function WeatherWidget() {
  const [wx, setWx] = useState<{ temp:number; code:number; wind:number; city:string }|null>(null)
  useEffect(() => {
    const load = (lat: number, lon: number, city: string) =>
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`)
        .then(r=>r.json()).then(d => setWx({ temp:Math.round(d.current.temperature_2m), code:d.current.weather_code, wind:Math.round(d.current.wind_speed_10m), city }))
    navigator.geolocation?.getCurrentPosition(
      p => load(p.coords.latitude, p.coords.longitude, 'Your location'),
      () => load(51.5, -0.12, 'London')
    )
  }, [])

  return (
    <Glass float style={{ padding:26 }}>
      <WLabel icon={<Cloud size={13} strokeWidth={1.5}/>}>Weather</WLabel>
      {wx ? (
        <>
          <div style={{ marginBottom:12, animation:'float 11s ease-in-out infinite' }}><WxIcon code={wx.code} size={42}/></div>
          <div style={{ ...T.display, color: C.text }}>{wx.temp}°</div>
          <div style={{ ...T.body, color: C.textSub, marginTop:6 }}>{WX_DESC[wx.code] ?? ''}</div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:14, ...T.sm, color: C.textMuted }}>
            <Wind size={11} strokeWidth={1.5}/><span>{wx.wind} km/h · {wx.city}</span>
          </div>
        </>
      ) : <div style={{ ...T.body, color:C.textMuted }}>Fetching weather...</div>}
    </Glass>
  )
}

const CLOCKS = [
  { city:'London',   tz:'Europe/London',   flag:'GB' },
  { city:'Dubai',    tz:'Asia/Dubai',       flag:'AE' },
  { city:'New York', tz:'America/New_York', flag:'US' },
  { city:'Lahore',   tz:'Asia/Karachi',     flag:'PK' },
]

function ClockWidget() {
  const [, setTick] = useState(0)
  useEffect(() => { const id=setInterval(()=>setTick(t=>t+1),1000); return ()=>clearInterval(id) }, [])
  const fmt = (tz: string) => new Date().toLocaleTimeString('en-GB', { timeZone:tz, hour:'2-digit', minute:'2-digit' })

  return (
    <Glass float style={{ padding:26 }}>
      <WLabel icon={<Clock size={13} strokeWidth={1.5}/>}>World Clock</WLabel>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {CLOCKS.map(c => (
          <div key={c.city} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ ...T.sm, color: C.textSub }}>{c.city}</span>
            <span style={{ ...T.h3, color: C.text, fontVariantNumeric:'tabular-nums', letterSpacing:'0.02em' }}>{fmt(c.tz)}</span>
          </div>
        ))}
      </div>
    </Glass>
  )
}

function ReflectionsWidget() {
  const [items, setItems] = useState<Reflection[]>([])
  const [text, setText] = useState('')
  const load = useCallback(async () => { const r=await fetch('/api/reflections'); setItems(await r.json()) }, [])
  useEffect(() => { load() }, [load])
  const save = async () => { if(!text.trim()) return; await fetch('/api/reflections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:text.trim()})}); setText(''); load() }
  const del  = async (id:number) => { await fetch('/api/reflections',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); load() }

  return (
    <Glass style={{ padding:26, display:'flex', flexDirection:'column', gap:16 }}>
      <WLabel icon={<Feather size={13} strokeWidth={1.5}/>}>Stray Reflections</WLabel>
      <div style={{ display:'flex', gap:8 }}>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="A thought, observation, or idea..." rows={2}
          style={{ ...gIn, resize:'none', flex:1, lineHeight:1.65 }}
          onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); save() } }}
        />
        <button onClick={save} style={{ background:'rgba(224,204,158,0.18)', border:`1px solid rgba(224,204,158,0.28)`, borderRadius:10, color:C.champagne, fontWeight:600, fontSize:16, padding:'0 18px', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center' }}>
          <ArrowUpRight size={16} strokeWidth={2}/>
        </button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10, maxHeight:210, overflowY:'auto' }}>
        {items.map((r,i) => (
          <div key={r.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:'14px 16px', borderLeft:'2px solid rgba(224,204,158,0.25)', position:'relative', animation:'fadeUp 0.3s ease both', animationDelay:`${i*0.04}s` }}>
            <div style={{ ...T.body, color: C.textSub, lineHeight:1.65 }}>{r.content}</div>
            <div style={{ ...T.sm, color: C.textMuted, marginTop:8 }}>{new Date(r.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
            <button onClick={()=>del(r.id)} style={{ position:'absolute', top:10, right:10, background:'none', border:'none', color:C.textMuted, cursor:'pointer', display:'flex' }}><X size={12} strokeWidth={2}/></button>
          </div>
        ))}
        {items.length===0 && <div style={{ ...T.sm, color:C.textMuted, textAlign:'center', padding:'18px 0' }}>No reflections yet</div>}
      </div>
    </Glass>
  )
}

const CAT_C: Record<string,{border:string;bg:string;text:string}> = {
  Clinical:       {border:'#7ac9a0',bg:'rgba(120,200,150,0.18)',text:'rgba(180,240,200,0.92)'},
  Academic:       {border:'#7ab0e8',bg:'rgba(100,160,230,0.18)',text:'rgba(160,200,240,0.92)'},
  Entrepreneurial:{border:'#b09adf',bg:'rgba(160,140,220,0.18)',text:'rgba(200,180,240,0.92)'},
  Career:         {border:'#e8c070',bg:'rgba(220,180,80,0.18)', text:'rgba(240,210,140,0.92)'},
}
const STATUS_C: Record<string,{bg:string;text:string}> = {
  'In progress':{bg:'rgba(120,200,150,0.18)',text:'rgba(180,240,200,0.92)'},
  'Not started':{bg:'rgba(255,255,255,0.07)',text:'rgba(255,255,255,0.50)'},
  'On hold':    {bg:'rgba(220,180,80,0.15)', text:'rgba(240,210,140,0.92)'},
  'Complete':   {bg:'rgba(100,160,230,0.18)',text:'rgba(160,200,240,0.92)'},
}
const STATUSES = ['Not started','In progress','On hold','Complete']

function Chip({ label, bg, text }: { label:string;bg:string;text:string }) {
  return <span style={{ ...T.label, fontSize:9, display:'inline-block', padding:'3px 10px', borderRadius:99, background:bg, color:text }}>{label}</span>
}

function ProjectsWidget({ projects, onOpen }: { projects:Project[]; onOpen:()=>void }) {
  const active = projects.filter(p=>p.status==='In progress')
  return (
    <Glass style={{ padding:26 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
        <WLabel icon={<Layers size={13} strokeWidth={1.5}/>}>Projects</WLabel>
        <button onClick={onOpen} style={{ background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, borderRadius:10, color:C.textSub, padding:'6px 16px', cursor:'pointer', ...T.sm, fontWeight:500, marginTop:-18, display:'flex', alignItems:'center', gap:6 }}>
          All <ArrowUpRight size={11} strokeWidth={2}/>
        </button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        {[{label:'Total',val:projects.length},{label:'Active',val:active.length},{label:'Blockers',val:projects.filter(p=>p.block).length},{label:'Deadlines',val:projects.filter(p=>p.dl).length}].map(s => (
          <div key={s.label} style={{ background:'rgba(255,255,255,0.05)', borderRadius:14, padding:'14px 10px', textAlign:'center' }}>
            <div style={{ ...T.h1, color:C.text }}>{s.val}</div>
            <div style={{ ...T.label, color:C.textMuted, marginTop:5, fontSize:9 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {active.slice(0,4).map(p => {
          const cc = CAT_C[p.cat]??CAT_C.Clinical
          return (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'rgba(255,255,255,0.04)', borderRadius:14, borderLeft:`3px solid ${cc.border}` }}>
              <div style={{ flex:1 }}>
                <div style={{ ...T.h3, color:C.text }}>{p.title}</div>
                {p.next && <div style={{ ...T.sm, color:C.textMuted, marginTop:4 }}>{p.next}</div>}
              </div>
              <Chip label={p.cat} bg={cc.bg} text={cc.text}/>
            </div>
          )
        })}
      </div>
    </Glass>
  )
}

function HealthWidget() {
  const metrics = [
    { icon:<Flame size={20} strokeWidth={1.3}/>, label:'Calories', unit:'kcal', c:'rgba(240,180,100,0.85)' },
    { icon:<Activity size={20} strokeWidth={1.3}/>, label:'Heart Rate', unit:'bpm', c:'rgba(240,130,130,0.85)' },
    { icon:<Activity size={20} strokeWidth={1.3}/>, label:'Steps', unit:'today', c:'rgba(140,210,160,0.85)' },
    { icon:<Moon size={20} strokeWidth={1.3}/>, label:'Sleep', unit:'hrs', c:'rgba(170,160,220,0.85)' },
  ]
  return (
    <Glass style={{ padding:26 }}>
      <WLabel icon={<Heart size={13} strokeWidth={1.5}/>}>Health</WLabel>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background:'rgba(255,255,255,0.05)', borderRadius:14, padding:'14px 12px', textAlign:'center' }}>
            <div style={{ color:m.c, marginBottom:8, display:'flex', justifyContent:'center' }}>{m.icon}</div>
            <div style={{ ...T.h2, color:m.c }}>—</div>
            <div style={{ ...T.label, color:C.textMuted, marginTop:5, fontSize:9 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(255,255,255,0.04)', border:`1px solid rgba(255,255,255,0.09)`, borderRadius:14, padding:'14px 16px' }}>
        <div style={{ ...T.sm, fontWeight:600, color:'rgba(240,160,140,0.82)', marginBottom:6 }}>Connect Apple Watch</div>
        <div style={{ ...T.sm, color:C.textMuted, lineHeight:1.7 }}>Use iOS Shortcuts to POST HealthKit data to <code style={{ background:'rgba(255,255,255,0.08)', padding:'2px 6px', borderRadius:5, fontSize:11 }}>/api/health</code></div>
      </div>
    </Glass>
  )
}

function FamilyWidget({ onOpen }: { onOpen: () => void }) {
  return (
    <Glass style={{ padding:26 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
        <WLabel icon={<Home size={13} strokeWidth={1.5}/>}>Family</WLabel>
        <button onClick={onOpen} style={{ background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, borderRadius:10, color:C.textSub, padding:'6px 16px', cursor:'pointer', ...T.sm, fontWeight:500, marginTop:-18, display:'flex', alignItems:'center', gap:6 }}>
          Open <ArrowUpRight size={11} strokeWidth={2}/>
        </button>
      </div>
      {[{label:'Kids'},{label:'Wife'},{label:'Parents'}].map(s => (
        <div key={s.label} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 14px', background:'rgba(255,255,255,0.04)', borderRadius:14, marginBottom:8 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'rgba(224,204,158,0.55)', flexShrink:0 }}/>
          <span style={{ ...T.body, color: C.textSub }}>{s.label}</span>
        </div>
      ))}
    </Glass>
  )
}

function NewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/news').then(r=>r.json()).then(d=>{setNews(d);setLoading(false)}) }, [])
  return (
    <Glass style={{ padding:26 }}>
      <WLabel icon={<Newspaper size={13} strokeWidth={1.5}/>}>News · BBC</WLabel>
      {loading && <div style={{ ...T.body, color:C.textMuted }}>Loading...</div>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {news.map((n,i) => (
          <a key={i} href={n.link} target="_blank" rel="noopener noreferrer"
            style={{ textDecoration:'none', display:'block', background:'rgba(255,255,255,0.04)', borderRadius:14, padding:'16px 18px', borderTop:`1px solid rgba(255,255,255,0.09)`, transition:'all 0.22s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.transform='translateY(0)'}}>
            <div style={{ ...T.h3, color:C.text, marginBottom:8, lineHeight:1.45 }}>{n.title}</div>
            <div style={{ ...T.sm, color:C.textMuted, lineHeight:1.6 }}>{n.description}</div>
            {n.pubDate && <div style={{ ...T.label, color:C.textMuted, marginTop:10, fontSize:9 }}>{new Date(n.pubDate).toLocaleDateString('en-GB')}</div>}
          </a>
        ))}
      </div>
    </Glass>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ projects, setPage }: { projects:Project[]; setPage:(p:Page)=>void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 2fr', gap:18 }}>
        <WeatherWidget/>
        <ClockWidget/>
        <ReflectionsWidget/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:18 }}>
        <ProjectsWidget projects={projects} onOpen={() => setPage('projects')}/>
        <HealthWidget/>
        <FamilyWidget onOpen={() => setPage('family')}/>
      </div>
      <NewsWidget/>
    </div>
  )
}

// ─── Project modal ────────────────────────────────────────────────────────────

function todayStr() { const d=new Date(); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}` }

function ProjectModal({ project, onClose, onSave, onDelete }: { project:Project|null; onClose:()=>void; onSave:(p:Project)=>Promise<void>; onDelete:(id:number)=>Promise<void> }) {
  const [form, setForm] = useState<Project|null>(null)
  const [newPhase, setNewPhase] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { setForm(project ? { ...project, phases:[...project.phases], log:[...project.log] } : null) }, [project])
  if (!form) return null
  const set = (k: keyof Project, v: any) => setForm(f => f ? {...f,[k]:v} : f)
  const addPhase = () => { if(!newPhase.trim()) return; set('phases',[...form.phases,newPhase.trim()]); setNewPhase('') }
  const removePhase = (i:number) => { const p=form.phases.filter((_,j)=>j!==i); set('phases',p); if(form.cp>=p.length) set('cp',Math.max(0,p.length-1)) }
  const movePhase = (i:number,dir:-1|1) => { const p=[...form.phases]; const j=i+dir; if(j<0||j>=p.length) return; [p[i],p[j]]=[p[j],p[i]]; set('phases',p) }
  const handleSave = async () => { if(!form) return; setSaving(true); await onSave(form); setSaving(false); onClose() }
  const handleDelete = async () => { if(!form||!confirm('Delete this project?')) return; await onDelete(form.id); onClose() }
  const mIn: React.CSSProperties = { width:'100%', padding:'9px 12px', border:'1px solid #e4e4e7', borderRadius:9, fontSize:14, color:'#18181b', background:'#fafafa', boxSizing:'border-box' }
  const F = ({ label, children }: { label:string; children:React.ReactNode }) => (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#71717a', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</label>
      {children}
    </div>
  )
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.60)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:800, padding:16, backdropFilter:'blur(8px)' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#fff', borderRadius:22, width:'100%', maxWidth:620, maxHeight:'92vh', overflowY:'auto', padding:32 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <h2 style={{ margin:0, fontSize:20, fontWeight:600, color:'#18181b' }}>{form.id?'Edit Project':'New Project'}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#71717a', display:'flex' }}><X size={20}/></button>
        </div>
        <F label="Title"><input value={form.title} onChange={e=>set('title',e.target.value)} style={mIn}/></F>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <F label="Category"><select value={form.cat} onChange={e=>set('cat',e.target.value)} style={mIn}>{['Clinical','Academic','Entrepreneurial','Career'].map(c=><option key={c}>{c}</option>)}</select></F>
          <F label="Status"><select value={form.status} onChange={e=>set('status',e.target.value)} style={mIn}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></F>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <F label="Deadline"><input value={form.dl} onChange={e=>set('dl',e.target.value)} style={mIn} placeholder="e.g. 30 Sep 2026"/></F>
          <F label="Assigned to"><input value={form.who} onChange={e=>set('who',e.target.value)} style={mIn}/></F>
        </div>
        <F label="Next step"><input value={form.next} onChange={e=>set('next',e.target.value)} style={mIn}/></F>
        <F label="Last action (auto-logs)"><input value={form.last} onChange={e=>set('last',e.target.value)} style={mIn}/></F>
        <F label="Blocker"><input value={form.block} onChange={e=>set('block',e.target.value)} style={mIn}/></F>
        <F label="Phases">
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {form.phases.map((p,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ flex:1, fontSize:13, color:'#3f3f46' }}>{p}</span>
                <button onClick={()=>movePhase(i,-1)} style={{ background:'none', border:'1px solid #e4e4e7', borderRadius:6, padding:'3px 8px', cursor:'pointer', fontSize:11, color:'#71717a' }}>↑</button>
                <button onClick={()=>movePhase(i,1)}  style={{ background:'none', border:'1px solid #e4e4e7', borderRadius:6, padding:'3px 8px', cursor:'pointer', fontSize:11, color:'#71717a' }}>↓</button>
                <button onClick={()=>removePhase(i)}  style={{ background:'none', border:'1px solid #e4e4e7', borderRadius:6, padding:'3px 8px', cursor:'pointer', fontSize:11, color:'#ef4444', display:'flex' }}><X size={11}/></button>
              </div>
            ))}
            <div style={{ display:'flex', gap:7, marginTop:5 }}>
              <input value={newPhase} onChange={e=>setNewPhase(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addPhase()} placeholder="Add phase..." style={{ ...mIn, flex:1 }}/>
              <button onClick={addPhase} style={{ background:'#f4f4f5', border:'1px solid #e4e4e7', borderRadius:8, padding:'7px 16px', cursor:'pointer', fontSize:13, color:'#3f3f46' }}>Add</button>
            </div>
          </div>
        </F>
        <F label={`Phase ${form.cp+1} of ${form.phases.length||1}: ${form.phases[form.cp]??'–'}`}>
          <input type="range" min={0} max={Math.max(0,form.phases.length-1)} value={form.cp} onChange={e=>set('cp',Number(e.target.value))} style={{ width:'100%' }}/>
        </F>
        {form.log.length>0 && (
          <F label="Activity log">
            <div style={{ maxHeight:110, overflowY:'auto', display:'flex', flexDirection:'column', gap:5 }}>
              {[...form.log].reverse().map((e,i)=>(
                <div key={i} style={{ fontSize:12, color:'#52525b', borderLeft:'2px solid #e4e4e7', paddingLeft:9 }}>
                  <span style={{ fontWeight:600 }}>{e.d}</span> — {e.n}
                </div>
              ))}
            </div>
          </F>
        )}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:22 }}>
          {form.id ? <button onClick={handleDelete} style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:9, padding:'9px 18px', cursor:'pointer', fontWeight:600, fontSize:14 }}>Delete</button> : <div/>}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose} style={{ background:'#f4f4f5', border:'none', borderRadius:9, padding:'9px 18px', cursor:'pointer', fontSize:14, color:'#52525b' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ background:'#059669', color:'#fff', border:'none', borderRadius:9, padding:'9px 22px', cursor:'pointer', fontWeight:600, fontSize:14, opacity:saving?0.7:1 }}>{saving?'Saving...':'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectsPage({ projects, reload }: { projects:Project[]; reload:()=>Promise<void> }) {
  const [cat, setCat] = useState('All')
  const [view, setView] = useState<'board'|'list'>('board')
  const [selected, setSelected] = useState<Project|null>(null)
  const filtered = projects.filter(p=>cat==='All'||p.cat===cat)
  const CATS = ['All','Clinical','Academic','Entrepreneurial','Career']

  const handleSave = async (form:Project) => {
    const prevLast = projects.find(p=>p.id===form.id)?.last??''
    const log = form.last && form.last!==prevLast ? [...form.log,{d:todayStr(),n:form.last}] : form.log
    const payload = { ...form, log }
    if (form.id) { await fetch('/api/projects',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}) }
    else { const {id:_,...body}=payload; await fetch('/api/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}) }
    await reload()
  }
  const handleDelete = async (id:number) => { await fetch('/api/projects',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); await reload() }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
        <h1 style={{ margin:0, ...T.h1, color:C.text }}>Projects</h1>
        <button onClick={()=>setSelected({id:0,title:'',cat:'Clinical',status:'Not started',phases:[],cp:0,next:'',last:'',dl:'',who:'',block:'',log:[]})}
          style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(0,0,0,0.30)', backdropFilter:'blur(20px)', border:`1px solid ${C.border}`, borderRadius:14, color:C.text, ...T.body, fontWeight:500, padding:'10px 22px', cursor:'pointer' }}>
          <Plus size={14} strokeWidth={2}/>New project
        </button>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', gap:7 }}>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{ padding:'7px 18px', borderRadius:22, border:'none', cursor:'pointer', ...T.sm, fontWeight:600, background:cat===c?'rgba(255,255,255,0.16)':'rgba(0,0,0,0.28)', color:cat===c?C.text:C.textMuted, backdropFilter:'blur(20px)' }}>{c}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:4, background:'rgba(0,0,0,0.28)', borderRadius:12, padding:4, backdropFilter:'blur(20px)' }}>
          {(['board','list'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'6px 18px', borderRadius:9, border:'none', cursor:'pointer', ...T.sm, fontWeight:600, textTransform:'capitalize', background:view===v?'rgba(255,255,255,0.14)':'transparent', color:view===v?C.text:C.textMuted }}>{v}</button>
          ))}
        </div>
      </div>
      {view==='board' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, alignItems:'start' }}>
          {STATUSES.map(s=>{
            const sc=STATUS_C[s]; const items=filtered.filter(p=>p.status===s)
            return (
              <div key={s}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <Chip label={s} bg={sc.bg} text={sc.text}/>
                  <span style={{ ...T.label, color:C.textMuted, fontSize:9 }}>{items.length}</span>
                </div>
                {items.map(p=>{
                  const cc=CAT_C[p.cat]??CAT_C.Clinical
                  return (
                    <div key={p.id} onClick={()=>setSelected(p)}
                      style={{ background:'rgba(0,0,0,0.25)', backdropFilter:'blur(24px)', borderRadius:16, padding:'14px 16px', borderLeft:`3px solid ${cc.border}`, marginBottom:10, cursor:'pointer', transition:'all 0.2s', border:`1px solid rgba(255,255,255,0.08)`, borderLeftColor:cc.border, borderLeftWidth:3 }}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,0,0,0.38)'; e.currentTarget.style.transform='translateY(-2px)'}}
                      onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,0,0,0.25)'; e.currentTarget.style.transform='translateY(0)'}}>
                      <div style={{ ...T.h3, color:C.text, marginBottom:5 }}>{p.title}</div>
                      {p.next&&<div style={{ ...T.sm, color:C.textMuted, fontStyle:'italic' }}>{p.next}</div>}
                      {p.dl&&<div style={{ ...T.sm, color:C.textMuted, marginTop:8, display:'flex', alignItems:'center', gap:5 }}><Calendar size={10} strokeWidth={1.5}/>{p.dl}</div>}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
      {view==='list' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(p=>{
            const cc=CAT_C[p.cat]??CAT_C.Clinical; const sc=STATUS_C[p.status]??STATUS_C['Not started']
            return (
              <div key={p.id} onClick={()=>setSelected(p)}
                style={{ background:'rgba(0,0,0,0.25)', backdropFilter:'blur(24px)', borderRadius:16, padding:'15px 20px', borderLeft:`3px solid ${cc.border}`, cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'all 0.2s', border:`1px solid rgba(255,255,255,0.08)`, borderLeftColor:cc.border, borderLeftWidth:3 }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,0,0,0.38)'; e.currentTarget.style.transform='translateY(-1px)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,0,0,0.25)'; e.currentTarget.style.transform='translateY(0)'}}>
                <div style={{ flex:1 }}>
                  <div style={{ ...T.h3, color:C.text }}>{p.title}</div>
                  {p.next&&<div style={{ ...T.sm, color:C.textMuted, marginTop:3 }}>{p.next}</div>}
                </div>
                <Chip label={p.cat} bg={cc.bg} text={cc.text}/>
                <Chip label={p.status} bg={sc.bg} text={sc.text}/>
                {p.dl&&<span style={{ ...T.sm, color:C.textMuted, display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}><Calendar size={10} strokeWidth={1.5}/>{p.dl}</span>}
              </div>
            )
          })}
        </div>
      )}
      {selected && <ProjectModal project={selected} onClose={()=>setSelected(null)} onSave={handleSave} onDelete={handleDelete}/>}
    </div>
  )
}

// ─── Health / Family / Friends pages ─────────────────────────────────────────

function HealthPage() {
  return (
    <div>
      <h1 style={{ margin:'0 0 26px', ...T.h1, color:C.text }}>Health</h1>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
        {[
          {icon:<Flame size={28} strokeWidth={1.2}/>,label:'Active Calories',unit:'kcal',c:'rgba(240,180,100,0.88)'},
          {icon:<Activity size={28} strokeWidth={1.2}/>,label:'Heart Rate',unit:'bpm',c:'rgba(240,130,130,0.88)'},
          {icon:<Activity size={28} strokeWidth={1.2}/>,label:'Steps',unit:'today',c:'rgba(140,210,160,0.88)'},
          {icon:<Moon size={28} strokeWidth={1.2}/>,label:'Sleep',unit:'hrs',c:'rgba(170,160,220,0.88)'},
        ].map(m=>(
          <Glass key={m.label} style={{ padding:24, textAlign:'center' }}>
            <div style={{ color:m.c, marginBottom:10, display:'flex', justifyContent:'center' }}>{m.icon}</div>
            <div style={{ ...T.h1, color:m.c, fontSize:38, fontWeight:200 }}>—</div>
            <div style={{ ...T.label, color:C.textMuted, marginTop:8, fontSize:9 }}>{m.label}</div>
          </Glass>
        ))}
      </div>
      <Glass style={{ padding:26 }}>
        <div style={{ ...T.h3, color:'rgba(240,160,140,0.88)', marginBottom:14 }}>Connect Apple Watch</div>
        <div style={{ ...T.body, color:C.textSub, lineHeight:1.8 }}>
          HealthKit cannot be read directly by a web app. To pipe your metrics here:<br/>
          1. Create an <strong style={{color:C.text}}>Apple Shortcut</strong> that runs on unlock or daily.<br/>
          2. Use "Get Health Samples" to read Calories, Heart Rate, Steps, Sleep.<br/>
          3. POST the JSON to <code style={{ background:'rgba(255,255,255,0.10)', padding:'2px 8px', borderRadius:5, fontSize:12 }}>/api/health</code>.<br/>
          4. The metrics above populate automatically once connected.
        </div>
      </Glass>
    </div>
  )
}

function FamilyPage({ sub, setSub }: { sub:string; setSub:(s:string)=>void }) {
  const [notes, setNotes] = useState<FamilyNote[]>([])
  const [text, setText] = useState('')
  const load = useCallback(async () => { const r=await fetch('/api/family'); setNotes(await r.json()) }, [])
  useEffect(() => { load() }, [load])
  const subs = [{id:'kids',label:'Kids'},{id:'wife',label:'Wife'},{id:'parents',label:'Parents'}]
  const cur = subs.find(s=>s.id===sub)
  const mn = notes.filter(n=>n.member===sub)
  const add = async () => { if(!text.trim()) return; await fetch('/api/family',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({member:sub,content:text.trim()})}); setText(''); load() }
  const del = async (id:number) => { await fetch('/api/family',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); load() }
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:26 }}>
        <h1 style={{ margin:0, ...T.h1, color:C.text }}>Family</h1>
        <div style={{ display:'flex', gap:7 }}>
          {subs.map(s=>(
            <button key={s.id} onClick={()=>setSub(s.id)} style={{ padding:'7px 20px', borderRadius:22, border:'none', cursor:'pointer', ...T.sm, fontWeight:600, background:sub===s.id?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.28)', color:sub===s.id?C.text:C.textMuted, backdropFilter:'blur(20px)' }}>{s.label}</button>
          ))}
        </div>
      </div>
      <Glass style={{ padding:26 }}>
        <div style={{ display:'flex', gap:10, marginBottom:22 }}>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`Add a note about ${cur?.label}...`} rows={2} style={{ ...gIn, flex:1, resize:'none', lineHeight:1.65 }} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();add()}}}/>
          <button onClick={add} style={{ background:'rgba(255,255,255,0.12)', border:`1px solid ${C.border}`, borderRadius:12, color:C.text, ...T.body, fontWeight:500, padding:'0 22px', cursor:'pointer' }}>Add</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {mn.map(n=>(
            <div key={n.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:'15px 18px', borderLeft:'2px solid rgba(255,255,255,0.12)', position:'relative' }}>
              <div style={{ ...T.body, color:C.textSub, lineHeight:1.65 }}>{n.content}</div>
              <div style={{ ...T.label, color:C.textMuted, marginTop:8, fontSize:9 }}>{new Date(n.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
              <button onClick={()=>del(n.id)} style={{ position:'absolute', top:12, right:12, background:'none', border:'none', color:C.textMuted, cursor:'pointer', display:'flex' }}><X size={12}/></button>
            </div>
          ))}
          {mn.length===0 && <div style={{ ...T.body, color:C.textMuted, textAlign:'center', padding:'26px 0' }}>No notes for {cur?.label} yet</div>}
        </div>
      </Glass>
    </div>
  )
}

function FriendsPage() {
  const [notes, setNotes] = useState<FriendNote[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [filter, setFilter] = useState('')
  const load = useCallback(async () => { const r=await fetch('/api/friends'); setNotes(await r.json()) }, [])
  useEffect(() => { load() }, [load])
  const names = Array.from(new Set(notes.map(n=>n.name)))
  const add = async () => { if(!name.trim()||!text.trim()) return; await fetch('/api/friends',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name.trim(),content:text.trim()})}); setText(''); load() }
  const del = async (id:number) => { await fetch('/api/friends',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); load() }
  const filtered = notes.filter(n=>!filter||n.name===filter)
  return (
    <div>
      <h1 style={{ margin:'0 0 26px', ...T.h1, color:C.text }}>Friends</h1>
      <Glass style={{ padding:26, marginBottom:18 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr auto', gap:10, marginBottom:names.length?18:0 }}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" style={gIn}/>
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Note..." style={gIn} onKeyDown={e=>e.key==='Enter'&&add()}/>
          <button onClick={add} style={{ background:'rgba(255,255,255,0.12)', border:`1px solid ${C.border}`, borderRadius:12, color:C.text, ...T.body, fontWeight:500, padding:'0 24px', cursor:'pointer' }}>Add</button>
        </div>
        {names.length>0 && (
          <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
            <button onClick={()=>setFilter('')} style={{ padding:'5px 16px', borderRadius:16, border:'none', cursor:'pointer', ...T.sm, fontWeight:600, background:filter===''?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.07)', color:filter===''?C.text:C.textMuted }}> All</button>
            {names.map(n=>(
              <button key={n} onClick={()=>setFilter(n)} style={{ padding:'5px 16px', borderRadius:16, border:'none', cursor:'pointer', ...T.sm, fontWeight:600, background:filter===n?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.07)', color:filter===n?C.text:C.textMuted }}>{n}</button>
            ))}
          </div>
        )}
      </Glass>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.map(n=>(
          <Glass key={n.id} style={{ padding:'16px 20px', position:'relative' }}>
            <div style={{ ...T.label, color:C.champagne, marginBottom:6, fontSize:9 }}>{n.name}</div>
            <div style={{ ...T.body, color:C.textSub, lineHeight:1.65 }}>{n.content}</div>
            <div style={{ ...T.label, color:C.textMuted, marginTop:8, fontSize:9 }}>{new Date(n.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
            <button onClick={()=>del(n.id)} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', color:C.textMuted, cursor:'pointer', display:'flex' }}><X size={12}/></button>
          </Glass>
        ))}
        {filtered.length===0 && <div style={{ ...T.body, color:C.textMuted, textAlign:'center', padding:'32px 0' }}>No entries yet</div>}
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function CommandCentre() {
  const [page, setPage]         = useState<Page>('dashboard')
  const [familySub, setFamilySub] = useState('kids')
  const [projects, setProjects]   = useState<Project[]>([])
  const [tod]                     = useState<TimeOfDay>(getTOD)
  const [focusTask, setFocusTask] = useState<Task|null>(null)
  const [landscape, setLandscape] = useState<Landscape>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('landscape') as Landscape) || 'sunset'
    return 'sunset'
  })

  const loadProjects = useCallback(async () => { const r=await fetch('/api/projects'); setProjects(await r.json()) }, [])
  useEffect(() => { loadProjects() }, [loadProjects])

  const changeLandscape = (l: Landscape) => { setLandscape(l); localStorage.setItem('landscape', l) }
  const handleSetPage = (p: Page) => { if(p==='family') setFamilySub('kids'); setPage(p) }

  return (
    <>
      <style>{KEYFRAMES}</style>
      <AmbientBg landscape={landscape} tod={tod}/>
      {focusTask && <FocusMode task={focusTask} onExit={() => setFocusTask(null)}/>}
      <div style={{ position:'relative', zIndex:1, display:'flex', minHeight:'100vh' }}>
        <Sidebar page={page} setPage={handleSetPage} familySub={familySub} setFamilySub={setFamilySub} tod={tod} onFocus={setFocusTask}/>
        <main style={{ flex:1, padding:30, overflowY:'auto', minWidth:0 }}>
          {/* Top bar */}
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:24 }}>
            <LandscapeSelector value={landscape} onChange={changeLandscape}/>
          </div>
          {page==='dashboard' && <Dashboard projects={projects} setPage={handleSetPage}/>}
          {page==='projects'  && <ProjectsPage projects={projects} reload={loadProjects}/>}
          {page==='health'    && <HealthPage/>}
          {page==='family'    && <FamilyPage sub={familySub} setSub={setFamilySub}/>}
          {page==='friends'   && <FriendsPage/>}
        </main>
      </div>
    </>
  )
}
