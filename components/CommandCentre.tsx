'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  LayoutGrid, Layers, Heart, Home, Users, Sun, Cloud, CloudRain, CloudSnow,
  CloudLightning, CloudFog, Wind, Clock, Feather, Newspaper, Calendar,
  Target, Plus, X, ArrowUpRight, Check, ChevronLeft, ChevronRight,
  Moon, Flame, Activity, BookOpen, Link2, FlaskConical, Landmark, TrendingUp,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Project    = { id: number; title: string; cat: string; status: string; phases: string[]; cp: number; next: string; last: string; dl: string; who: string; block: string; notes: string; log: { d: string; n: string }[] }
type Reflection = { id: number; content: string; created_at: string }
type Task       = { id: number; title: string; done: boolean; due_date: string }
type FamilyNote = { id: number; member: string; content: string; created_at: string }
type FriendNote = { id: number; name: string; content: string; created_at: string }
type Resource   = { id: number; title: string; url: string; category: string; note: string; created_at: string }
type NewsItem   = { title: string; link: string; pubDate: string; description: string }
type NewsData   = { research: NewsItem[]; politics: NewsItem[]; finance: NewsItem[] }
type Page       = 'dashboard' | 'projects' | 'health' | 'family' | 'friends' | 'resources'

// ─── Typography ───────────────────────────────────────────────────────────────

const DISPLAY = 'var(--font-display), Georgia, serif'
const GROTESK = 'var(--font-grotesk), var(--font-sans), sans-serif'

const T = {
  display: { fontFamily: DISPLAY, fontSize: 58, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.0 } as React.CSSProperties,
  h1:      { fontFamily: DISPLAY, fontSize: 36, fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1.15 } as React.CSSProperties,
  h2:      { fontFamily: DISPLAY, fontSize: 23, fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.3 } as React.CSSProperties,
  h3:      { fontSize: 15.5, fontWeight: 550, letterSpacing: '-0.005em', lineHeight: 1.4 } as React.CSSProperties,
  body:    { fontSize: 14, fontWeight: 400, lineHeight: 1.65 } as React.CSSProperties,
  sm:      { fontSize: 12, fontWeight: 400, letterSpacing: '0.005em', lineHeight: 1.5 } as React.CSSProperties,
  label:   { fontFamily: GROTESK, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' as const, lineHeight: 1.4 } as React.CSSProperties,
  num:     { fontFamily: GROTESK, fontVariantNumeric: 'tabular-nums' } as React.CSSProperties,
}

const C = {
  text:      'rgba(245,246,255,0.94)',
  textSub:   'rgba(220,224,245,0.66)',
  textMuted: 'rgba(200,206,235,0.38)',
  gold:      'rgba(255,216,160,0.92)',
  aurora:    'rgba(150,168,255,0.92)',
  border:    'rgba(160,175,255,0.13)',
  borderHov: 'rgba(180,195,255,0.30)',
}

// ─── Keyframes ────────────────────────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes drift     { 0%,100%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(18px,-26px) rotate(3deg)} }
  @keyframes drift2    { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-24px,18px)} }
  @keyframes orbitMoon { from{transform:rotate(0deg) translateX(86px) rotate(0deg)} to{transform:rotate(360deg) translateX(86px) rotate(-360deg)} }
  @keyframes spinSlow  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes pulseGlow { 0%,100%{opacity:0.55} 50%{opacity:1} }
  @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes breathe   { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.12);opacity:0.18} }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes taskPop   { 0%{transform:scale(1)} 40%{transform:scale(1.35)} 100%{transform:scale(1)} }
  @keyframes focusIn   { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes shimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes nebulaSh  { 0%,100%{opacity:0.55;transform:scale(1)} 50%{opacity:0.85;transform:scale(1.08)} }
`

// ─── Space canvas: parallax starfield + spiral galaxy + shooting stars ───────

function SpaceCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    let w = 0, h = 0, raf = 0
    const mouse = { x: 0.5, y: 0.5 }
    const resize = () => { w = cv.width = window.innerWidth; h = cv.height = window.innerHeight }
    resize()
    const onResize = () => resize()
    const onMove = (e: MouseEvent) => { mouse.x = e.clientX / w; mouse.y = e.clientY / h }
    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMove)

    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random(), y: Math.random(),
      z: Math.random() * 0.85 + 0.15,
      r: Math.random() * 1.3 + 0.3,
      tw: Math.random() * Math.PI * 2,
      ts: 0.4 + Math.random() * 1.8,
      hue: Math.random(),
    }))

    // spiral galaxy particles, 3 arms
    const gal = Array.from({ length: 520 }, (_, i) => {
      const arm = i % 3
      const t = Math.pow(Math.random(), 0.7) * 5 + 0.3
      return {
        t,
        a: t * 1.85 + arm * (Math.PI * 2 / 3),
        rad: t * 27,
        sx: (Math.random() - 0.5) * (10 + t * 5),
        sy: (Math.random() - 0.5) * (6 + t * 3),
        br: 0.3 + Math.random() * 0.7,
      }
    })
    let galRot = 0

    type Shoot = { x: number; y: number; vx: number; vy: number; life: number }
    const shooting: Shoot[] = []

    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      ctx.clearRect(0, 0, w, h)
      const mx = mouse.x - 0.5, my = mouse.y - 0.5

      // stars (3 parallax depths via z)
      for (const s of stars) {
        s.tw += s.ts * dt
        const op = (0.30 + 0.55 * Math.abs(Math.sin(s.tw))) * s.z
        const px = ((s.x * w - mx * 46 * s.z) % w + w) % w
        const py = ((s.y * h - my * 46 * s.z) % h + h) % h
        ctx.globalAlpha = op
        ctx.fillStyle = s.hue < 0.12 ? '#ffd9a8' : s.hue < 0.24 ? '#aebbff' : '#ffffff'
        ctx.beginPath(); ctx.arc(px, py, s.r * s.z, 0, 7); ctx.fill()
      }

      // spiral galaxy, upper right, counter-parallax
      galRot += dt * 0.045
      const gx = w * 0.80 - mx * -34, gy = h * 0.22 - my * -34
      for (const p of gal) {
        const a = p.a + galRot
        const px = gx + Math.cos(a) * p.rad + p.sx
        const py = gy + Math.sin(a) * p.rad * 0.42 + p.sy
        ctx.globalAlpha = Math.max(0.06, (0.55 - p.t * 0.085)) * p.br
        ctx.fillStyle = p.t < 1.3 ? '#ffeccb' : p.t < 3 ? '#cdd6ff' : '#8fa0f0'
        ctx.beginPath(); ctx.arc(px, py, p.t < 1 ? 1.5 : 0.9, 0, 7); ctx.fill()
      }
      const core = ctx.createRadialGradient(gx, gy, 0, gx, gy, 46)
      core.addColorStop(0, 'rgba(255,238,205,0.55)')
      core.addColorStop(0.45, 'rgba(220,200,255,0.14)')
      core.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.globalAlpha = 1
      ctx.fillStyle = core
      ctx.fillRect(gx - 46, gy - 46, 92, 92)

      // shooting stars
      if (Math.random() < dt * 0.14) {
        shooting.push({ x: Math.random() * w * 0.9 + w * 0.1, y: Math.random() * h * 0.35, vx: -(380 + Math.random() * 320), vy: 150 + Math.random() * 120, life: 1 })
      }
      for (let i = shooting.length - 1; i >= 0; i--) {
        const s = shooting[i]
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt * 1.1
        if (s.life <= 0) { shooting.splice(i, 1); continue }
        const tail = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 0.16, s.y - s.vy * 0.16)
        tail.addColorStop(0, `rgba(255,255,255,${0.85 * s.life})`)
        tail.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.globalAlpha = 1
        ctx.strokeStyle = tail
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - s.vx * 0.16, s.y - s.vy * 0.16)
        ctx.stroke()
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
}

// ─── Planets (SVG, drifting) ──────────────────────────────────────────────────

function Planets() {
  return (
    <>
      {/* Ringed planet, lower left */}
      <div style={{ position: 'absolute', left: '4%', bottom: '8%', animation: 'drift 38s ease-in-out infinite', opacity: 0.85 }}>
        <svg width="220" height="160" viewBox="0 0 220 160">
          <defs>
            <radialGradient id="pl1" cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#e8c9a0"/>
              <stop offset="55%" stopColor="#a8825e"/>
              <stop offset="100%" stopColor="#2e1f14"/>
            </radialGradient>
            <linearGradient id="ring1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(230,210,180,0)"/>
              <stop offset="30%" stopColor="rgba(230,210,180,0.7)"/>
              <stop offset="70%" stopColor="rgba(190,170,220,0.55)"/>
              <stop offset="100%" stopColor="rgba(230,210,180,0)"/>
            </linearGradient>
          </defs>
          <ellipse cx="110" cy="82" rx="100" ry="26" fill="none" stroke="url(#ring1)" strokeWidth="7" transform="rotate(-16 110 82)"/>
          <circle cx="110" cy="80" r="46" fill="url(#pl1)"/>
          <ellipse cx="110" cy="82" rx="100" ry="26" fill="none" stroke="url(#ring1)" strokeWidth="3.5" opacity="0.5" transform="rotate(-16 110 82)" clipPath="inset(0 0 50% 0)"/>
        </svg>
      </div>
      {/* Blue planet + orbiting moon, mid right */}
      <div style={{ position: 'absolute', right: '10%', top: '46%', animation: 'drift2 46s ease-in-out infinite', opacity: 0.7 }}>
        <div style={{ position: 'relative', width: 90, height: 90 }}>
          <svg width="90" height="90" viewBox="0 0 90 90">
            <defs>
              <radialGradient id="pl2" cx="36%" cy="30%" r="78%">
                <stop offset="0%" stopColor="#b8d4ff"/>
                <stop offset="55%" stopColor="#4a6bc8"/>
                <stop offset="100%" stopColor="#101a3e"/>
              </radialGradient>
            </defs>
            <circle cx="45" cy="45" r="34" fill="url(#pl2)"/>
            <ellipse cx="38" cy="36" rx="14" ry="6" fill="rgba(255,255,255,0.18)" transform="rotate(-18 38 36)"/>
          </svg>
          <div style={{ position: 'absolute', left: 38, top: 41, width: 9, height: 9, animation: 'orbitMoon 14s linear infinite' }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #f0ead8, #6b6455)' }}/>
          </div>
        </div>
      </div>
      {/* Distant red dwarf, top left */}
      <div style={{ position: 'absolute', left: '22%', top: '12%', animation: 'drift 52s ease-in-out 4s infinite', opacity: 0.5 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'radial-gradient(circle at 36% 30%, #ffb09a, #b04230 60%, #381008)', boxShadow: '0 0 30px rgba(255,110,80,0.35)' }}/>
      </div>
    </>
  )
}

// ─── Ambient space background ─────────────────────────────────────────────────

function SpaceBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: 'radial-gradient(ellipse at 70% 20%, #0c1030 0%, #070918 45%, #030308 100%)' }}>
      {/* Nebulae */}
      <div style={{ position: 'absolute', left: '-12%', top: '30%', width: '55%', height: '60%', background: 'radial-gradient(ellipse, rgba(120,80,200,0.16) 0%, transparent 65%)', animation: 'nebulaSh 22s ease-in-out infinite', filter: 'blur(10px)' }}/>
      <div style={{ position: 'absolute', right: '-8%', bottom: '-10%', width: '50%', height: '55%', background: 'radial-gradient(ellipse, rgba(40,120,180,0.14) 0%, transparent 65%)', animation: 'nebulaSh 28s ease-in-out 6s infinite', filter: 'blur(10px)' }}/>
      <div style={{ position: 'absolute', left: '35%', top: '-15%', width: '45%', height: '45%', background: 'radial-gradient(ellipse, rgba(200,120,90,0.08) 0%, transparent 60%)', animation: 'nebulaSh 26s ease-in-out 3s infinite', filter: 'blur(10px)' }}/>
      <SpaceCanvas/>
      <Planets/>
      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,5,0.5) 100%)' }}/>
    </div>
  )
}

// ─── Glass panel with tilt micro-interaction ──────────────────────────────────

function Glass({ children, style, glow }: { children: React.ReactNode; style?: React.CSSProperties; glow?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [hov, setHov] = useState(false)
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -2.4
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 2.4
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`
  }
  const onLeave = () => {
    setHov(false)
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)'
  }
  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{
        background: hov ? 'rgba(14,16,38,0.62)' : 'rgba(12,14,34,0.52)',
        backdropFilter: 'blur(28px) saturate(150%)',
        WebkitBackdropFilter: 'blur(28px) saturate(150%)',
        border: `1px solid ${hov ? C.borderHov : C.border}`,
        borderRadius: 22,
        boxShadow: hov
          ? `0 26px 70px rgba(0,0,8,0.5), 0 0 0 1px rgba(170,185,255,0.06), inset 0 1px 0 rgba(200,210,255,0.13)${glow ? `, 0 0 44px ${glow}` : ''}`
          : `0 10px 36px rgba(0,0,8,0.42), inset 0 1px 0 rgba(200,210,255,0.08)${glow ? `, 0 0 26px ${glow}` : ''}`,
        transition: 'background 0.3s, border 0.3s, box-shadow 0.4s, transform 0.25s ease-out',
        willChange: 'transform',
        ...style,
      }}
    >{children}</div>
  )
}

