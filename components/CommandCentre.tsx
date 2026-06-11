'use client'

import { useEffect, useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Project  = { id: number; title: string; cat: string; status: string; phases: string[]; cp: number; next: string; last: string; dl: string; who: string; block: string; log: { d: string; n: string }[] }
type Reflection = { id: number; content: string; created_at: string }
type Task       = { id: number; title: string; done: boolean; due_date: string }
type FamilyNote = { id: number; member: string; content: string; created_at: string }
type FriendNote = { id: number; name: string; content: string; created_at: string }
type NewsItem   = { title: string; link: string; pubDate: string; description: string }
type Page       = 'dashboard' | 'projects' | 'health' | 'family' | 'friends'
type Landscape  = 'sunset' | 'mountain' | 'ocean' | 'forest'
type TimeOfDay  = 'morning' | 'afternoon' | 'evening' | 'night'

// ─── Time of day ─────────────────────────────────────────────────────────────

function getTOD(): TimeOfDay {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

const TOD_GREETING = {
  morning:   { emoji: '🌅', text: 'Good morning' },
  afternoon: { emoji: '☀️', text: 'Good afternoon' },
  evening:   { emoji: '🌆', text: 'Good evening' },
  night:     { emoji: '🌙', text: 'Good night' },
}

// ─── Landscape backgrounds ────────────────────────────────────────────────────

const LS_CONFIG = {
  sunset: {
    label: '🌅 Sunset',
    gradients: {
      morning:   ['#3d1060', '#8a3575', '#d46850', '#f4a840'],
      afternoon: ['#2d0850', '#7a2060', '#c85040', '#f09030'],
      evening:   ['#180028', '#550a48', '#b03030', '#e86020'],
      night:     ['#08000f', '#120020', '#25083a', '#180520'],
    },
  },
  mountain: {
    label: '🏔 Mountain',
    gradients: {
      morning:   ['#d8e8f0', '#b0c8de', '#8aaac4', '#6888a8'],
      afternoon: ['#c0d8ee', '#98bade', '#7098c0', '#5080a8'],
      evening:   ['#805878', '#a87890', '#c89898', '#d8a888'],
      night:     ['#0c1020', '#182038', '#202840', '#182030'],
    },
  },
  ocean: {
    label: '🌊 Ocean',
    gradients: {
      morning:   ['#fef0d8', '#c8dff0', '#7ab0d8', '#2a7098'],
      afternoon: ['#f0f8ff', '#b8d8f0', '#68a8d0', '#1a6090'],
      evening:   ['#f08060', '#c06880', '#5080a0', '#184868'],
      night:     ['#080c18', '#101828', '#183040', '#102838'],
    },
  },
  forest: {
    label: '🌲 Forest',
    gradients: {
      morning:   ['#1a3828', '#254a34', '#305840', '#28504a'],
      afternoon: ['#1e4230', '#2a5438', '#386448', '#306058'],
      evening:   ['#2a2820', '#3a3018', '#484020', '#403818'],
      night:     ['#060c08', '#0c1810', '#101e14', '#0e1a10'],
    },
  },
}

// ─── SVG Landscape elements ───────────────────────────────────────────────────

function SunsetScene({ tod }: { tod: TimeOfDay }) {
  const opacity = tod === 'night' ? 0.08 : 0.7
  const sunY = tod === 'evening' ? 65 : tod === 'night' ? 110 : 55
  return (
    <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe080" stopOpacity={opacity} />
          <stop offset="40%" stopColor="#ff9040" stopOpacity={opacity * 0.5} />
          <stop offset="100%" stopColor="#ff4040" stopOpacity="0" />
        </radialGradient>
        <filter id="sunBlur"><feGaussianBlur stdDeviation="18" /></filter>
        <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Sun orb */}
      <ellipse cx="720" cy={sunY * 8} rx="120" ry="90" fill="url(#sunGlow)" filter="url(#sunBlur)" style={{ animation:'sunFloat 18s ease-in-out infinite alternate' }} />
      {/* Horizon glow */}
      <ellipse cx="720" cy="620" rx="500" ry="80" fill="#ff9040" opacity={tod === 'night' ? 0 : 0.15} filter="url(#sunBlur)" />
      {/* Silhouette hills */}
      <path d="M0,700 Q200,580 400,650 Q600,580 720,620 Q900,550 1100,640 Q1300,580 1440,640 L1440,800 L0,800 Z" fill="rgba(0,0,0,0.25)" />
      <path d="M0,760 Q300,700 600,730 Q900,680 1200,720 Q1350,700 1440,720 L1440,800 L0,800 Z" fill="rgba(0,0,0,0.3)" />
    </svg>
  )
}

function MountainScene({ tod }: { tod: TimeOfDay }) {
  const snowOpacity = tod === 'evening' ? 0.4 : 0.85
  const mistOpacity = tod === 'night' ? 0.08 : 0.22
  return (
    <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <defs>
        <linearGradient id="mistGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity={mistOpacity} />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <filter id="mist"><feGaussianBlur stdDeviation="12" /></filter>
      </defs>
      {/* Back mountains */}
      <path d="M-100,700 L180,280 L380,500 L550,200 L720,480 L900,150 L1080,420 L1260,250 L1440,450 L1540,700 Z" fill={tod==='night'?'rgba(15,20,35,0.9)':'rgba(120,155,185,0.7)'} />
      {/* Snow caps back */}
      <path d="M550,200 L510,320 L590,320 Z" fill={`rgba(255,255,255,${snowOpacity*0.6})`} />
      <path d="M900,150 L855,280 L945,280 Z" fill={`rgba(255,255,255,${snowOpacity*0.8})`} />
      <path d="M1260,250 L1220,360 L1300,360 Z" fill={`rgba(255,255,255,${snowOpacity*0.5})`} />
      {/* Mid mountains */}
      <path d="M-100,750 L100,480 L280,600 L460,350 L640,560 L820,380 L1000,540 L1180,400 L1340,520 L1540,750 Z" fill={tod==='night'?'rgba(10,15,28,0.95)':'rgba(80,110,140,0.85)'} />
      {/* Snow caps mid */}
      <path d="M460,350 L428,450 L492,450 Z" fill={`rgba(255,255,255,${snowOpacity})`} />
      <path d="M820,380 L790,470 L850,470 Z" fill={`rgba(255,255,255,${snowOpacity})`} />
      <path d="M1180,400 L1152,488 L1208,488 Z" fill={`rgba(255,255,255,${snowOpacity*0.9})`} />
      {/* Foreground */}
      <path d="M0,780 Q360,720 720,760 Q1080,720 1440,770 L1440,800 L0,800 Z" fill={tod==='night'?'rgba(5,10,20,1)':'rgba(50,70,90,0.95)'} />
      {/* Mist layer */}
      <rect x="-50" y="480" width="1540" height="200" fill="url(#mistGrad)" filter="url(#mist)" style={{ animation:'mistDrift 25s linear infinite' }} />
    </svg>
  )
}

function OceanScene({ tod }: { tod: TimeOfDay }) {
  const waveOpacity = tod === 'night' ? 0.15 : 0.35
  const glowOpacity = tod === 'evening' ? 0.5 : tod === 'night' ? 0 : 0.3
  return (
    <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <defs>
        <radialGradient id="horizonGlow" cx="50%" cy="0%" r="60%">
          <stop offset="0%" stopColor="#ffe8b0" stopOpacity={glowOpacity} />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <filter id="wavBlur"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      {/* Horizon glow */}
      <rect x="-100" y="280" width="1640" height="200" fill="url(#horizonGlow)" />
      {/* Ocean body */}
      <rect x="0" y="440" width="1440" height="360" fill={tod==='night'?'rgba(10,25,45,0.6)':'rgba(30,90,130,0.25)'} />
      {/* Wave 1 - back */}
      <path d="M-100,460 Q180,428 360,458 Q540,488 720,448 Q900,408 1080,448 Q1260,488 1440,448 Q1540,428 1640,460" stroke={`rgba(255,255,255,${waveOpacity*0.5})`} strokeWidth="2" fill="none" style={{ animation:'wave1 14s ease-in-out infinite' }} />
      {/* Wave 2 - mid */}
      <path d="M-100,520 Q200,488 400,518 Q600,548 800,510 Q1000,472 1200,510 Q1350,538 1540,510" stroke={`rgba(255,255,255,${waveOpacity*0.7})`} strokeWidth="2.5" fill="none" style={{ animation:'wave2 11s ease-in-out infinite' }} />
      {/* Wave 3 - front */}
      <path d="M-100,590 Q220,555 440,588 Q660,620 880,578 Q1100,536 1320,575 Q1440,594 1640,570" stroke={`rgba(255,255,255,${waveOpacity})`} strokeWidth="3" fill="none" style={{ animation:'wave3 8s ease-in-out infinite' }} />
      {/* Foam at front */}
      <path d="M0,680 Q360,660 720,672 Q1080,660 1440,670 L1440,800 L0,800 Z" fill={tod==='night'?'rgba(10,20,40,0.7)':'rgba(255,255,255,0.06)'} />
      {/* Sparkle highlights */}
      {tod !== 'night' && [200,420,650,900,1100,1320].map((x,i)=>(
        <circle key={i} cx={x} cy={430+Math.sin(i)*40} r={3} fill="rgba(255,255,255,0.6)" style={{ animation:`sparkle ${2+i*0.5}s ease-in-out infinite alternate` }} />
      ))}
    </svg>
  )
}

function ForestScene({ tod }: { tod: TimeOfDay }) {
  const rayOpacity = tod === 'morning' ? 0.12 : tod === 'afternoon' ? 0.09 : 0.03
  const fogOpacity = tod === 'morning' ? 0.18 : tod === 'night' ? 0.08 : 0.1
  return (
    <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <defs>
        <linearGradient id="ray1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,240,200,1)" />
          <stop offset="100%" stopColor="rgba(255,240,200,0)" />
        </linearGradient>
        <linearGradient id="fogGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(200,220,210,0)" />
          <stop offset="50%" stopColor={`rgba(200,220,210,${fogOpacity})`} />
          <stop offset="100%" stopColor="rgba(200,220,210,0)" />
        </linearGradient>
        <filter id="forestBlur"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>
      {/* God rays */}
      {[0,1,2,3].map(i => (
        <polygon key={i} points={`${200+i*120},0 ${180+i*120},0 ${300+i*180},800 ${350+i*180},800`}
          fill={`rgba(255,240,180,${rayOpacity})`}
          style={{ animation:`rayPulse ${6+i*2}s ease-in-out infinite alternate` }}
          transform={`skewX(${-8+i*4})`} />
      ))}
      {/* Back tree line */}
      {Array.from({length:18}).map((_,i)=>{
        const x = i*90-20; const h = 280+Math.sin(i*1.4)*80; const w = 60+Math.cos(i*1.1)*20
        return <polygon key={i} points={`${x+w/2},${540-h} ${x},560 ${x+w},560`} fill={tod==='night'?'rgba(5,12,8,0.9)':'rgba(20,50,30,0.7)'} />
      })}
      {/* Mid tree line */}
      {Array.from({length:14}).map((_,i)=>{
        const x = i*110-10; const h = 200+Math.sin(i*1.7)*60; const w = 80+Math.cos(i*1.3)*25
        return <polygon key={i} points={`${x+w/2},${640-h} ${x},660 ${x+w},660`} fill={tod==='night'?'rgba(4,10,6,0.95)':'rgba(15,40,22,0.85)'} />
      })}
      {/* Front tree silhouettes */}
      {Array.from({length:10}).map((_,i)=>{
        const x = i*160-20; const h = 160+Math.sin(i*2)*50; const w = 100+Math.cos(i*1.5)*30
        return <polygon key={i} points={`${x+w/2},${750-h} ${x},770 ${x+w},770`} fill={tod==='night'?'rgba(2,6,4,1)':'rgba(10,28,16,0.95)'} />
      })}
      {/* Forest floor */}
      <path d="M0,770 Q720,760 1440,770 L1440,800 L0,800 Z" fill={tod==='night'?'rgba(2,5,3,1)':'rgba(8,22,12,1)'} />
      {/* Fog layer */}
      <rect x="-50" y="580" width="1540" height="220" fill="url(#fogGrad)" filter="url(#forestBlur)" style={{ animation:'fogDrift 30s linear infinite' }} />
    </svg>
  )
}

// ─── Animated background container ───────────────────────────────────────────

function AmbientBackground({ landscape, tod }: { landscape: Landscape; tod: TimeOfDay }) {
  const cfg = LS_CONFIG[landscape]
  const [g1, g2, g3, g4] = cfg.gradients[tod]
  const bg = `linear-gradient(180deg, ${g1} 0%, ${g2} 33%, ${g3} 66%, ${g4} 100%)`

  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, overflow:'hidden' }}>
      {/* Base gradient */}
      <div style={{ position:'absolute', inset:0, background:bg, transition:'background 2s ease' }} />
      {/* Landscape SVG */}
      {landscape === 'sunset'   && <SunsetScene   tod={tod} />}
      {landscape === 'mountain' && <MountainScene tod={tod} />}
      {landscape === 'ocean'    && <OceanScene    tod={tod} />}
      {landscape === 'forest'   && <ForestScene   tod={tod} />}
      {/* Vignette */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)' }} />
    </div>
  )
}

// ─── CSS keyframes injected once ─────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes sunFloat { from { transform: translateX(-50%) translateY(0); } to { transform: translateX(-50%) translateY(-18px); } }
  @keyframes wave1 { 0%,100% { d: path("M-100,460 Q180,428 360,458 Q540,488 720,448 Q900,408 1080,448 Q1260,488 1440,448 Q1540,428 1640,460"); } 50% { d: path("M-100,448 Q180,488 360,448 Q540,408 720,458 Q900,508 1080,458 Q1260,408 1440,458 Q1540,488 1640,448"); } }
  @keyframes wave2 { 0%,100% { d: path("M-100,520 Q200,488 400,518 Q600,548 800,510 Q1000,472 1200,510 Q1350,538 1540,510"); } 50% { d: path("M-100,510 Q200,548 400,510 Q600,472 800,518 Q1000,558 1200,518 Q1350,490 1540,518"); } }
  @keyframes wave3 { 0%,100% { d: path("M-100,590 Q220,555 440,588 Q660,620 880,578 Q1100,536 1320,575 Q1440,594 1640,570"); } 50% { d: path("M-100,575 Q220,610 440,575 Q660,540 880,590 Q1100,630 1320,590 Q1440,565 1640,590"); } }
  @keyframes sparkle { from { opacity:0.2; r:2; } to { opacity:0.9; r:4; } }
  @keyframes mistDrift { from { transform: translateX(0); } to { transform: translateX(-80px); } }
  @keyframes fogDrift  { from { transform: translateX(0) scaleX(1); } to { transform: translateX(-60px) scaleX(1.05); } }
  @keyframes rayPulse  { from { opacity:0.6; } to { opacity:1; } }
  @keyframes cardFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes taskDone  { 0% { transform:scale(1); } 40% { transform:scale(1.3); } 100% { transform:scale(1); } }
  @keyframes fadeUp    { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
`

// ─── Glass panel ──────────────────────────────────────────────────────────────

function Glass({ children, style, float }: { children: React.ReactNode; style?: React.CSSProperties; float?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.09)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.15)'}`,
        borderRadius: 24,
        boxShadow: hov
          ? '0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)'
          : '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.18)',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        animation: float ? 'cardFloat 7s ease-in-out infinite' : undefined,
        ...style,
      }}
    >{children}</div>
  )
}