const gIn: React.CSSProperties = {
  background: 'rgba(170,185,255,0.07)', border: `1px solid ${C.border}`, borderRadius: 10,
  padding: '10px 14px', color: C.text, width: '100%', boxSizing: 'border-box', outline: 'none', ...T.body,
}

function WLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <span style={{ color: C.gold, opacity: 0.85, display: 'flex' }}>{icon}</span>
      <span style={{ ...T.label, color: C.textMuted }}>{children}</span>
    </div>
  )
}

// ─── Focus mode ───────────────────────────────────────────────────────────────

function FocusMode({ task, onExit }: { task: Task; onExit: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onExit() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onExit])
  return (
    <div onClick={onExit} style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,10,0.92)', backdropFilter: 'blur(48px)' }}/>
      <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', border: '1px solid rgba(170,185,255,0.10)', animation: 'breathe 5s ease-in-out infinite' }}/>
      <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', border: '1px solid rgba(255,216,160,0.08)', animation: 'breathe 5s ease-in-out 0.8s infinite' }}/>
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', textAlign: 'center', maxWidth: 580, padding: '0 40px', animation: 'focusIn 0.5s ease both' }}>
        <div style={{ ...T.label, color: C.gold, marginBottom: 28, opacity: 0.75 }}>Focus Mode</div>
        <div style={{ ...T.display, color: C.text, fontSize: task.title.length > 40 ? 36 : task.title.length > 25 ? 46 : 58, marginBottom: 36 }}>{task.title}</div>
        <div style={{ ...T.sm, color: C.textMuted }}>Press Esc or click anywhere to exit</div>
      </div>
      <button onClick={onExit} style={{ position: 'absolute', top: 28, right: 28, background: 'rgba(170,185,255,0.08)', border: `1px solid ${C.border}`, borderRadius: 12, color: C.textSub, padding: '8px 18px', cursor: 'pointer', ...T.sm, fontWeight: 500 }}>Exit Focus</button>
    </div>
  )
}

// ─── Compact calendar ─────────────────────────────────────────────────────────

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function MiniCalendar() {
  const now = new Date()
  const [yr, setYr] = useState(now.getFullYear())
  const [mo, setMo] = useState(now.getMonth())
  const first = new Date(yr, mo, 1).getDay()
  const dim = new Date(yr, mo + 1, 0).getDate()
  const cells = Array.from({ length: first + dim }, (_, i) => i < first ? null : i - first + 1)
  const td = now.getDate(), isCur = yr === now.getFullYear() && mo === now.getMonth()
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button onClick={() => mo === 0 ? (setMo(11), setYr(y => y - 1)) : setMo(m => m - 1)} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', display: 'flex', padding: 2 }}><ChevronLeft size={12}/></button>
        <span style={{ ...T.label, fontSize: 9.5, color: C.textSub }}>{MONTHS[mo].slice(0, 3)} {yr}</span>
        <button onClick={() => mo === 11 ? (setMo(0), setYr(y => y + 1)) : setMo(m => m + 1)} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', display: 'flex', padding: 2 }}><ChevronRight size={12}/></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 0 }}>
        {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} style={{ ...T.label, fontSize: 7.5, textAlign: 'center', color: C.textMuted, padding: '1px 0' }}>{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} style={{
            textAlign: 'center', fontSize: 10, padding: '3px 1px', borderRadius: 6, ...T.num,
            background: d && isCur && d === td ? 'rgba(255,216,160,0.20)' : 'transparent',
            color: d ? (isCur && d === td ? C.gold : C.textMuted) : 'transparent',
            fontWeight: d && isCur && d === td ? 700 : 400,
          }}>{d ?? ''}</div>
        ))}
      </div>
    </div>
  )
}

// ─── Sidebar tasks ────────────────────────────────────────────────────────────