// ─── Glass input ──────────────────────────────────────────────────────────────

const gInput: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 10,
  padding: '9px 13px',
  color: 'rgba(255,255,255,0.92)',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
  backdropFilter: 'blur(8px)',
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SHead({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
      <span style={{ fontSize:14 }}>{icon}</span>
      <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.1em', textTransform:'uppercase' }}>{children}</span>
    </div>
  )
}

// ─── Landscape selector ───────────────────────────────────────────────────────

function LandscapeSelector({ value, onChange }: { value: Landscape; onChange: (l: Landscape) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position:'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background:'rgba(255,255,255,0.12)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:20, color:'rgba(255,255,255,0.85)', fontSize:12, fontWeight:600, padding:'7px 16px', cursor:'pointer', letterSpacing:'0.03em' }}
      >
        {LS_CONFIG[value].label} ▾
      </button>
      {open && (
        <div style={{ position:'absolute', top:42, right:0, background:'rgba(20,20,30,0.85)', backdropFilter:'blur(30px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:16, padding:8, zIndex:100, minWidth:160, boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
          {(Object.entries(LS_CONFIG) as [Landscape, typeof LS_CONFIG.sunset][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => { onChange(key); setOpen(false) }}
              style={{ display:'block', width:'100%', background: value===key ? 'rgba(255,255,255,0.12)' : 'transparent', border:'none', borderRadius:10, color:'rgba(255,255,255,0.85)', fontSize:13, fontWeight:value===key?700:400, padding:'10px 14px', cursor:'pointer', textAlign:'left', transition:'background 0.15s' }}
              onMouseEnter={e => { if(value!==key) e.currentTarget.style.background='rgba(255,255,255,0.07)' }}
              onMouseLeave={e => { if(value!==key) e.currentTarget.style.background='transparent' }}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']

function MiniCalendar() {
  const now = new Date()
  const [yr, setYr] = useState(now.getFullYear())
  const [mo, setMo] = useState(now.getMonth())
  const first = new Date(yr, mo, 1).getDay()
  const daysInMonth = new Date(yr, mo + 1, 0).getDate()
  const cells = Array.from({ length: first + daysInMonth }, (_,i) => i < first ? null : i - first + 1)
  const todayDate = now.getDate()
  const isCurrent = yr === now.getFullYear() && mo === now.getMonth()
  const prev = () => mo === 0 ? (setMo(11), setYr(y=>y-1)) : setMo(m=>m-1)
  const next = () => mo === 11 ? (setMo(0), setYr(y=>y+1)) : setMo(m=>m+1)

  return (
    <div style={{ padding:'0 2px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <button onClick={prev} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:16, lineHeight:1 }}>‹</button>
        <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.7)' }}>{MONTHS[mo].slice(0,3)} {yr}</span>
        <button onClick={next} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:16, lineHeight:1 }}>›</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:9, color:'rgba(255,255,255,0.3)', fontWeight:600, padding:'2px 0', letterSpacing:'0.05em' }}>{d}</div>)}
        {cells.map((d,i) => (
          <div key={i} style={{
            textAlign:'center', fontSize:11, padding:'5px 2px', borderRadius:8, cursor: d ? 'pointer' : 'default',
            background: d && isCurrent && d === todayDate ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: d ? (isCurrent && d === todayDate ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)') : 'transparent',
            fontWeight: d && isCurrent && d === todayDate ? 700 : 400,
            border: d && isCurrent && d === todayDate ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
          }}>{d ?? ''}</div>
        ))}
      </div>
    </div>
  )
}

// ─── Sidebar tasks ────────────────────────────────────────────────────────────

function SidebarTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [justDone, setJustDone] = useState<number | null>(null)
  const load = useCallback(async () => { const r = await fetch('/api/tasks'); setTasks(await r.json()) }, [])
  useEffect(() => { load() }, [load])

  const toggle = async (t: Task) => {
    if (!t.done) { setJustDone(t.id); setTimeout(() => setJustDone(null), 600) }
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
      <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Tasks</div>
      <div style={{ display:'flex', flexDirection:'column', gap:5, maxHeight:180, overflowY:'auto' }}>
        {tasks.map(t => (
          <div key={t.id} onClick={() => toggle(t)} style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer', padding:'4px 0', animation: justDone===t.id ? 'taskDone 0.5s ease' : undefined }}>
            <div style={{
              width:15, height:15, borderRadius:5, flexShrink:0,
              border: t.done ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
              background: t.done ? 'rgba(200,230,190,0.6)' : 'rgba(255,255,255,0.06)',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition: 'all 0.3s ease',
              boxShadow: justDone===t.id ? '0 0 12px rgba(200,230,190,0.8)' : 'none',
            }}>
              {t.done && <span style={{ color:'rgba(40,80,40,0.9)', fontSize:9, fontWeight:800 }}>✓</span>}
            </div>
            <span style={{ fontSize:12, color: t.done ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)', textDecoration: t.done ? 'line-through' : 'none', lineHeight:1.4, transition:'all 0.3s' }}>
              {t.title}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:7, marginTop:10 }}>
        <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Add task..." style={{ ...gInput, fontSize:11, padding:'7px 10px' }} />
        <button onClick={add} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:8, color:'rgba(255,255,255,0.8)', fontSize:13, fontWeight:700, padding:'0 12px', cursor:'pointer', flexShrink:0 }}>+</button>
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Page; label: string; icon: string; sub?: { id: string; label: string }[] }[] = [
  { id:'dashboard', label:'Dashboard',  icon:'⊞' },
  { id:'projects',  label:'Projects',   icon:'◈' },
  { id:'health',    label:'Health',     icon:'♡' },
  { id:'family',    label:'Family',     icon:'⌂', sub:[{id:'kids',label:'Kids'},{id:'wife',label:'Wife'},{id:'parents',label:'Parents'}] },
  { id:'friends',   label:'Friends',    icon:'◎' },
]

function Sidebar({ page, setPage, familySub, setFamilySub, tod }: {
  page: Page; setPage: (p: Page) => void; familySub: string; setFamilySub: (s: string) => void; tod: TimeOfDay
}) {
  const g = TOD_GREETING[tod]
  return (
    <div style={{
      width:260, minHeight:'100vh', flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto',
      background:'rgba(0,0,0,0.22)',
      backdropFilter:'blur(40px) saturate(180%)',
      WebkitBackdropFilter:'blur(40px) saturate(180%)',
      borderRight:'1px solid rgba(255,255,255,0.08)',
      display:'flex', flexDirection:'column',
    }}>
      {/* Branding */}
      <div style={{ padding:'28px 22px 20px' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'rgba(220,200,160,0.9)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:3 }}>Dr Muhammad Qasim</div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', letterSpacing:'0.05em' }}>Command Centre</div>
        <div style={{ marginTop:14, fontSize:13, color:'rgba(255,255,255,0.5)' }}>{g.emoji} {g.text}</div>
      </div>

      {/* Nav */}
      <nav style={{ padding:'0 12px', flex:1 }}>
        {NAV_ITEMS.map(item => {
          const active = page === item.id
          return (
            <div key={item.id}>
              <div
                onClick={() => setPage(item.id)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, cursor:'pointer', marginBottom:2, background: active ? 'rgba(255,255,255,0.12)' : 'transparent', color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.45)', transition:'all 0.2s', border: active ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent' }}
                onMouseEnter={e => { if(!active){e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.75)'} }}
                onMouseLeave={e => { if(!active){e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.45)'} }}
              >
                <span style={{ fontSize:14 }}>{item.icon}</span>
                <span style={{ fontSize:13, fontWeight: active ? 600 : 400 }}>{item.label}</span>
              </div>
              {item.sub && active && (
                <div style={{ paddingLeft:36, marginBottom:4 }}>
                  {item.sub.map(s => (
                    <div key={s.id} onClick={() => setFamilySub(s.id)}
                      style={{ fontSize:12, padding:'7px 10px', borderRadius:9, cursor:'pointer', color: familySub===s.id ? 'rgba(200,180,140,0.9)' : 'rgba(255,255,255,0.35)', background: familySub===s.id ? 'rgba(255,255,255,0.08)' : 'transparent', marginBottom:2, transition:'all 0.15s' }}
                    >{s.label}</div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'12px 20px' }} />

      <div style={{ padding:'0 18px 16px' }}>
        <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Calendar</div>
        <MiniCalendar />
      </div>

      <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'0 20px 12px' }} />

      <div style={{ padding:'0 18px 28px' }}>
        <SidebarTasks />
      </div>
    </div>
  )
}

// ─── Weather widget ───────────────────────────────────────────────────────────

const WX_EMOJI: Record<number, string> = { 0:'☀️',1:'🌤',2:'⛅',3:'☁️',45:'🌫',48:'🌫',51:'🌦',53:'🌧',55:'🌧',61:'🌧',63:'🌧',65:'🌧',71:'❄️',73:'❄️',75:'❄️',80:'🌦',81:'🌧',82:'⛈',95:'⛈' }
const WX_DESC: Record<number, string> = { 0:'Clear',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',51:'Drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',71:'Light snow',80:'Showers',95:'Thunderstorm' }

function WeatherWidget() {
  const [wx, setWx] = useState<{ temp:number; code:number; wind:number; city:string } | null>(null)
  useEffect(() => {
    const load = (lat: number, lon: number, city: string) =>
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`)
        .then(r => r.json()).then(d => setWx({ temp:Math.round(d.current.temperature_2m), code:d.current.weather_code, wind:Math.round(d.current.wind_speed_10m), city }))
    navigator.geolocation?.getCurrentPosition(
      p => load(p.coords.latitude, p.coords.longitude, 'Your location'),
      () => load(51.5, -0.12, 'London')
    )
  }, [])

  return (
    <Glass float style={{ padding:22 }}>
      <SHead icon="🌤">Weather</SHead>
      {wx ? (
        <>
          <div style={{ fontSize:48, lineHeight:1, marginBottom:8, animation:'cardFloat 9s ease-in-out infinite' }}>{WX_EMOJI[wx.code] ?? '🌡'}</div>
          <div style={{ fontSize:36, fontWeight:300, color:'rgba(255,255,255,0.95)', letterSpacing:'-0.02em' }}>{wx.temp}°</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.55)', marginTop:4 }}>{WX_DESC[wx.code] ?? ''}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:8 }}>💨 {wx.wind} km/h · {wx.city}</div>
        </>
      ) : <div style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>Fetching...</div>}
    </Glass>
  )
}

// ─── World clock ──────────────────────────────────────────────────────────────

const CLOCKS = [
  { city:'London',   tz:'Europe/London',   flag:'🇬🇧' },
  { city:'Dubai',    tz:'Asia/Dubai',       flag:'🇦🇪' },
  { city:'New York', tz:'America/New_York', flag:'🇺🇸' },
  { city:'Lahore',   tz:'Asia/Karachi',     flag:'🇵🇰' },
]

function ClockWidget() {
  const [, setTick] = useState(0)
  useEffect(() => { const id = setInterval(() => setTick(t=>t+1), 1000); return () => clearInterval(id) }, [])
  const fmt = (tz: string) => new Date().toLocaleTimeString('en-GB', { timeZone:tz, hour:'2-digit', minute:'2-digit' })

  return (
    <Glass float style={{ padding:22 }}>
      <SHead icon="🕰">World Clock</SHead>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {CLOCKS.map(c => (
          <div key={c.city} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:14 }}>{c.flag}</span>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{c.city}</span>
            </div>
            <span style={{ fontSize:16, fontWeight:300, color:'rgba(255,255,255,0.9)', fontVariantNumeric:'tabular-nums', letterSpacing:'0.02em' }}>{fmt(c.tz)}</span>
          </div>
        ))}
      </div>
    </Glass>
  )
}

// ─── Stray Reflections ────────────────────────────────────────────────────────

function ReflectionsWidget() {
  const [items, setItems] = useState<Reflection[]>([])
  const [text, setText] = useState('')
  const load = useCallback(async () => { const r = await fetch('/api/reflections'); setItems(await r.json()) }, [])
  useEffect(() => { load() }, [load])

  const save = async () => {
    if (!text.trim()) return
    await fetch('/api/reflections', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ content:text.trim() }) })
    setText(''); load()
  }
  const del = async (id: number) => {
    await fetch('/api/reflections', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id }) })
    load()
  }

  return (
    <Glass style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
      <SHead icon="✦">Stray Reflections</SHead>
      <div style={{ display:'flex', gap:8 }}>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="A thought, observation, or idea..." rows={2}
          style={{ ...gInput, resize:'none', flex:1, lineHeight:1.6 }}
          onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); save() } }}
        />
        <button onClick={save} style={{ background:'rgba(220,200,160,0.2)', border:'1px solid rgba(220,200,160,0.3)', borderRadius:10, color:'rgba(220,200,160,0.9)', fontWeight:700, fontSize:14, padding:'0 16px', cursor:'pointer', flexShrink:0 }}>↑</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:220, overflowY:'auto' }}>
        {items.map((r,i) => (
          <div key={r.id} style={{ background:'rgba(255,255,255,0.05)', borderRadius:14, padding:'12px 14px', borderLeft:'2px solid rgba(220,200,160,0.3)', position:'relative', animation:`fadeUp 0.3s ease both`, animationDelay:`${i*0.05}s` }}>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.8)', lineHeight:1.6 }}>{r.content}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:6 }}>{new Date(r.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
            <button onClick={()=>del(r.id)} style={{ position:'absolute', top:8, right:8, background:'none', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:13 }}>✕</button>
          </div>
        ))}
        {items.length===0 && <div style={{ color:'rgba(255,255,255,0.2)', fontSize:12, textAlign:'center', padding:'16px 0' }}>No reflections yet</div>}
      </div>
    </Glass>
  )
}

// ─── Projects summary widget ──────────────────────────────────────────────────

const CAT_C: Record<string, { border: string; bg: string; text: string }> = {
  Clinical:       { border:'#7ac9a0', bg:'rgba(120,200,150,0.2)', text:'rgba(180,240,200,0.9)' },
  Academic:       { border:'#7ab0e8', bg:'rgba(100,160,230,0.2)', text:'rgba(160,200,240,0.9)' },
  Entrepreneurial:{ border:'#b09adf', bg:'rgba(160,140,220,0.2)', text:'rgba(200,180,240,0.9)' },
  Career:         { border:'#e8c070', bg:'rgba(220,180,80,0.2)',  text:'rgba(240,210,140,0.9)' },
}
const STATUS_C: Record<string, { bg: string; text: string }> = {
  'In progress':{ bg:'rgba(120,200,150,0.2)', text:'rgba(180,240,200,0.9)' },
  'Not started':{ bg:'rgba(255,255,255,0.08)', text:'rgba(255,255,255,0.5)' },
  'On hold':    { bg:'rgba(220,180,80,0.15)', text:'rgba(240,210,140,0.9)' },
  'Complete':   { bg:'rgba(100,160,230,0.2)', text:'rgba(160,200,240,0.9)' },
}
const STATUSES = ['Not started','In progress','On hold','Complete']

function ProjectsWidget({ projects, onOpen }: { projects: Project[]; onOpen: () => void }) {
  const active = projects.filter(p => p.status === 'In progress')
  return (
    <Glass style={{ padding:22 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <SHead icon="◈">Projects</SHead>
        <button onClick={onOpen} style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:10, color:'rgba(255,255,255,0.7)', fontSize:11, fontWeight:600, padding:'5px 14px', cursor:'pointer', marginTop:-16 }}>View all →</button>
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:18 }}>
        {[
          { label:'Total',    val:projects.length,                    c:'rgba(255,255,255,0.5)' },
          { label:'Active',   val:active.length,                      c:'rgba(180,240,200,0.8)' },
          { label:'Blockers', val:projects.filter(p=>p.block).length, c:'rgba(240,160,140,0.8)' },
          { label:'Deadlines',val:projects.filter(p=>p.dl).length,    c:'rgba(240,210,140,0.8)' },
        ].map(s => (
          <div key={s.label} style={{ flex:1, background:'rgba(255,255,255,0.06)', borderRadius:14, padding:'12px 0', textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:300, color:s.c, letterSpacing:'-0.02em' }}>{s.val}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:3, letterSpacing:'0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {active.slice(0,4).map(p => {
          const cc = CAT_C[p.cat] ?? CAT_C.Clinical
          return (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'rgba(255,255,255,0.05)', borderRadius:14, borderLeft:`3px solid ${cc.border}` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.85)' }}>{p.title}</div>
                {p.next && <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{p.next}</div>}
              </div>
              <span style={{ fontSize:10, background:cc.bg, color:cc.text, padding:'3px 9px', borderRadius:99, fontWeight:600 }}>{p.cat}</span>
            </div>
          )
        })}
      </div>
    </Glass>
  )
}

// ─── Health widget ────────────────────────────────────────────────────────────

function HealthWidget() {
  return (
    <Glass style={{ padding:22 }}>
      <SHead icon="♡">Health</SHead>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
        {[
          { icon:'🔥', label:'Calories', c:'rgba(240,180,100,0.8)' },
          { icon:'❤️', label:'Heart Rate', c:'rgba(240,130,130,0.8)' },
          { icon:'👟', label:'Steps', c:'rgba(140,210,160,0.8)' },
          { icon:'😴', label:'Sleep', c:'rgba(170,160,220,0.8)' },
        ].map(m => (
          <div key={m.label} style={{ background:'rgba(255,255,255,0.06)', borderRadius:14, padding:'14px 12px', textAlign:'center' }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{m.icon}</div>
            <div style={{ fontSize:20, fontWeight:300, color:m.c }}>—</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:3 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, padding:'12px 14px' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(240,160,140,0.8)', marginBottom:4 }}>Connect Apple Watch</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', lineHeight:1.7 }}>Use iOS Shortcuts to POST HealthKit data to the <code style={{ background:'rgba(255,255,255,0.1)', padding:'1px 5px', borderRadius:4, fontSize:10 }}>/api/health</code> endpoint.</div>
      </div>
    </Glass>
  )
}

// ─── Family widget ────────────────────────────────────────────────────────────

function FamilyWidget({ onOpen }: { onOpen: () => void }) {
  return (
    <Glass style={{ padding:22 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <SHead icon="⌂">Family</SHead>
        <button onClick={onOpen} style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:10, color:'rgba(255,255,255,0.7)', fontSize:11, fontWeight:600, padding:'5px 14px', cursor:'pointer', marginTop:-16 }}>Open →</button>
      </div>
      {[{label:'Kids',icon:'🧒'},{label:'Wife',icon:'💑'},{label:'Parents',icon:'👴'}].map(s => (
        <div key={s.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 12px', background:'rgba(255,255,255,0.05)', borderRadius:14, marginBottom:8 }}>
          <span style={{ fontSize:20 }}>{s.icon}</span>
          <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)', fontWeight:400 }}>{s.label}</span>
        </div>
      ))}
    </Glass>
  )
}

// ─── News widget ──────────────────────────────────────────────────────────────

function NewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/news').then(r=>r.json()).then(d=>{setNews(d);setLoading(false)}) }, [])

  return (
    <Glass style={{ padding:22 }}>
      <SHead icon="📰">News · BBC</SHead>
      {loading && <div style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>Loading...</div>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
        {news.map((n,i) => (
          <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', display:'block', background:'rgba(255,255,255,0.05)', borderRadius:14, padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,0.1)', transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.transform='translateY(0)'}}>
            <div style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.85)', lineHeight:1.5, marginBottom:6 }}>{n.title}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.5 }}>{n.description}</div>
            {n.pubDate && <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginTop:8 }}>{new Date(n.pubDate).toLocaleDateString('en-GB')}</div>}
          </a>
        ))}
      </div>
    </Glass>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ projects, setPage }: { projects: Project[]; setPage: (p: Page) => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 2fr', gap:16 }}>
        <WeatherWidget />
        <ClockWidget />
        <ReflectionsWidget />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:16 }}>
        <ProjectsWidget projects={projects} onOpen={() => setPage('projects')} />
        <HealthWidget />
        <FamilyWidget onOpen={() => setPage('family')} />
      </div>
      <NewsWidget />
    </div>
  )
}

// ─── Full Projects page ───────────────────────────────────────────────────────

function Chip({ label, bg, text }: { label:string; bg:string; text:string }) {
  return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:600, background:bg, color:text }}>{label}</span>
}

function ProjectModal({ project, onClose, onSave, onDelete }: { project:Project|null; onClose:()=>void; onSave:(p:Project)=>Promise<void>; onDelete:(id:number)=>Promise<void> }) {
  const [form, setForm] = useState<Project|null>(null)
  const [newPhase, setNewPhase] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { setForm(project ? { ...project, phases:[...project.phases], log:[...project.log] } : null) }, [project])
  if (!form) return null

  const set = (k: keyof Project, v: any) => setForm(f => f ? { ...f, [k]:v } : f)
  const addPhase = () => { if(!newPhase.trim()) return; set('phases',[...form.phases,newPhase.trim()]); setNewPhase('') }
  const removePhase = (i:number) => { const p=form.phases.filter((_,j)=>j!==i); set('phases',p); if(form.cp>=p.length) set('cp',Math.max(0,p.length-1)) }
  const movePhase = (i:number,dir:-1|1) => { const p=[...form.phases]; const j=i+dir; if(j<0||j>=p.length) return; [p[i],p[j]]=[p[j],p[i]]; set('phases',p) }
  const handleSave = async () => { if(!form) return; setSaving(true); await onSave(form); setSaving(false); onClose() }
  const handleDelete = async () => { if(!form||!confirm('Delete?')) return; await onDelete(form.id); onClose() }

  const mInput: React.CSSProperties = { width:'100%', padding:'8px 10px', border:'1px solid #e4e4e7', borderRadius:8, fontSize:14, color:'#18181b', background:'#fafafa', boxSizing:'border-box' }
  const F = ({ label, children }: { label:string; children:React.ReactNode }) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#71717a', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</label>
      {children}
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:16 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:620, maxHeight:'90vh', overflowY:'auto', padding:30 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>{form.id?'Edit Project':'New Project'}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#71717a' }}>✕</button>
        </div>
        <F label="Title"><input value={form.title} onChange={e=>set('title',e.target.value)} style={mInput} /></F>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <F label="Category"><select value={form.cat} onChange={e=>set('cat',e.target.value)} style={mInput}>{['Clinical','Academic','Entrepreneurial','Career'].map(c=><option key={c}>{c}</option>)}</select></F>
          <F label="Status"><select value={form.status} onChange={e=>set('status',e.target.value)} style={mInput}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></F>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <F label="Deadline"><input value={form.dl} onChange={e=>set('dl',e.target.value)} style={mInput} placeholder="e.g. 30 Sep 2026" /></F>
          <F label="Assigned to"><input value={form.who} onChange={e=>set('who',e.target.value)} style={mInput} /></F>
        </div>
        <F label="Next step"><input value={form.next} onChange={e=>set('next',e.target.value)} style={mInput} /></F>
        <F label="Last action"><input value={form.last} onChange={e=>set('last',e.target.value)} style={mInput} /></F>
        <F label="Blocker"><input value={form.block} onChange={e=>set('block',e.target.value)} style={mInput} /></F>
        <F label="Phases">
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {form.phases.map((p,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ flex:1, fontSize:13 }}>{p}</span>
                <button onClick={()=>movePhase(i,-1)} style={{ background:'none', border:'1px solid #e4e4e7', borderRadius:5, padding:'2px 7px', cursor:'pointer', fontSize:11 }}>↑</button>
                <button onClick={()=>movePhase(i,1)} style={{ background:'none', border:'1px solid #e4e4e7', borderRadius:5, padding:'2px 7px', cursor:'pointer', fontSize:11 }}>↓</button>
                <button onClick={()=>removePhase(i)} style={{ background:'none', border:'1px solid #e4e4e7', borderRadius:5, padding:'2px 7px', cursor:'pointer', fontSize:11, color:'#ef4444' }}>✕</button>
              </div>
            ))}
            <div style={{ display:'flex', gap:6, marginTop:4 }}>
              <input value={newPhase} onChange={e=>setNewPhase(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addPhase()} placeholder="Add phase..." style={{ ...mInput, flex:1 }} />
              <button onClick={addPhase} style={{ background:'#f4f4f5', border:'1px solid #e4e4e7', borderRadius:7, padding:'6px 14px', cursor:'pointer', fontSize:13 }}>Add</button>
            </div>
          </div>
        </F>
        <F label={`Current phase (${form.cp+1}/${form.phases.length||1})`}>
          <input type="range" min={0} max={Math.max(0,form.phases.length-1)} value={form.cp} onChange={e=>set('cp',Number(e.target.value))} style={{ width:'100%' }} />
          <div style={{ fontSize:12, color:'#71717a' }}>{form.phases[form.cp]??'None'}</div>
        </F>
        {form.log.length>0 && (
          <F label="Activity log">
            <div style={{ maxHeight:110, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
              {[...form.log].reverse().map((e,i)=>(
                <div key={i} style={{ fontSize:12, color:'#52525b', borderLeft:'2px solid #e4e4e7', paddingLeft:8 }}>
                  <span style={{ fontWeight:600 }}>{e.d}</span> — {e.n}
                </div>
              ))}
            </div>
          </F>
        )}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:20 }}>
          {form.id ? <button onClick={handleDelete} style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:8, padding:'8px 16px', cursor:'pointer', fontWeight:600, fontSize:14 }}>Delete</button> : <div />}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose} style={{ background:'#f4f4f5', border:'none', borderRadius:8, padding:'8px 16px', cursor:'pointer', fontSize:14 }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ background:'#059669', color:'#fff', border:'none', borderRadius:8, padding:'8px 20px', cursor:'pointer', fontWeight:600, fontSize:14, opacity:saving?0.7:1 }}>{saving?'Saving...':'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function todayStr() { const d=new Date(); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}` }

function ProjectsPage({ projects, reload }: { projects:Project[]; reload:()=>Promise<void> }) {
  const [cat, setCat] = useState('All')
  const [view, setView] = useState<'board'|'list'>('board')
  const [selected, setSelected] = useState<Project|null>(null)
  const filtered = projects.filter(p=>cat==='All'||p.cat===cat)
  const CATS = ['All','Clinical','Academic','Entrepreneurial','Career']

  const handleSave = async (form: Project) => {
    const prevLast = projects.find(p=>p.id===form.id)?.last??''
    let log = form.log
    if (form.last && form.last!==prevLast) log = [...form.log, { d:todayStr(), n:form.last }]
    const payload = { ...form, log }
    if (form.id) {
      await fetch('/api/projects', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
    } else {
      const { id:_, ...body } = payload
      await fetch('/api/projects', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    }
    await reload()
  }
  const handleDelete = async (id:number) => {
    await fetch('/api/projects', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id }) })
    await reload()
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:300, color:'rgba(255,255,255,0.9)', letterSpacing:'-0.02em' }}>Projects</h1>
        <button onClick={()=>setSelected({ id:0,title:'',cat:'Clinical',status:'Not started',phases:[],cp:0,next:'',last:'',dl:'',who:'',block:'',log:[] })}
          style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, color:'rgba(255,255,255,0.85)', fontSize:13, fontWeight:600, padding:'9px 20px', cursor:'pointer', backdropFilter:'blur(20px)' }}>
          + New project
        </button>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', gap:6 }}>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{ padding:'7px 16px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:600, fontSize:12, background:cat===c?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.07)', color:cat===c?'rgba(255,255,255,0.95)':'rgba(255,255,255,0.45)', backdropFilter:'blur(20px)' }}>{c}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.07)', borderRadius:10, padding:3, backdropFilter:'blur(20px)' }}>
          {(['board','list'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'5px 16px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, fontSize:12, textTransform:'capitalize', background:view===v?'rgba(255,255,255,0.15)':'transparent', color:view===v?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.4)' }}>{v}</button>
          ))}
        </div>
      </div>

      {view==='board' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, alignItems:'start' }}>
          {STATUSES.map(s=>{
            const sc = STATUS_C[s]
            const items = filtered.filter(p=>p.status===s)
            return (
              <div key={s}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <Chip label={s} bg={sc.bg} text={sc.text} />
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:600 }}>{items.length}</span>
                </div>
                {items.map(p=>{
                  const cc = CAT_C[p.cat]??CAT_C.Clinical
                  return (
                    <div key={p.id} onClick={()=>setSelected(p)}
                      style={{ background:'rgba(255,255,255,0.07)', backdropFilter:'blur(20px)', borderRadius:16, padding:14, borderLeft:`3px solid ${cc.border}`, marginBottom:10, cursor:'pointer', transition:'all 0.2s', border:`1px solid rgba(255,255,255,0.1)`, borderLeftColor:cc.border, borderLeftWidth:3 }}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.11)'; e.currentTarget.style.transform='translateY(-2px)'}}
                      onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.transform='translateY(0)'}}>
                      <div style={{ fontWeight:500, fontSize:13, color:'rgba(255,255,255,0.85)', marginBottom:4 }}>{p.title}</div>
                      {p.next&&<div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontStyle:'italic' }}>↗ {p.next}</div>}
                      {p.dl&&<div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:6 }}>📅 {p.dl}</div>}
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
            const cc = CAT_C[p.cat]??CAT_C.Clinical
            const sc = STATUS_C[p.status]??STATUS_C['Not started']
            return (
              <div key={p.id} onClick={()=>setSelected(p)}
                style={{ background:'rgba(255,255,255,0.07)', backdropFilter:'blur(20px)', borderRadius:16, padding:'14px 18px', borderLeft:`3px solid ${cc.border}`, cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'all 0.2s', border:`1px solid rgba(255,255,255,0.1)`, borderLeftColor:cc.border, borderLeftWidth:3 }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.11)'; e.currentTarget.style.transform='translateY(-1px)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.transform='translateY(0)'}}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:500, fontSize:14, color:'rgba(255,255,255,0.85)' }}>{p.title}</div>
                  {p.next&&<div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{p.next}</div>}
                </div>
                <Chip label={p.cat} bg={cc.bg} text={cc.text} />
                <Chip label={p.status} bg={sc.bg} text={sc.text} />
                {p.dl&&<span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>📅 {p.dl}</span>}
              </div>
            )
          })}
        </div>
      )}

      {selected && <ProjectModal project={selected} onClose={()=>setSelected(null)} onSave={handleSave} onDelete={handleDelete} />}
    </div>
  )
}