function SidebarTasks({ onFocus }: { onFocus: (t: Task) => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [justDone, setJustDone] = useState<number | null>(null)
  const [hovId, setHovId] = useState<number | null>(null)
  const load = useCallback(async () => { const r = await fetch('/api/tasks'); setTasks(await r.json()) }, [])
  useEffect(() => { load() }, [load])
  const toggle = async (t: Task) => {
    if (!t.done) { setJustDone(t.id); setTimeout(() => setJustDone(null), 600) }
    await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: t.id, done: !t.done }) })
    load()
  }
  const add = async () => {
    if (!newTask.trim()) return
    await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTask.trim() }) })
    setNewTask(''); load()
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
      <div style={{ ...T.label, color: C.textMuted, marginBottom: 10 }}>Tasks</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {tasks.map(t => (
          <div key={t.id} onMouseEnter={() => setHovId(t.id)} onMouseLeave={() => setHovId(null)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
            <button onClick={() => toggle(t)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', animation: justDone === t.id ? 'taskPop 0.5s ease' : undefined }}>
              <div style={{ width: 15, height: 15, borderRadius: 4, border: t.done ? 'none' : `1.5px solid ${C.textMuted}`, background: t.done ? 'rgba(150,168,255,0.55)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: justDone === t.id ? '0 0 14px rgba(150,168,255,0.7)' : 'none', transition: 'all 0.28s' }}>
                {t.done && <Check size={9} color="rgba(20,25,60,0.95)" strokeWidth={2.5}/>}
              </div>
            </button>
            <span style={{ ...T.sm, flex: 1, color: t.done ? C.textMuted : C.textSub, textDecoration: t.done ? 'line-through' : 'none', lineHeight: 1.4 }}>{t.title}</span>
            {hovId === t.id && !t.done && (
              <button onClick={() => onFocus(t)} title="Focus on this task" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gold, display: 'flex', padding: 0, flexShrink: 0 }}>
                <Target size={12} strokeWidth={1.5}/>
              </button>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 7, marginTop: 10 }}>
        <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Add task..." style={{ ...gIn, fontSize: 11, padding: '7px 10px' }}/>
        <button onClick={add} style={{ background: 'rgba(170,185,255,0.12)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSub, display: 'flex', alignItems: 'center', padding: '0 10px', cursor: 'pointer', flexShrink: 0 }}><Plus size={14}/></button>
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV: { id: Page; label: string; icon: React.ReactNode; sub?: { id: string; label: string }[] }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={15} strokeWidth={1.5}/> },
  { id: 'projects',  label: 'Projects',  icon: <Layers size={15} strokeWidth={1.5}/> },
  { id: 'health',    label: 'Health',    icon: <Heart size={15} strokeWidth={1.5}/> },
  { id: 'family',    label: 'Family',    icon: <Home size={15} strokeWidth={1.5}/>, sub: [{ id: 'kids', label: 'Kids' }, { id: 'wife', label: 'Wife' }, { id: 'parents', label: 'Parents' }] },
  { id: 'friends',   label: 'Friends',   icon: <Users size={15} strokeWidth={1.5}/> },
  { id: 'resources', label: 'Resources', icon: <BookOpen size={15} strokeWidth={1.5}/> },
]

function Sidebar({ page, setPage, familySub, setFamilySub, onFocus }: {
  page: Page; setPage: (p: Page) => void; familySub: string; setFamilySub: (s: string) => void; onFocus: (t: Task) => void
}) {
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night'
  return (
    <div style={{
      width: 256, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column',
      background: 'rgba(6,8,22,0.62)', backdropFilter: 'blur(44px) saturate(140%)', WebkitBackdropFilter: 'blur(44px) saturate(140%)',
      borderRight: '1px solid rgba(160,175,255,0.08)',
    }}>
      <div style={{ padding: '24px 22px 16px' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 400, color: C.text, letterSpacing: '-0.01em' }}>Dr Muhammad Qasim</div>
        <div style={{ ...T.label, color: C.gold, marginTop: 4 }}>Command Centre</div>
        <div style={{ ...T.sm, color: C.textMuted, marginTop: 10 }}>{greeting}</div>
      </div>
      <nav style={{ padding: '0 12px' }}>
        {NAV.map(item => {
          const active = page === item.id
          return (
            <div key={item.id}>
              <div onClick={() => setPage(item.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 14px', borderRadius: 12, cursor: 'pointer', marginBottom: 2, background: active ? 'rgba(170,185,255,0.11)' : 'transparent', color: active ? C.text : C.textMuted, border: active ? `1px solid rgba(170,185,255,0.14)` : '1px solid transparent', transition: 'all 0.2s', ...T.body, fontSize: 13.5, fontWeight: active ? 500 : 400 }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(170,185,255,0.06)'; e.currentTarget.style.color = C.textSub } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textMuted } }}>
                <span style={{ display: 'flex', color: active ? C.gold : 'inherit' }}>{item.icon}</span>
                {item.label}
              </div>
              {item.sub && active && (
                <div style={{ paddingLeft: 40, marginBottom: 4 }}>
                  {item.sub.map(s => (
                    <div key={s.id} onClick={() => setFamilySub(s.id)} style={{ ...T.sm, padding: '6px 12px', borderRadius: 9, cursor: 'pointer', color: familySub === s.id ? C.gold : C.textMuted, background: familySub === s.id ? 'rgba(255,216,160,0.09)' : 'transparent', marginBottom: 1 }}>{s.label}</div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      <div style={{ height: 1, background: 'rgba(160,175,255,0.06)', margin: '12px 20px' }}/>
      <div style={{ padding: '0 18px' }}><MiniCalendar/></div>
      <div style={{ height: 1, background: 'rgba(160,175,255,0.06)', margin: '12px 20px' }}/>
      <div style={{ padding: '0 18px 20px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <SidebarTasks onFocus={onFocus}/>
      </div>
    </div>
  )
}

// ─── Weather ──────────────────────────────────────────────────────────────────

function WxIcon({ code, size = 36 }: { code: number; size?: number }) {
  const p = { size, color: C.text, strokeWidth: 1.2 }
  if (code <= 1) return <Sun {...p}/>
  if (code <= 3) return <Cloud {...p}/>
  if (code <= 48) return <CloudFog {...p}/>
  if (code <= 65) return <CloudRain {...p}/>
  if (code <= 77) return <CloudSnow {...p}/>
  if (code <= 82) return <CloudRain {...p}/>
  return <CloudLightning {...p}/>
}
const WX_DESC: Record<number, string> = { 0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Icy fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',71:'Light snow',73:'Snow',75:'Heavy snow',80:'Showers',81:'Rain showers',82:'Heavy showers',95:'Thunderstorm' }

function WeatherWidget() {
  const [wx, setWx] = useState<{ temp: number; code: number; wind: number; city: string } | null>(null)
  useEffect(() => {
    const load = (lat: number, lon: number, city: string) =>
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`)
        .then(r => r.json()).then(d => setWx({ temp: Math.round(d.current.temperature_2m), code: d.current.weather_code, wind: Math.round(d.current.wind_speed_10m), city }))
    navigator.geolocation?.getCurrentPosition(
      p => load(p.coords.latitude, p.coords.longitude, 'Your location'),
      () => load(51.5, -0.12, 'London')
    )
  }, [])
  return (
    <Glass glow="rgba(90,140,220,0.10)" style={{ padding: 24 }}>
      <WLabel icon={<Cloud size={13} strokeWidth={1.5}/>}>Weather</WLabel>
      {wx ? (
        <>
          <div style={{ marginBottom: 10, animation: 'float 11s ease-in-out infinite' }}><WxIcon code={wx.code} size={40}/></div>
          <div style={{ ...T.display, ...T.num, fontSize: 52, color: C.text }}>{wx.temp}°</div>
          <div style={{ ...T.body, color: C.textSub, marginTop: 4 }}>{WX_DESC[wx.code] ?? ''}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, ...T.sm, color: C.textMuted }}>
            <Wind size={11} strokeWidth={1.5}/><span>{wx.wind} km/h · {wx.city}</span>
          </div>
        </>
      ) : <div style={{ ...T.body, color: C.textMuted }}>Fetching weather...</div>}
    </Glass>
  )
}

// ─── Analog world clocks ──────────────────────────────────────────────────────

const CLOCKS = [
  { city: 'London',   tz: 'Europe/London' },
  { city: 'Dubai',    tz: 'Asia/Dubai' },
  { city: 'New York', tz: 'America/New_York' },
  { city: 'Lahore',   tz: 'Asia/Karachi' },
]

function AnalogClock({ tz, city, now }: { tz: string; city: string; now: Date }) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }).formatToParts(now)
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value ?? 0)
  const hh = get('hour') % 12, mm = get('minute'), ss = get('second')
  const ha = (hh + mm / 60) * 30, ma = (mm + ss / 60) * 6, sa = ss * 6
  const R = 34
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={R * 2} height={R * 2} viewBox={`0 0 ${R * 2} ${R * 2}`}>
        <circle cx={R} cy={R} r={R - 1.5} fill="rgba(170,185,255,0.05)" stroke="rgba(170,185,255,0.20)" strokeWidth="1"/>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = i * 30 * Math.PI / 180
          const big = i % 3 === 0
          return <line key={i}
            x1={R + Math.sin(a) * (R - (big ? 8 : 5.5))} y1={R - Math.cos(a) * (R - (big ? 8 : 5.5))}
            x2={R + Math.sin(a) * (R - 3.5)} y2={R - Math.cos(a) * (R - 3.5)}
            stroke={big ? 'rgba(255,216,160,0.65)' : 'rgba(220,224,245,0.30)'} strokeWidth={big ? 1.6 : 1}/>
        })}
        <line x1={R} y1={R} x2={R + Math.sin(ha * Math.PI / 180) * (R * 0.45)} y2={R - Math.cos(ha * Math.PI / 180) * (R * 0.45)} stroke="rgba(245,246,255,0.92)" strokeWidth="2.4" strokeLinecap="round"/>
        <line x1={R} y1={R} x2={R + Math.sin(ma * Math.PI / 180) * (R * 0.68)} y2={R - Math.cos(ma * Math.PI / 180) * (R * 0.68)} stroke="rgba(245,246,255,0.70)" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1={R} y1={R + 6} x2={R + Math.sin(sa * Math.PI / 180) * (R * 0.78)} y2={R - Math.cos(sa * Math.PI / 180) * (R * 0.78)} stroke={C.gold} strokeWidth="1" strokeLinecap="round" style={{ transformOrigin: `${R}px ${R}px` }}/>
        <circle cx={R} cy={R} r="2" fill={C.gold}/>
      </svg>
      <div style={{ ...T.label, fontSize: 8.5, color: C.textSub, marginTop: 6 }}>{city}</div>
      <div style={{ ...T.num, fontSize: 11, color: C.textMuted, marginTop: 2 }}>
        {new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(now)}
      </div>
    </div>
  )
}

function ClockWidget() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])
  return (
    <Glass glow="rgba(150,140,255,0.10)" style={{ padding: 24 }}>
      <WLabel icon={<Clock size={13} strokeWidth={1.5}/>}>World Clock</WLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, justifyItems: 'center' }}>
        {CLOCKS.map(c => <AnalogClock key={c.city} tz={c.tz} city={c.city} now={now}/>)}
      </div>
    </Glass>
  )
}

// ─── Reflections ──────────────────────────────────────────────────────────────

function ReflectionsWidget() {
  const [items, setItems] = useState<Reflection[]>([])
  const [text, setText] = useState('')
  const load = useCallback(async () => { const r = await fetch('/api/reflections'); setItems(await r.json()) }, [])
  useEffect(() => { load() }, [load])
  const save = async () => { if (!text.trim()) return; await fetch('/api/reflections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text.trim() }) }); setText(''); load() }
  const del = async (id: number) => { await fetch('/api/reflections', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); load() }
  return (
    <Glass glow="rgba(255,200,120,0.08)" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <WLabel icon={<Feather size={13} strokeWidth={1.5}/>}>Stray Reflections</WLabel>
      <div style={{ display: 'flex', gap: 8 }}>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="A thought, observation, or idea..." rows={2}
          style={{ ...gIn, resize: 'none', flex: 1 }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() } }}/>
        <button onClick={save} style={{ background: 'rgba(255,216,160,0.16)', border: '1px solid rgba(255,216,160,0.26)', borderRadius: 10, color: C.gold, padding: '0 16px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center' }}><ArrowUpRight size={16}/></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxHeight: 200, overflowY: 'auto' }}>
        {items.map((r, i) => (
          <div key={r.id} style={{ background: 'rgba(170,185,255,0.04)', borderRadius: 13, padding: '12px 15px', borderLeft: '2px solid rgba(255,216,160,0.30)', position: 'relative', animation: 'fadeUp 0.3s ease both', animationDelay: `${i * 0.04}s` }}>
            <div style={{ ...T.body, color: C.textSub }}>{r.content}</div>
            <div style={{ ...T.sm, fontSize: 10.5, color: C.textMuted, marginTop: 6 }}>{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <button onClick={() => del(r.id)} style={{ position: 'absolute', top: 9, right: 9, background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', display: 'flex' }}><X size={11}/></button>
          </div>
        ))}
        {items.length === 0 && <div style={{ ...T.sm, color: C.textMuted, textAlign: 'center', padding: '16px 0' }}>No reflections yet</div>}
      </div>
    </Glass>
  )
}

// ─── Project category styling ─────────────────────────────────────────────────

const CAT_C: Record<string, { c: string; bg: string; text: string }> = {
  Clinical:        { c: '#5ee8a8', bg: 'rgba(90,225,165,0.14)',  text: 'rgba(170,245,205,0.94)' },
  Academic:        { c: '#6aa8ff', bg: 'rgba(100,165,255,0.14)', text: 'rgba(165,200,255,0.94)' },
  Entrepreneurial: { c: '#b890ff', bg: 'rgba(180,145,255,0.14)', text: 'rgba(205,180,255,0.94)' },
  Career:          { c: '#ffc465', bg: 'rgba(255,195,100,0.14)', text: 'rgba(255,215,150,0.94)' },
}
const STATUS_C: Record<string, { bg: string; text: string }> = {
  'In progress': { bg: 'rgba(90,225,165,0.14)',  text: 'rgba(170,245,205,0.94)' },
  'Not started': { bg: 'rgba(200,206,235,0.08)', text: 'rgba(200,206,235,0.52)' },
  'On hold':     { bg: 'rgba(255,195,100,0.12)', text: 'rgba(255,215,150,0.94)' },
  'Complete':    { bg: 'rgba(100,165,255,0.14)', text: 'rgba(165,200,255,0.94)' },
}
const STATUSES = ['Not started', 'In progress', 'On hold', 'Complete']

function Chip({ label, bg, text }: { label: string; bg: string; text: string }) {
  return <span style={{ ...T.label, fontSize: 8.5, display: 'inline-block', padding: '3px 10px', borderRadius: 99, background: bg, color: text }}>{label}</span>
}

function glowCard(c: string, hov: boolean): React.CSSProperties {
  return {
    border: `1px solid ${c}${hov ? '70' : '40'}`,
    boxShadow: hov
      ? `0 0 0 1px ${c}30, 0 0 28px ${c}38, 0 0 60px ${c}18, 0 14px 40px rgba(0,0,10,0.5)`
      : `0 0 0 1px ${c}18, 0 0 18px ${c}22, 0 8px 28px rgba(0,0,10,0.4)`,
  }
}

// ─── Projects widget ──────────────────────────────────────────────────────────

function ProjectsWidget({ projects, onOpen }: { projects: Project[]; onOpen: () => void }) {
  const active = projects.filter(p => p.status === 'In progress')
  return (
    <Glass glow="rgba(90,225,165,0.08)" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <WLabel icon={<Layers size={13} strokeWidth={1.5}/>}>Projects</WLabel>
        <button onClick={onOpen} style={{ background: 'rgba(170,185,255,0.08)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.textSub, padding: '6px 16px', cursor: 'pointer', ...T.sm, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>All <ArrowUpRight size={11}/></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
        {[{ label: 'Total', val: projects.length }, { label: 'Active', val: active.length }, { label: 'Blockers', val: projects.filter(p => p.block).length }, { label: 'Deadlines', val: projects.filter(p => p.dl).length }].map(s => (
          <div key={s.label} style={{ background: 'rgba(170,185,255,0.05)', borderRadius: 14, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ ...T.h1, ...T.num, fontSize: 30, color: C.text }}>{s.val}</div>
            <div style={{ ...T.label, color: C.textMuted, marginTop: 4, fontSize: 8.5 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {active.slice(0, 4).map(p => {
          const cc = CAT_C[p.cat] ?? CAT_C.Clinical
          const prog = p.phases.length ? (p.cp + 1) / p.phases.length : 0
          return (
            <div key={p.id} style={{ padding: '12px 14px', background: 'rgba(8,10,26,0.55)', borderRadius: 14, ...glowCard(cc.c, false) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ ...T.h3, color: C.text }}>{p.title}</div>
                  {p.next && <div style={{ ...T.sm, fontSize: 11, color: C.textMuted, marginTop: 3 }}>{p.next}</div>}
                </div>
                <Chip label={p.cat} bg={cc.bg} text={cc.text}/>
              </div>
              <div style={{ marginTop: 9, height: 4, borderRadius: 99, background: 'rgba(170,185,255,0.08)', overflow: 'hidden' }}>
                <div style={{ width: `${prog * 100}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${cc.c}90, ${cc.c})`, boxShadow: `0 0 10px ${cc.c}90` }}/>
              </div>
            </div>
          )
        })}
      </div>
    </Glass>
  )
}

// ─── Health widget ────────────────────────────────────────────────────────────

function HealthWidget() {
  const metrics = [
    { icon: <Flame size={18} strokeWidth={1.3}/>, label: 'Calories', c: 'rgba(255,180,110,0.88)' },
    { icon: <Activity size={18} strokeWidth={1.3}/>, label: 'Heart', c: 'rgba(255,140,150,0.88)' },
    { icon: <Activity size={18} strokeWidth={1.3}/>, label: 'Steps', c: 'rgba(150,230,180,0.88)' },
    { icon: <Moon size={18} strokeWidth={1.3}/>, label: 'Sleep', c: 'rgba(180,170,255,0.88)' },
  ]
  return (
    <Glass glow="rgba(255,120,140,0.07)" style={{ padding: 24 }}>
      <WLabel icon={<Heart size={13} strokeWidth={1.5}/>}>Health</WLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: 'rgba(170,185,255,0.05)', borderRadius: 13, padding: '13px 10px', textAlign: 'center' }}>
            <div style={{ color: m.c, marginBottom: 6, display: 'flex', justifyContent: 'center' }}>{m.icon}</div>
            <div style={{ ...T.h2, color: m.c }}>—</div>
            <div style={{ ...T.label, color: C.textMuted, marginTop: 4, fontSize: 8.5 }}>{m.label}</div>
          </div>
        ))}
      </div>
    </Glass>
  )
}

// ─── News (three categories) ──────────────────────────────────────────────────

const NEWS_TABS: { key: keyof NewsData; label: string; icon: React.ReactNode; c: string }[] = [
  { key: 'research', label: 'Latest Research', icon: <FlaskConical size={12} strokeWidth={1.5}/>, c: 'rgba(150,230,180,0.9)' },
  { key: 'politics', label: 'Politics',         icon: <Landmark size={12} strokeWidth={1.5}/>,     c: 'rgba(165,200,255,0.9)' },
  { key: 'finance',  label: 'Finance',          icon: <TrendingUp size={12} strokeWidth={1.5}/>,   c: 'rgba(255,215,150,0.9)' },
]

function NewsWidget() {
  const [news, setNews] = useState<NewsData | null>(null)
  useEffect(() => { fetch('/api/news').then(r => r.json()).then(setNews) }, [])
  return (
    <Glass glow="rgba(255,165,90,0.06)" style={{ padding: 24 }}>
      <WLabel icon={<Newspaper size={13} strokeWidth={1.5}/>}>News · BBC</WLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {NEWS_TABS.map(tab => (
          <div key={tab.key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: tab.c, display: 'flex' }}>{tab.icon}</span>
              <span style={{ ...T.label, fontSize: 9.5, color: tab.c }}>{tab.label}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {(news?.[tab.key] ?? []).map((n, i) => (
                <a key={i} href={n.link} target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: 'none', display: 'block', background: 'rgba(170,185,255,0.04)', borderRadius: 12, padding: '12px 14px', transition: 'all 0.22s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(170,185,255,0.09)'; e.currentTarget.style.transform = 'translateX(3px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(170,185,255,0.04)'; e.currentTarget.style.transform = 'translateX(0)' }}>
                  <div style={{ ...T.sm, fontWeight: 550, color: C.text, lineHeight: 1.45 }}>{n.title}</div>
                  {n.pubDate && <div style={{ ...T.label, fontSize: 8, color: C.textMuted, marginTop: 6 }}>{new Date(n.pubDate).toLocaleDateString('en-GB')}</div>}
                </a>
              ))}
              {!news && <div style={{ ...T.sm, color: C.textMuted }}>Loading...</div>}
            </div>
          </div>
        ))}
      </div>
    </Glass>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ projects, setPage }: { projects: Project[]; setPage: (p: Page) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ marginBottom: 4 }}>
        <h1 style={{ margin: 0, ...T.display, fontSize: 44, color: C.text }}>Command Centre</h1>
        <div style={{ ...T.body, color: C.textMuted, marginTop: 6 }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.8fr', gap: 18 }}>
        <WeatherWidget/>
        <ClockWidget/>
        <ReflectionsWidget/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: 18 }}>
        <ProjectsWidget projects={projects} onOpen={() => setPage('projects')}/>
        <HealthWidget/>
      </div>
      <NewsWidget/>
    </div>
  )
}

// ─── Project modal ────────────────────────────────────────────────────────────

function todayStr() { const d = new Date(); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}` }

function ProjectModal({ project, onClose, onSave, onDelete }: { project: Project | null; onClose: () => void; onSave: (p: Project) => Promise<void>; onDelete: (id: number) => Promise<void> }) {
  const [form, setForm] = useState<Project | null>(null)
  const [newPhase, setNewPhase] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { setForm(project ? { ...project, notes: project.notes ?? '', phases: [...project.phases], log: [...project.log] } : null) }, [project])
  if (!form) return null
  const set = (k: keyof Project, v: any) => setForm(f => f ? { ...f, [k]: v } : f)
  const addPhase = () => { if (!newPhase.trim()) return; set('phases', [...form.phases, newPhase.trim()]); setNewPhase('') }
  const removePhase = (i: number) => { const p = form.phases.filter((_, j) => j !== i); set('phases', p); if (form.cp >= p.length) set('cp', Math.max(0, p.length - 1)) }
  const movePhase = (i: number, dir: -1 | 1) => { const p = [...form.phases]; const j = i + dir; if (j < 0 || j >= p.length) return; [p[i], p[j]] = [p[j], p[i]]; set('phases', p) }
  const handleSave = async () => { if (!form) return; setSaving(true); await onSave(form); setSaving(false); onClose() }
  const handleDelete = async () => { if (!form || !confirm('Delete this project?')) return; await onDelete(form.id); onClose() }
  const mIn: React.CSSProperties = { width: '100%', padding: '9px 12px', border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 14, color: C.text, background: 'rgba(170,185,255,0.06)', boxSizing: 'border-box', outline: 'none' }
  const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 15 }}>
      <label style={{ display: 'block', ...T.label, fontSize: 9, color: C.textMuted, marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,3,10,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 800, padding: 16, backdropFilter: 'blur(12px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'rgba(12,14,34,0.94)', border: `1px solid ${C.borderHov}`, borderRadius: 24, width: '100%', maxWidth: 640, maxHeight: '92vh', overflowY: 'auto', padding: 32, boxShadow: '0 40px 120px rgba(0,0,10,0.7)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ margin: 0, ...T.h2, color: C.text }}>{form.id ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex' }}><X size={20}/></button>
        </div>
        <F label="Title"><input value={form.title} onChange={e => set('title', e.target.value)} style={mIn}/></F>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <F label="Category"><select value={form.cat} onChange={e => set('cat', e.target.value)} style={{ ...mIn, background: 'rgba(12,14,34,1)' }}>{['Clinical', 'Academic', 'Entrepreneurial', 'Career'].map(c => <option key={c}>{c}</option>)}</select></F>
          <F label="Status"><select value={form.status} onChange={e => set('status', e.target.value)} style={{ ...mIn, background: 'rgba(12,14,34,1)' }}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></F>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <F label="Deadline"><input value={form.dl} onChange={e => set('dl', e.target.value)} style={mIn} placeholder="e.g. 30 Sep 2026"/></F>
          <F label="Assigned to"><input value={form.who} onChange={e => set('who', e.target.value)} style={mIn}/></F>
        </div>
        <F label="Next step"><input value={form.next} onChange={e => set('next', e.target.value)} style={mIn}/></F>
        <F label="Last action (auto-logs)"><input value={form.last} onChange={e => set('last', e.target.value)} style={mIn}/></F>
        <F label="Blocker"><input value={form.block} onChange={e => set('block', e.target.value)} style={mIn}/></F>
        <F label="Notes / Thought process">
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={5} placeholder="Write your thinking, plan, ideas..." style={{ ...mIn, resize: 'vertical', lineHeight: 1.65, fontFamily: 'inherit' }}/>
        </F>
        <F label="Phases">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {form.phases.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ flex: 1, fontSize: 13, color: C.textSub }}>{p}</span>
                <button onClick={() => movePhase(i, -1)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 11, color: C.textMuted }}>↑</button>
                <button onClick={() => movePhase(i, 1)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 11, color: C.textMuted }}>↓</button>
                <button onClick={() => removePhase(i)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: 'rgba(255,130,130,0.8)', display: 'flex' }}><X size={11}/></button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 7, marginTop: 5 }}>
              <input value={newPhase} onChange={e => setNewPhase(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPhase()} placeholder="Add phase..." style={{ ...mIn, flex: 1 }}/>
              <button onClick={addPhase} style={{ background: 'rgba(170,185,255,0.10)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 13, color: C.textSub }}>Add</button>
            </div>
          </div>
        </F>
        <F label={`Phase ${form.cp + 1} of ${form.phases.length || 1}: ${form.phases[form.cp] ?? '–'}`}>
          <input type="range" min={0} max={Math.max(0, form.phases.length - 1)} value={form.cp} onChange={e => set('cp', Number(e.target.value))} style={{ width: '100%', accentColor: '#ffd8a0' }}/>
        </F>
        {form.log.length > 0 && (
          <F label="Activity log">
            <div style={{ maxHeight: 110, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[...form.log].reverse().map((e, i) => (
                <div key={i} style={{ fontSize: 12, color: C.textSub, borderLeft: `2px solid ${C.border}`, paddingLeft: 9 }}>
                  <span style={{ fontWeight: 600, color: C.gold }}>{e.d}</span> — {e.n}
                </div>
              ))}
            </div>
          </F>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22 }}>
          {form.id ? <button onClick={handleDelete} style={{ background: 'rgba(255,90,90,0.10)', color: 'rgba(255,150,150,0.9)', border: '1px solid rgba(255,90,90,0.25)', borderRadius: 9, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Delete</button> : <div/>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ background: 'rgba(170,185,255,0.08)', border: 'none', borderRadius: 9, padding: '9px 18px', cursor: 'pointer', fontSize: 14, color: C.textSub }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ background: 'rgba(255,216,160,0.88)', color: '#1a1206', border: 'none', borderRadius: 9, padding: '9px 22px', cursor: 'pointer', fontWeight: 650, fontSize: 14, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Projects page ────────────────────────────────────────────────────────────

function ProjectCard({ p, onClick }: { p: Project; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  const cc = CAT_C[p.cat] ?? CAT_C.Clinical
  const prog = p.phases.length ? (p.cp + 1) / p.phases.length : 0
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: 'rgba(8,10,26,0.62)', backdropFilter: 'blur(22px)', borderRadius: 16, padding: '14px 16px', marginBottom: 10, cursor: 'pointer', transition: 'all 0.25s', transform: hov ? 'translateY(-3px)' : 'none', ...glowCard(cc.c, hov) }}>
      <div style={{ ...T.h3, color: C.text, marginBottom: 4 }}>{p.title}</div>
      {p.next && <div style={{ ...T.sm, fontSize: 11.5, color: C.textMuted, fontStyle: 'italic' }}>{p.next}</div>}
      <div style={{ marginTop: 10, height: 4, borderRadius: 99, background: 'rgba(170,185,255,0.08)', overflow: 'hidden' }}>
        <div style={{ width: `${prog * 100}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${cc.c}90, ${cc.c})`, boxShadow: `0 0 10px ${cc.c}90` }}/>
      </div>
      {p.dl && <div style={{ ...T.sm, fontSize: 10.5, color: C.textMuted, marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={10}/>{p.dl}</div>}
    </div>
  )
}

function ProjectsPage({ projects, reload }: { projects: Project[]; reload: () => Promise<void> }) {
  const [cat, setCat] = useState('All')
  const [view, setView] = useState<'board' | 'list'>('board')
  const [selected, setSelected] = useState<Project | null>(null)
  const filtered = projects.filter(p => cat === 'All' || p.cat === cat)
  const CATS = ['All', 'Clinical', 'Academic', 'Entrepreneurial', 'Career']
  const handleSave = async (form: Project) => {
    const prevLast = projects.find(p => p.id === form.id)?.last ?? ''
    const log = form.last && form.last !== prevLast ? [...form.log, { d: todayStr(), n: form.last }] : form.log
    const payload = { ...form, log }
    if (form.id) { await fetch('/api/projects', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }) }
    else { const { id: _, ...body } = payload; await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) }
    await reload()
  }
  const handleDelete = async (id: number) => { await fetch('/api/projects', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); await reload() }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <h1 style={{ margin: 0, ...T.h1, color: C.text }}>Projects</h1>
        <button onClick={() => setSelected({ id: 0, title: '', cat: 'Clinical', status: 'Not started', phases: [], cp: 0, next: '', last: '', dl: '', who: '', block: '', notes: '', log: [] })}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,216,160,0.14)', border: '1px solid rgba(255,216,160,0.28)', borderRadius: 14, color: C.gold, ...T.body, fontWeight: 550, padding: '10px 22px', cursor: 'pointer' }}>
          <Plus size={14}/>New project
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ padding: '7px 18px', borderRadius: 22, border: 'none', cursor: 'pointer', ...T.sm, fontWeight: 600, background: cat === c ? 'rgba(170,185,255,0.18)' : 'rgba(12,14,34,0.55)', color: cat === c ? C.text : C.textMuted, backdropFilter: 'blur(20px)' }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(12,14,34,0.55)', borderRadius: 12, padding: 4, backdropFilter: 'blur(20px)' }}>
          {(['board', 'list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '6px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', ...T.sm, fontWeight: 600, textTransform: 'capitalize', background: view === v ? 'rgba(170,185,255,0.15)' : 'transparent', color: view === v ? C.text : C.textMuted }}>{v}</button>
          ))}
        </div>
      </div>
      {view === 'board' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, alignItems: 'start' }}>
          {STATUSES.map(s => {
            const sc = STATUS_C[s]; const items = filtered.filter(p => p.status === s)
            return (
              <div key={s}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Chip label={s} bg={sc.bg} text={sc.text}/>
                  <span style={{ ...T.label, color: C.textMuted, fontSize: 9 }}>{items.length}</span>
                </div>
                {items.map(p => <ProjectCard key={p.id} p={p} onClick={() => setSelected(p)}/>)}
              </div>
            )
          })}
        </div>
      )}
      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(p => {
            const cc = CAT_C[p.cat] ?? CAT_C.Clinical; const sc = STATUS_C[p.status] ?? STATUS_C['Not started']
            return (
              <div key={p.id} onClick={() => setSelected(p)}
                style={{ background: 'rgba(8,10,26,0.62)', backdropFilter: 'blur(22px)', borderRadius: 16, padding: '15px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.25s', ...glowCard(cc.c, false) }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; Object.assign(e.currentTarget.style, glowCard(cc.c, true)) }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; Object.assign(e.currentTarget.style, glowCard(cc.c, false)) }}>
                <div style={{ flex: 1 }}>
                  <div style={{ ...T.h3, color: C.text }}>{p.title}</div>
                  {p.next && <div style={{ ...T.sm, color: C.textMuted, marginTop: 3 }}>{p.next}</div>}
                </div>
                <Chip label={p.cat} bg={cc.bg} text={cc.text}/>
                <Chip label={p.status} bg={sc.bg} text={sc.text}/>
                {p.dl && <span style={{ ...T.sm, color: C.textMuted, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}><Calendar size={10}/>{p.dl}</span>}
              </div>
            )
          })}
        </div>
      )}
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} onSave={handleSave} onDelete={handleDelete}/>}
    </div>
  )
}

// ─── Health page ──────────────────────────────────────────────────────────────

function HealthPage() {
  return (
    <div>
      <h1 style={{ margin: '0 0 26px', ...T.h1, color: C.text }}>Health</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { icon: <Flame size={28} strokeWidth={1.2}/>, label: 'Active Calories', c: 'rgba(255,180,110,0.88)' },
          { icon: <Activity size={28} strokeWidth={1.2}/>, label: 'Heart Rate', c: 'rgba(255,140,150,0.88)' },
          { icon: <Activity size={28} strokeWidth={1.2}/>, label: 'Steps', c: 'rgba(150,230,180,0.88)' },
          { icon: <Moon size={28} strokeWidth={1.2}/>, label: 'Sleep', c: 'rgba(180,170,255,0.88)' },
        ].map(m => (
          <Glass key={m.label} style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ color: m.c, marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{m.icon}</div>
            <div style={{ ...T.h1, color: m.c, fontSize: 38 }}>—</div>
            <div style={{ ...T.label, color: C.textMuted, marginTop: 8, fontSize: 9 }}>{m.label}</div>
          </Glass>
        ))}
      </div>
      <Glass style={{ padding: 26 }}>
        <div style={{ ...T.h3, color: 'rgba(255,160,150,0.9)', marginBottom: 14 }}>Connect Apple Watch</div>
        <div style={{ ...T.body, color: C.textSub, lineHeight: 1.8 }}>
          HealthKit cannot be read directly by a web app. To pipe your metrics here:<br/>
          1. Create an <strong style={{ color: C.text }}>Apple Shortcut</strong> that runs on unlock or daily.<br/>
          2. Use "Get Health Samples" to read Calories, Heart Rate, Steps, Sleep.<br/>
          3. POST the JSON to <code style={{ background: 'rgba(170,185,255,0.10)', padding: '2px 8px', borderRadius: 5, fontSize: 12 }}>/api/health</code>.<br/>
          4. The metrics above populate automatically once connected.
        </div>
      </Glass>
    </div>
  )
}

// ─── Family / Friends pages ───────────────────────────────────────────────────

function FamilyPage({ sub, setSub }: { sub: string; setSub: (s: string) => void }) {
  const [notes, setNotes] = useState<FamilyNote[]>([])
  const [text, setText] = useState('')
  const load = useCallback(async () => { const r = await fetch('/api/family'); setNotes(await r.json()) }, [])
  useEffect(() => { load() }, [load])
  const subs = [{ id: 'kids', label: 'Kids' }, { id: 'wife', label: 'Wife' }, { id: 'parents', label: 'Parents' }]
  const cur = subs.find(s => s.id === sub)
  const mn = notes.filter(n => n.member === sub)
  const add = async () => { if (!text.trim()) return; await fetch('/api/family', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ member: sub, content: text.trim() }) }); setText(''); load() }
  const del = async (id: number) => { await fetch('/api/family', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); load() }
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 26 }}>
        <h1 style={{ margin: 0, ...T.h1, color: C.text }}>Family</h1>
        <div style={{ display: 'flex', gap: 7 }}>
          {subs.map(s => (
            <button key={s.id} onClick={() => setSub(s.id)} style={{ padding: '7px 20px', borderRadius: 22, border: 'none', cursor: 'pointer', ...T.sm, fontWeight: 600, background: sub === s.id ? 'rgba(170,185,255,0.16)' : 'rgba(12,14,34,0.55)', color: sub === s.id ? C.text : C.textMuted, backdropFilter: 'blur(20px)' }}>{s.label}</button>
          ))}
        </div>
      </div>
      <Glass style={{ padding: 26 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder={`Add a note about ${cur?.label}...`} rows={2} style={{ ...gIn, flex: 1, resize: 'none' }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); add() } }}/>
          <button onClick={add} style={{ background: 'rgba(170,185,255,0.12)', border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, ...T.body, fontWeight: 500, padding: '0 22px', cursor: 'pointer' }}>Add</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mn.map(n => (
            <div key={n.id} style={{ background: 'rgba(170,185,255,0.04)', borderRadius: 14, padding: '15px 18px', borderLeft: '2px solid rgba(255,216,160,0.25)', position: 'relative' }}>
              <div style={{ ...T.body, color: C.textSub }}>{n.content}</div>
              <div style={{ ...T.label, color: C.textMuted, marginTop: 8, fontSize: 8.5 }}>{new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <button onClick={() => del(n.id)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', display: 'flex' }}><X size={12}/></button>
            </div>
          ))}
          {mn.length === 0 && <div style={{ ...T.body, color: C.textMuted, textAlign: 'center', padding: '26px 0' }}>No notes for {cur?.label} yet</div>}
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
  const load = useCallback(async () => { const r = await fetch('/api/friends'); setNotes(await r.json()) }, [])
  useEffect(() => { load() }, [load])
  const names = Array.from(new Set(notes.map(n => n.name)))
  const add = async () => { if (!name.trim() || !text.trim()) return; await fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), content: text.trim() }) }); setText(''); load() }
  const del = async (id: number) => { await fetch('/api/friends', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); load() }
  const filtered = notes.filter(n => !filter || n.name === filter)
  return (
    <div>
      <h1 style={{ margin: '0 0 26px', ...T.h1, color: C.text }}>Friends</h1>
      <Glass style={{ padding: 26, marginBottom: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 10, marginBottom: names.length ? 18 : 0 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={gIn}/>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Note..." style={gIn} onKeyDown={e => e.key === 'Enter' && add()}/>
          <button onClick={add} style={{ background: 'rgba(170,185,255,0.12)', border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, ...T.body, fontWeight: 500, padding: '0 24px', cursor: 'pointer' }}>Add</button>
        </div>
        {names.length > 0 && (
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <button onClick={() => setFilter('')} style={{ padding: '5px 16px', borderRadius: 16, border: 'none', cursor: 'pointer', ...T.sm, fontWeight: 600, background: filter === '' ? 'rgba(170,185,255,0.16)' : 'rgba(170,185,255,0.06)', color: filter === '' ? C.text : C.textMuted }}>All</button>
            {names.map(n => (
              <button key={n} onClick={() => setFilter(n)} style={{ padding: '5px 16px', borderRadius: 16, border: 'none', cursor: 'pointer', ...T.sm, fontWeight: 600, background: filter === n ? 'rgba(170,185,255,0.16)' : 'rgba(170,185,255,0.06)', color: filter === n ? C.text : C.textMuted }}>{n}</button>
            ))}
          </div>
        )}
      </Glass>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(n => (
          <Glass key={n.id} style={{ padding: '16px 20px', position: 'relative' }}>
            <div style={{ ...T.label, color: C.gold, marginBottom: 6, fontSize: 9 }}>{n.name}</div>
            <div style={{ ...T.body, color: C.textSub }}>{n.content}</div>
            <div style={{ ...T.label, color: C.textMuted, marginTop: 8, fontSize: 8.5 }}>{new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <button onClick={() => del(n.id)} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', display: 'flex' }}><X size={12}/></button>
          </Glass>
        ))}
        {filtered.length === 0 && <div style={{ ...T.body, color: C.textMuted, textAlign: 'center', padding: '32px 0' }}>No entries yet</div>}
      </div>
    </div>
  )
}

// ─── Resources page ───────────────────────────────────────────────────────────

const RES_CATS = ['Clinical', 'Academic', 'Learning', 'Tools', 'Other']

function ResourcesPage() {
  const [items, setItems] = useState<Resource[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('Clinical')
  const [note, setNote] = useState('')
  const [filter, setFilter] = useState('All')
  const load = useCallback(async () => { const r = await fetch('/api/resources'); const d = await r.json(); setItems(Array.isArray(d) ? d : []) }, [])
  useEffect(() => { load() }, [load])
  const add = async () => {
    if (!title.trim()) return
    await fetch('/api/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim(), url: url.trim(), category, note: note.trim() }) })
    setTitle(''); setUrl(''); setNote(''); load()
  }
  const del = async (id: number) => { await fetch('/api/resources', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); load() }
  const filtered = items.filter(i => filter === 'All' || i.category === filter)
  return (
    <div>
      <h1 style={{ margin: '0 0 26px', ...T.h1, color: C.text }}>Personal Resources</h1>
      <Glass style={{ padding: 26, marginBottom: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 0.9fr', gap: 10, marginBottom: 10 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" style={gIn}/>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (optional)" style={gIn}/>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...gIn, background: 'rgba(12,14,34,1)' }}>{RES_CATS.map(c => <option key={c}>{c}</option>)}</select>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)" style={{ ...gIn, flex: 1 }} onKeyDown={e => e.key === 'Enter' && add()}/>
          <button onClick={add} style={{ background: 'rgba(255,216,160,0.14)', border: '1px solid rgba(255,216,160,0.28)', borderRadius: 12, color: C.gold, ...T.body, fontWeight: 550, padding: '0 26px', cursor: 'pointer' }}>Add</button>
        </div>
      </Glass>
      <div style={{ display: 'flex', gap: 7, marginBottom: 18 }}>
        {['All', ...RES_CATS].map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{ padding: '6px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', ...T.sm, fontWeight: 600, background: filter === c ? 'rgba(170,185,255,0.16)' : 'rgba(12,14,34,0.55)', color: filter === c ? C.text : C.textMuted, backdropFilter: 'blur(20px)' }}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {filtered.map(r => (
          <Glass key={r.id} style={{ padding: '18px 20px', position: 'relative' }}>
            <div style={{ ...T.label, fontSize: 8.5, color: C.gold, marginBottom: 8 }}>{r.category}</div>
            <div style={{ ...T.h3, color: C.text, marginBottom: 6 }}>{r.title}</div>
            {r.note && <div style={{ ...T.sm, color: C.textSub, marginBottom: 8 }}>{r.note}</div>}
            {r.url && (
              <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ ...T.sm, color: C.aurora, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Link2 size={11}/>Open link
              </a>
            )}
            <button onClick={() => del(r.id)} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', display: 'flex' }}><X size={12}/></button>
          </Glass>
        ))}
        {filtered.length === 0 && <div style={{ ...T.body, color: C.textMuted, gridColumn: '1/-1', textAlign: 'center', padding: '32px 0' }}>No resources yet — add links, papers, tools and references above</div>}
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function CommandCentre() {
  const [page, setPage] = useState<Page>('dashboard')
  const [familySub, setFamilySub] = useState('kids')
  const [projects, setProjects] = useState<Project[]>([])
  const [focusTask, setFocusTask] = useState<Task | null>(null)

  const loadProjects = useCallback(async () => { const r = await fetch('/api/projects'); setProjects(await r.json()) }, [])
  useEffect(() => { loadProjects() }, [loadProjects])

  const handleSetPage = (p: Page) => { if (p === 'family') setFamilySub('kids'); setPage(p) }

  return (
    <>
      <style>{KEYFRAMES}</style>
      <SpaceBg/>
      {focusTask && <FocusMode task={focusTask} onExit={() => setFocusTask(null)}/>}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: '100vh' }}>
        <Sidebar page={page} setPage={handleSetPage} familySub={familySub} setFamilySub={setFamilySub} onFocus={setFocusTask}/>
        <main style={{ flex: 1, padding: '34px 34px 50px', overflowY: 'auto', minWidth: 0 }}>
          {page === 'dashboard' && <Dashboard projects={projects} setPage={handleSetPage}/>}
          {page === 'projects'  && <ProjectsPage projects={projects} reload={loadProjects}/>}
          {page === 'health'    && <HealthPage/>}
          {page === 'family'    && <FamilyPage sub={familySub} setSub={setFamilySub}/>}
          {page === 'friends'   && <FriendsPage/>}
          {page === 'resources' && <ResourcesPage/>}
        </main>
      </div>
    </>
  )
}