// ─── Health, Family, Friends pages ───────────────────────────────────────────

function HealthPage() {
  return (
    <div>
      <h1 style={{ margin:'0 0 24px', fontSize:22, fontWeight:300, color:'rgba(255,255,255,0.9)' }}>Health</h1>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {[{icon:'🔥',label:'Active Calories',unit:'kcal',c:'rgba(240,180,100,0.85)'},{icon:'❤️',label:'Heart Rate',unit:'bpm',c:'rgba(240,130,130,0.85)'},{icon:'👟',label:'Steps',unit:'today',c:'rgba(140,210,160,0.85)'},{icon:'😴',label:'Sleep',unit:'hrs',c:'rgba(170,160,220,0.85)'}].map(m=>(
          <Glass key={m.label} style={{ padding:20, textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:10 }}>{m.icon}</div>
            <div style={{ fontSize:32, fontWeight:300, color:m.c }}>—</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginTop:4 }}>{m.label}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)' }}>{m.unit}</div>
          </Glass>
        ))}
      </div>
      <Glass style={{ padding:24 }}>
        <div style={{ fontSize:15, fontWeight:500, color:'rgba(240,160,140,0.9)', marginBottom:12 }}>Connect Apple Watch</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.9 }}>
          Apple HealthKit cannot be accessed directly by a web app. To stream your metrics here:<br />
          1. Create an <strong style={{color:'rgba(255,255,255,0.7)'}}>Apple Shortcut</strong> that runs daily or on iPhone unlock.<br />
          2. Use "Get Health Samples" to read Calories, Heart Rate, Steps, Sleep.<br />
          3. Use "Get Contents of URL" to POST the data to <code style={{ background:'rgba(255,255,255,0.1)', padding:'2px 7px', borderRadius:5, fontSize:12 }}>/api/health</code>.<br />
          4. The metrics above will populate automatically once connected.
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
  const subs = [{id:'kids',label:'Kids',icon:'🧒'},{id:'wife',label:'Wife',icon:'💑'},{id:'parents',label:'Parents',icon:'👴'}]
  const cur = subs.find(s=>s.id===sub)
  const memberNotes = notes.filter(n=>n.member===sub)
  const add = async () => { if(!text.trim()) return; await fetch('/api/family',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({member:sub,content:text.trim()})}); setText(''); load() }
  const del = async (id:number) => { await fetch('/api/family',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); load() }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:300, color:'rgba(255,255,255,0.9)' }}>Family</h1>
        <div style={{ display:'flex', gap:6 }}>
          {subs.map(s=>(
            <button key={s.id} onClick={()=>setSub(s.id)} style={{ padding:'7px 18px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:600, fontSize:12, background:sub===s.id?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.07)', color:sub===s.id?'rgba(255,255,255,0.95)':'rgba(255,255,255,0.45)', backdropFilter:'blur(20px)' }}>{s.icon} {s.label}</button>
          ))}
        </div>
      </div>
      <Glass style={{ padding:24 }}>
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`Add a note about ${cur?.label}...`} rows={2} style={{ ...gInput, flex:1, resize:'none', lineHeight:1.6 }} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();add()}}} />
          <button onClick={add} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, color:'rgba(255,255,255,0.85)', fontWeight:600, fontSize:13, padding:'0 20px', cursor:'pointer' }}>Add</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {memberNotes.map(n=>(
            <div key={n.id} style={{ background:'rgba(255,255,255,0.05)', borderRadius:14, padding:'14px 16px', borderLeft:'2px solid rgba(255,255,255,0.15)', position:'relative' }}>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.8)', lineHeight:1.6 }}>{n.content}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:6 }}>{new Date(n.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
              <button onClick={()=>del(n.id)} style={{ position:'absolute', top:10, right:10, background:'none', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:13 }}>✕</button>
            </div>
          ))}
          {memberNotes.length===0 && <div style={{ color:'rgba(255,255,255,0.2)', fontSize:13, textAlign:'center', padding:'24px 0' }}>No notes for {cur?.label} yet</div>}
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
      <h1 style={{ margin:'0 0 24px', fontSize:22, fontWeight:300, color:'rgba(255,255,255,0.9)' }}>Friends</h1>
      <Glass style={{ padding:24, marginBottom:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr auto', gap:10, marginBottom: names.length?16:0 }}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" style={gInput} />
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Note..." style={gInput} onKeyDown={e=>e.key==='Enter'&&add()} />
          <button onClick={add} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, color:'rgba(255,255,255,0.85)', fontWeight:600, fontSize:13, padding:'0 22px', cursor:'pointer' }}>Add</button>
        </div>
        {names.length>0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <button onClick={()=>setFilter('')} style={{ padding:'5px 14px', borderRadius:16, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, background:filter===''?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.07)', color:filter===''?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.45)', backdropFilter:'blur(20px)' }}>All</button>
            {names.map(n=>(
              <button key={n} onClick={()=>setFilter(n)} style={{ padding:'5px 14px', borderRadius:16, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, background:filter===n?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.07)', color:filter===n?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.45)', backdropFilter:'blur(20px)' }}>{n}</button>
            ))}
          </div>
        )}
      </Glass>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.map(n=>(
          <Glass key={n.id} style={{ padding:'14px 18px', position:'relative' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(220,200,160,0.8)', marginBottom:4 }}>{n.name}</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.75)', lineHeight:1.6 }}>{n.content}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:6 }}>{new Date(n.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
            <button onClick={()=>del(n.id)} style={{ position:'absolute', top:12, right:14, background:'none', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:13 }}>✕</button>
          </Glass>
        ))}
        {filtered.length===0 && <div style={{ color:'rgba(255,255,255,0.2)', fontSize:13, textAlign:'center', padding:'28px 0' }}>No entries yet</div>}
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function CommandCentre() {
  const [page, setPage] = useState<Page>('dashboard')
  const [familySub, setFamilySub] = useState('kids')
  const [projects, setProjects] = useState<Project[]>([])
  const [tod] = useState<TimeOfDay>(getTOD)
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
      <AmbientBackground landscape={landscape} tod={tod} />
      <div style={{ position:'relative', zIndex:1, display:'flex', minHeight:'100vh' }}>
        <Sidebar page={page} setPage={handleSetPage} familySub={familySub} setFamilySub={setFamilySub} tod={tod} />
        <main style={{ flex:1, padding:28, overflowY:'auto', minWidth:0 }}>
          {/* Landscape selector */}
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
            <LandscapeSelector value={landscape} onChange={changeLandscape} />
          </div>
          {page==='dashboard' && <Dashboard projects={projects} setPage={handleSetPage} />}
          {page==='projects'  && <ProjectsPage projects={projects} reload={loadProjects} />}
          {page==='health'    && <HealthPage />}
          {page==='family'    && <FamilyPage sub={familySub} setSub={setFamilySub} />}
          {page==='friends'   && <FriendsPage />}
        </main>
      </div>
    </>
  )
}
