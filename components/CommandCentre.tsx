'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Project = {
  id: number; title: string; cat: string; status: string
  phases: string[]; cp: number; next: string; last: string
  dl: string; who: string; block: string; log: { d: string; n: string }[]
}
type Reflection = { id: number; content: string; created_at: string }
type Task       = { id: number; title: string; done: boolean; due_date: string }
type FamilyNote = { id: number; member: string; content: string; created_at: string }
type FriendNote = { id: number; name: string; content: string; created_at: string }
type NewsItem   = { title: string; link: string; pubDate: string; description: string }
type Weather    = { temp: number; code: number; wind: number; city: string } | null

// ─── Constants ────────────────────────────────────────────────────────────────

const G = {
  projects:    { c: '#10b981', s: 'rgba(16,185,129,' },
  health:      { c: '#f43f5e', s: 'rgba(244,63,94,' },
  family:      { c: '#a855f7', s: 'rgba(168,85,247,' },
  reflections: { c: '#f59e0b', s: 'rgba(245,158,11,' },
  weather:     { c: '#38bdf8', s: 'rgba(56,189,248,' },
  clock:       { c: '#818cf8', s: 'rgba(129,140,248,' },
  news:        { c: '#fb923c', s: 'rgba(251,146,60,' },
  friends:     { c: '#34d399', s: 'rgba(52,211,153,' },
}

const WX_EMOJI: Record<number, string> = {
  0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',
  51:'🌦️',53:'🌧️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',
  71:'❄️',73:'❄️',75:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',95:'⛈️'
}
const WX_DESC: Record<number, string> = {
  0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',
  45:'Fog',48:'Icy fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',
  61:'Light rain',63:'Rain',65:'Heavy rain',71:'Light snow',73:'Snow',75:'Heavy snow',
  80:'Showers',81:'Rain showers',82:'Violent showers',95:'Thunderstorm'
}

const CLOCKS = [
  { city: 'London',   tz: 'Europe/London',      flag: '🇬🇧' },
  { city: 'Dubai',    tz: 'Asia/Dubai',          flag: '🇦🇪' },
  { city: 'New York', tz: 'America/New_York',    flag: '🇺🇸' },
  { city: 'Lahore',   tz: 'Asia/Karachi',        flag: '🇵🇰' },
]

const CAT_C: Record<string, { border: string; bg: string; text: string }> = {
  Clinical:       { border:'#059669', bg:'#d1fae5', text:'#064e3b' },
  Academic:       { border:'#3b82f6', bg:'#dbeafe', text:'#1e40af' },
  Entrepreneurial:{ border:'#8b5cf6', bg:'#ede9fe', text:'#5b21b6' },
  Career:         { border:'#d97706', bg:'#fef3c7', text:'#92400e' },
}
const STATUS_C: Record<string, { bg: string; text: string }> = {
  'In progress':{ bg:'#d1fae5', text:'#064e3b' },
  'Not started':{ bg:'#e4e4e7', text:'#52525b' },
  'On hold':    { bg:'#fef3c7', text:'#92400e' },
  'Complete':   { bg:'#dbeafe', text:'#1e40af' },
}
const STATUSES = ['Not started','In progress','On hold','Complete']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']

const today = () => {
  const d = new Date()
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const card = (key: keyof typeof G, hov: boolean): React.CSSProperties => {
  const { c, s } = G[key]
  return {
    background: hov ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.025)',
    border: `1px solid ${hov ? c : 'rgba(255,255,255,0.07)'}`,
    borderRadius: 18,
    padding: 22,
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: hov
      ? `0 0 0 1px ${s}0.25), 0 0 32px ${s}0.18), 0 0 64px ${s}0.07), inset 0 1px 0 rgba(255,255,255,0.06)`
      : '0 2px 8px rgba(0,0,0,0.4)',
    cursor: 'default',
  }
}

const inputS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '8px 12px', color: '#f4f4f5', fontSize: 13, width: '100%',
  boxSizing: 'border-box', outline: 'none',
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Chip({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span style={{ display:'inline-block', padding:'2px 9px', borderRadius:9999, fontSize:11, fontWeight:600, background:bg, color:text }}>
      {label}
    </span>
  )
}

function SectionTitle({ accent, icon, children }: { accent: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
      <span style={{ fontSize:16 }}>{icon}</span>
      <span style={{ fontSize:13, fontWeight:700, color:'#f4f4f5', letterSpacing:'0.04em', textTransform:'uppercase' }}>{children}</span>
      <div style={{ flex:1, height:1, background:`linear-gradient(to right, ${accent}40, transparent)` }} />
    </div>
  )
}

// ─── Glow Widget wrapper ──────────────────────────────────────────────────────

function Widget({ gkey, style, children }: { gkey: keyof typeof G; style?: React.CSSProperties; children: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      style={{ ...card(gkey, hov), ...style }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </div>
  )
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

function MiniCalendar() {
  const now = new Date()
  const [yr, setYr] = useState(now.getFullYear())
  const [mo, setMo] = useState(now.getMonth())
  const first = new Date(yr, mo, 1).getDay()
  const daysInMonth = new Date(yr, mo + 1, 0).getDate()
  const cells = Array.from({ length: first + daysInMonth }, (_, i) => i < first ? null : i - first + 1)
  const todayDate = now.getDate()
  const isCurrentMonth = yr === now.getFullYear() && mo === now.getMonth()

  const prev = () => { if (mo === 0) { setMo(11); setYr(y => y - 1) } else setMo(m => m - 1) }
  const next = () => { if (mo === 11) { setMo(0); setYr(y => y + 1) } else setMo(m => m + 1) }

  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <button onClick={prev} style={{ background:'none', border:'none', color:'#a1a1aa', cursor:'pointer', fontSize:14 }}>‹</button>
        <span style={{ fontSize:12, fontWeight:600, color:'#e4e4e7' }}>{MONTHS[mo].slice(0,3)} {yr}</span>
        <button onClick={next} style={{ background:'none', border:'none', color:'#a1a1aa', cursor:'pointer', fontSize:14 }}>›</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:10, color:'#52525b', fontWeight:600, padding:'2px 0' }}>{d}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} style={{
            textAlign:'center', fontSize:11, padding:'4px 2px', borderRadius:6,
            background: d && isCurrentMonth && d === todayDate ? '#10b981' : 'transparent',
            color: d ? (isCurrentMonth && d === todayDate ? '#fff' : '#a1a1aa') : 'transparent',
            fontWeight: d && isCurrentMonth && d === todayDate ? 700 : 400,
          }}>{d ?? ''}</div>
        ))}
      </div>
    </div>
  )
}

// ─── Tasks sidebar widget ─────────────────────────────────────────────────────

function SidebarTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')

  const load = useCallback(async () => {
    const r = await fetch('/api/tasks'); setTasks(await r.json())
  }, [])
  useEffect(() => { load() }, [load])

  const toggle = async (t: Task) => {
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
      <div style={{ fontSize:11, fontWeight:700, color:'#52525b', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>Tasks</div>
      <div style={{ display:'flex', flexDirection:'column', gap:4, maxHeight:200, overflowY:'auto' }}>
        {tasks.map(t => (
          <div key={t.id} onClick={() => toggle(t)} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'4px 0' }}>
            <div style={{
              width:14, height:14, borderRadius:4, flexShrink:0,
              border: t.done ? 'none' : '1.5px solid #3f3f46',
              background: t.done ? '#10b981' : 'transparent',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {t.done && <span style={{ color:'#fff', fontSize:9, fontWeight:700 }}>✓</span>}
            </div>
            <span style={{ fontSize:12, color: t.done ? '#52525b' : '#a1a1aa', textDecoration: t.done ? 'line-through' : 'none', lineHeight:1.3 }}>
              {t.title}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:6, marginTop:10 }}>
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add task..."
          style={{ ...inputS, fontSize:11, padding:'6px 8px' }}
        />
        <button onClick={add} style={{ background:'#10b981', border:'none', borderRadius:7, color:'#fff', fontSize:11, fontWeight:700, padding:'6px 10px', cursor:'pointer', flexShrink:0 }}>+</button>
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

type Page = 'dashboard' | 'projects' | 'health' | 'family' | 'friends'

const NAV: { id: Page; label: string; icon: string; sub?: { id: string; label: string }[] }[] = [
  { id:'dashboard', label:'Dashboard',  icon:'⊞' },
  { id:'projects',  label:'Projects',   icon:'◈' },
  { id:'health',    label:'Health',     icon:'♡' },
  { id:'family',    label:'Family',     icon:'⌂', sub:[{id:'kids',label:'Kids'},{id:'wife',label:'Wife'},{id:'parents',label:'Parents'}] },
  { id:'friends',   label:'Friends',    icon:'◎' },
]

function Sidebar({ page, setPage, familySub, setFamilySub }: {
  page: Page; setPage: (p: Page) => void
  familySub: string; setFamilySub: (s: string) => void
}) {
  return (
    <div style={{
      width:260, minHeight:'100vh', background:'#0f0f11',
      borderRight:'1px solid rgba(255,255,255,0.06)',
      display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto'
    }}>
      {/* Branding */}
      <div style={{ padding:'24px 20px 20px' }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#10b981', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:2 }}>Dr Muhammad Qasim</div>
        <div style={{ fontSize:11, color:'#52525b', letterSpacing:'0.04em' }}>Command Centre</div>
      </div>

      {/* Nav */}
      <nav style={{ padding:'0 10px', flex:1 }}>
        {NAV.map(item => {
          const active = page === item.id
          return (
            <div key={item.id}>
              <div
                onClick={() => setPage(item.id)}
                style={{
                  display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
                  borderRadius:10, cursor:'pointer', marginBottom:2,
                  background: active ? 'rgba(16,185,129,0.12)' : 'transparent',
                  color: active ? '#10b981' : '#71717a',
                  transition:'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#d4d4d8' }}
                onMouseLeave={e => { e.currentTarget.style.background = active ? 'rgba(16,185,129,0.12)' : 'transparent'; e.currentTarget.style.color = active ? '#10b981' : '#71717a' }}
              >
                <span style={{ fontSize:15 }}>{item.icon}</span>
                <span style={{ fontSize:13, fontWeight:600 }}>{item.label}</span>
              </div>
              {/* Family sub-nav */}
              {item.sub && active && (
                <div style={{ paddingLeft:34, marginBottom:4 }}>
                  {item.sub.map(s => (
                    <div
                      key={s.id}
                      onClick={() => setFamilySub(s.id)}
                      style={{
                        fontSize:12, padding:'6px 10px', borderRadius:8, cursor:'pointer',
                        color: familySub === s.id ? '#a855f7' : '#52525b',
                        background: familySub === s.id ? 'rgba(168,85,247,0.12)' : 'transparent',
                        marginBottom:2, transition:'all 0.15s',
                      }}
                    >{s.label}</div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Divider */}
      <div style={{ height:1, background:'rgba(255,255,255,0.05)', margin:'12px 20px' }} />

      {/* Calendar */}
      <div style={{ padding:'0 16px 16px' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#52525b', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>Calendar</div>
        <MiniCalendar />
      </div>

      {/* Divider */}
      <div style={{ height:1, background:'rgba(255,255,255,0.05)', margin:'0 20px 12px' }} />

      {/* Tasks */}
      <div style={{ padding:'0 16px 24px' }}>
        <SidebarTasks />
      </div>
    </div>
  )
}

// ─── Weather widget ───────────────────────────────────────────────────────────

function WeatherWidget() {
  const [wx, setWx] = useState<Weather>(null)
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lon } = pos.coords
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`)
          .then(r => r.json()).then(d => {
            setWx({ temp: Math.round(d.current.temperature_2m), code: d.current.weather_code, wind: Math.round(d.current.wind_speed_10m), city: 'Your location' })
          })
      },
      () => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.12&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto')
          .then(r => r.json()).then(d => {
            setWx({ temp: Math.round(d.current.temperature_2m), code: d.current.weather_code, wind: Math.round(d.current.wind_speed_10m), city: 'London' })
          })
      }
    )
  }, [])

  return (
    <Widget gkey="weather">
      <SectionTitle accent={G.weather.c} icon="🌤">Weather</SectionTitle>
      {wx ? (
        <div>
          <div style={{ fontSize:42, lineHeight:1, marginBottom:6 }}>{WX_EMOJI[wx.code] ?? '🌡️'}</div>
          <div style={{ fontSize:28, fontWeight:700, color:'#f4f4f5' }}>{wx.temp}°C</div>
          <div style={{ fontSize:12, color:'#a1a1aa', marginTop:4 }}>{WX_DESC[wx.code] ?? 'Unknown'}</div>
          <div style={{ fontSize:11, color:'#52525b', marginTop:6 }}>💨 {wx.wind} km/h · {wx.city}</div>
        </div>
      ) : (
        <div style={{ color:'#52525b', fontSize:13 }}>Fetching...</div>
      )}
    </Widget>
  )
}

// ─── World clock widget ───────────────────────────────────────────────────────

function ClockWidget() {
  const [tick, setTick] = useState(0)
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(id) }, [])
  const fmt = (tz: string) => new Date().toLocaleTimeString('en-GB', { timeZone: tz, hour:'2-digit', minute:'2-digit' })

  return (
    <Widget gkey="clock">
      <SectionTitle accent={G.clock.c} icon="🕰">World Clock</SectionTitle>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {CLOCKS.map(c => (
          <div key={c.city} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:14 }}>{c.flag}</span>
              <span style={{ fontSize:12, color:'#a1a1aa' }}>{c.city}</span>
            </div>
            <span style={{ fontSize:14, fontWeight:600, color:'#f4f4f5', fontVariantNumeric:'tabular-nums' }}>{fmt(c.tz)}</span>
          </div>
        ))}
      </div>
    </Widget>
  )
}

// ─── Reflections widget ───────────────────────────────────────────────────────

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
    <Widget gkey="reflections" style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <SectionTitle accent={G.reflections.c} icon="✦">Stray Reflections</SectionTitle>
      <div style={{ display:'flex', gap:8 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="A thought, observation, or idea..."
          rows={2}
          style={{ ...inputS, resize:'none', flex:1 }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() } }}
        />
        <button onClick={save} style={{ background:`${G.reflections.c}`, border:'none', borderRadius:8, color:'#000', fontWeight:700, fontSize:12, padding:'0 14px', cursor:'pointer', flexShrink:0 }}>↑</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:200, overflowY:'auto' }}>
        {items.map(r => (
          <div key={r.id} style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'10px 12px', borderLeft:`2px solid ${G.reflections.c}40`, position:'relative' }}>
            <div style={{ fontSize:13, color:'#d4d4d8', lineHeight:1.5 }}>{r.content}</div>
            <div style={{ fontSize:10, color:'#52525b', marginTop:6 }}>{new Date(r.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</div>
            <button onClick={() => del(r.id)} style={{ position:'absolute', top:8, right:8, background:'none', border:'none', color:'#52525b', cursor:'pointer', fontSize:12 }}>✕</button>
          </div>
        ))}
        {items.length === 0 && <div style={{ color:'#3f3f46', fontSize:12, textAlign:'center', padding:'12px 0' }}>No reflections yet</div>}
      </div>
    </Widget>
  )
}

// ─── Projects summary widget ──────────────────────────────────────────────────

function ProjectsWidget({ projects, onOpenProject }: { projects: Project[]; onOpenProject: () => void }) {
  const inProgress = projects.filter(p => p.status === 'In progress')
  return (
    <Widget gkey="projects" style={{ cursor:'default' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <SectionTitle accent={G.projects.c} icon="◈">Projects</SectionTitle>
        <button onClick={onOpenProject} style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:8, color:'#10b981', fontSize:11, fontWeight:600, padding:'4px 12px', cursor:'pointer' }}>View all →</button>
      </div>
      <div style={{ display:'flex', gap:12, marginBottom:16 }}>
        {[
          { label:'Total', val:projects.length, c:'#a1a1aa' },
          { label:'Active', val:inProgress.length, c:'#10b981' },
          { label:'Blockers', val:projects.filter(p=>p.block).length, c:'#f43f5e' },
          { label:'Deadlines', val:projects.filter(p=>p.dl).length, c:'#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ flex:1, background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'10px 12px', textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:700, color:s.c }}>{s.val}</div>
            <div style={{ fontSize:10, color:'#52525b', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {inProgress.slice(0,4).map(p => {
          const cat = CAT_C[p.cat] ?? CAT_C.Clinical
          return (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'rgba(255,255,255,0.03)', borderRadius:10, borderLeft:`3px solid ${cat.border}` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#e4e4e7' }}>{p.title}</div>
                {p.next && <div style={{ fontSize:11, color:'#71717a', marginTop:2 }}>{p.next}</div>}
              </div>
              <Chip label={p.cat} bg={cat.bg} text={cat.text} />
            </div>
          )
        })}
      </div>
    </Widget>
  )
}

// ─── Health widget ────────────────────────────────────────────────────────────

function HealthWidget() {
  const metrics = [
    { icon:'🔥', label:'Calories', value:'—', unit:'kcal', tip:'Active' },
    { icon:'❤️', label:'Heart Rate', value:'—', unit:'bpm', tip:'' },
    { icon:'👟', label:'Steps', value:'—', unit:'steps', tip:'' },
    { icon:'😴', label:'Sleep', value:'—', unit:'hrs', tip:'' },
  ]
  return (
    <Widget gkey="health">
      <SectionTitle accent={G.health.c} icon="♡">Health</SectionTitle>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'12px 14px' }}>
            <div style={{ fontSize:18, marginBottom:4 }}>{m.icon}</div>
            <div style={{ fontSize:18, fontWeight:700, color:'#f4f4f5' }}>{m.value}</div>
            <div style={{ fontSize:10, color:'#52525b' }}>{m.label} · {m.unit}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.2)', borderRadius:12, padding:'12px 14px' }}>
        <div style={{ fontSize:12, fontWeight:600, color:'#f43f5e', marginBottom:4 }}>Connect Apple Watch</div>
        <div style={{ fontSize:11, color:'#71717a', lineHeight:1.6 }}>
          Live health data requires a HealthKit bridge. Install the <strong style={{color:'#a1a1aa'}}>Shortcuts</strong> automation on your iPhone to POST metrics to this dashboard's API endpoint.
        </div>
      </div>
    </Widget>
  )
}

// ─── Family widget ────────────────────────────────────────────────────────────

function FamilyWidget({ onOpen }: { onOpen: () => void }) {
  const sections = [
    { label:'Kids',    icon:'🧒', c:'#a855f7' },
    { label:'Wife',    icon:'💑', c:'#ec4899' },
    { label:'Parents', icon:'👴', c:'#f59e0b' },
  ]
  return (
    <Widget gkey="family">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <SectionTitle accent={G.family.c} icon="⌂">Family</SectionTitle>
        <button onClick={onOpen} style={{ background:'rgba(168,85,247,0.15)', border:'1px solid rgba(168,85,247,0.3)', borderRadius:8, color:'#a855f7', fontSize:11, fontWeight:600, padding:'4px 12px', cursor:'pointer' }}>Open →</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {sections.map(s => (
          <div key={s.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:12, borderLeft:`3px solid ${s.c}` }}>
            <span style={{ fontSize:20 }}>{s.icon}</span>
            <span style={{ fontSize:13, color:'#d4d4d8', fontWeight:500 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </Widget>
  )
}

// ─── News widget ──────────────────────────────────────────────────────────────

function NewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/news').then(r => r.json()).then(d => { setNews(d); setLoading(false) })
  }, [])

  return (
    <Widget gkey="news">
      <SectionTitle accent={G.news.c} icon="📰">News · BBC</SectionTitle>
      {loading && <div style={{ color:'#52525b', fontSize:13 }}>Loading...</div>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {news.map((n, i) => (
          <a
            key={i}
            href={n.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration:'none', display:'block', background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'12px 14px', borderTop:`2px solid ${G.news.c}30`, transition:'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
          >
            <div style={{ fontSize:13, fontWeight:600, color:'#e4e4e7', lineHeight:1.4, marginBottom:6 }}>{n.title}</div>
            <div style={{ fontSize:11, color:'#71717a', lineHeight:1.5 }}>{n.description}</div>
            <div style={{ fontSize:10, color:'#52525b', marginTop:8 }}>{n.pubDate ? new Date(n.pubDate).toLocaleDateString('en-GB') : ''}</div>
          </a>
        ))}
      </div>
    </Widget>
  )
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

function Dashboard({ projects, setPage }: { projects: Project[]; setPage: (p: Page) => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Row 1: Weather + Clock + Reflections */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 2fr', gap:16 }}>
        <WeatherWidget />
        <ClockWidget />
        <ReflectionsWidget />
      </div>
      {/* Row 2: Projects + Health + Family */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:16 }}>
        <ProjectsWidget projects={projects} onOpenProject={() => setPage('projects')} />
        <HealthWidget />
        <FamilyWidget onOpen={() => setPage('family')} />
      </div>
      {/* Row 3: News */}
      <NewsWidget />
    </div>
  )
}

// ─── Full Projects page (existing logic) ──────────────────────────────────────

function ProjectModal({ project, onClose, onSave, onDelete }: {
  project: Project | null; onClose: () => void
  onSave: (p: Project) => Promise<void>; onDelete: (id: number) => Promise<void>
}) {
  const [form, setForm] = useState<Project | null>(null)
  const [newPhase, setNewPhase] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { setForm(project ? { ...project, phases:[...project.phases], log:[...project.log] } : null) }, [project])
  if (!form) return null

  const set = (k: keyof Project, v: any) => setForm(f => f ? { ...f, [k]:v } : f)
  const addPhase = () => { if (!newPhase.trim()) return; set('phases', [...form.phases, newPhase.trim()]); setNewPhase('') }
  const removePhase = (i: number) => { const p = form.phases.filter((_,j)=>j!==i); set('phases',p); if(form.cp>=p.length) set('cp',Math.max(0,p.length-1)) }
  const movePhase = (i: number, dir: -1|1) => { const p=[...form.phases]; const j=i+dir; if(j<0||j>=p.length) return; [p[i],p[j]]=[p[j],p[i]]; set('phases',p) }

  const handleSave = async () => { if(!form) return; setSaving(true); await onSave(form); setSaving(false); onClose() }
  const handleDelete = async () => { if(!form||!confirm('Delete?')) return; await onDelete(form.id); onClose() }

  const mInputS: React.CSSProperties = { width:'100%', padding:'8px 10px', border:'1px solid #3f3f46', borderRadius:8, fontSize:14, color:'#18181b', background:'#fafafa', boxSizing:'border-box' }
  const Field = ({ label, children }: { label:string; children:React.ReactNode }) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#71717a', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</label>
      {children}
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:620, maxHeight:'90vh', overflowY:'auto', padding:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>{form.id ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#71717a' }}>✕</button>
        </div>
        <Field label="Title"><input value={form.title} onChange={e=>set('title',e.target.value)} style={mInputS} /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Category">
            <select value={form.cat} onChange={e=>set('cat',e.target.value)} style={mInputS}>
              {['Clinical','Academic','Entrepreneurial','Career'].map(c=><option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={e=>set('status',e.target.value)} style={mInputS}>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Deadline"><input value={form.dl} onChange={e=>set('dl',e.target.value)} style={mInputS} placeholder="e.g. 30 Sep 2026" /></Field>
          <Field label="Assigned to"><input value={form.who} onChange={e=>set('who',e.target.value)} style={mInputS} /></Field>
        </div>
        <Field label="Next step"><input value={form.next} onChange={e=>set('next',e.target.value)} style={mInputS} /></Field>
        <Field label="Last action (logs automatically)"><input value={form.last} onChange={e=>set('last',e.target.value)} style={mInputS} /></Field>
        <Field label="Blocker"><input value={form.block} onChange={e=>set('block',e.target.value)} style={mInputS} /></Field>
        <Field label="Phases">
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
              <input value={newPhase} onChange={e=>setNewPhase(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addPhase()} placeholder="Add phase..." style={{ ...mInputS, flex:1 }} />
              <button onClick={addPhase} style={{ background:'#f4f4f5', border:'1px solid #e4e4e7', borderRadius:7, padding:'6px 14px', cursor:'pointer', fontSize:13 }}>Add</button>
            </div>
          </div>
        </Field>
        <Field label={`Current phase (${form.cp+1}/${form.phases.length||1})`}>
          <input type="range" min={0} max={Math.max(0,form.phases.length-1)} value={form.cp} onChange={e=>set('cp',Number(e.target.value))} style={{ width:'100%' }} />
          <div style={{ fontSize:12, color:'#71717a' }}>{form.phases[form.cp]??'None'}</div>
        </Field>
        {form.log.length>0&&(
          <Field label="Activity log">
            <div style={{ maxHeight:120, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
              {[...form.log].reverse().map((e,i)=>(
                <div key={i} style={{ fontSize:12, color:'#52525b', borderLeft:'2px solid #e4e4e7', paddingLeft:8 }}>
                  <span style={{ fontWeight:600 }}>{e.d}</span> — {e.n}
                </div>
              ))}
            </div>
          </Field>
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

function ProjectsPage({ projects, reload }: { projects: Project[]; reload: () => Promise<void> }) {
  const [cat, setCat] = useState('All')
  const [view, setView] = useState<'board'|'list'>('board')
  const [selected, setSelected] = useState<Project|null>(null)

  const filtered = projects.filter(p => cat==='All'||p.cat===cat)
  const CATS = ['All','Clinical','Academic','Entrepreneurial','Career']

  const openNew = () => setSelected({ id:0,title:'',cat:'Clinical',status:'Not started',phases:[],cp:0,next:'',last:'',dl:'',who:'',block:'',log:[] })

  const handleSave = async (form: Project) => {
    const prevLast = projects.find(p=>p.id===form.id)?.last??''
    let log = form.log
    if (form.last && form.last!==prevLast) log = [...form.log, { d:today(), n:form.last }]
    const payload = { ...form, log }
    if (form.id) {
      await fetch('/api/projects', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
    } else {
      const { id:_, ...body } = payload
      await fetch('/api/projects', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    }
    await reload()
  }

  const handleDelete = async (id: number) => {
    await fetch('/api/projects', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id }) })
    await reload()
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:700, color:'#f4f4f5' }}>Projects</h1>
        <button onClick={openNew} style={{ background:'#10b981', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', cursor:'pointer', fontWeight:600, fontSize:14 }}>+ New project</button>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{ padding:'6px 14px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:600, fontSize:13, background:cat===c?'#10b981':'rgba(255,255,255,0.07)', color:cat===c?'#fff':'#71717a' }}>{c}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.05)', borderRadius:8, padding:3 }}>
          {(['board','list'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'5px 14px', borderRadius:6, border:'none', cursor:'pointer', fontWeight:600, fontSize:13, textTransform:'capitalize', background:view===v?'#1c1c1e':'transparent', color:view===v?'#fff':'#52525b' }}>{v}</button>
          ))}
        </div>
      </div>

      {view==='board' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, alignItems:'start' }}>
          {STATUSES.map(s=>{
            const sc = STATUS_C[s]
            const items = filtered.filter(p=>p.status===s)
            return (
              <div key={s}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <Chip label={s} bg={sc.bg} text={sc.text} />
                  <span style={{ fontSize:12, color:'#71717a', fontWeight:600 }}>{items.length}</span>
                </div>
                {items.map(p=>{
                  const cc = CAT_C[p.cat]??CAT_C.Clinical
                  return (
                    <div key={p.id} onClick={()=>setSelected(p)} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:14, borderLeft:`4px solid ${cc.border}`, marginBottom:10, cursor:'pointer', transition:'background 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                    >
                      <div style={{ fontWeight:600, fontSize:13, color:'#e4e4e7', marginBottom:4 }}>{p.title}</div>
                      {p.next&&<div style={{ fontSize:11, color:'#71717a', fontStyle:'italic' }}>↗ {p.next}</div>}
                      {p.dl&&<div style={{ fontSize:11, color:'#52525b', marginTop:6 }}>📅 {p.dl}</div>}
                      <div style={{ marginTop:8 }}>
                        <Chip label={p.cat} bg={cc.bg} text={cc.text} />
                      </div>
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
              <div key={p.id} onClick={()=>setSelected(p)} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'14px 18px', borderLeft:`4px solid ${cc.border}`, cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
              >
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14, color:'#e4e4e7' }}>{p.title}</div>
                  {p.next&&<div style={{ fontSize:12, color:'#71717a', marginTop:2 }}>{p.next}</div>}
                </div>
                <Chip label={p.cat} bg={cc.bg} text={cc.text} />
                <Chip label={p.status} bg={sc.bg} text={sc.text} />
                {p.dl&&<span style={{ fontSize:12, color:'#52525b' }}>📅 {p.dl}</span>}
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <ProjectModal
          project={selected}
          onClose={()=>setSelected(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

// ─── Health full page ─────────────────────────────────────────────────────────

function HealthPage() {
  return (
    <div>
      <h1 style={{ margin:'0 0 24px', fontSize:20, fontWeight:700, color:'#f4f4f5' }}>Health</h1>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { icon:'🔥', label:'Active Calories', value:'—', unit:'kcal', c:'#f59e0b' },
          { icon:'❤️', label:'Heart Rate',      value:'—', unit:'bpm', c:'#f43f5e' },
          { icon:'👟', label:'Steps',           value:'—', unit:'today', c:'#10b981' },
          { icon:'😴', label:'Sleep',           value:'—', unit:'hrs last night', c:'#818cf8' },
        ].map(m=>(
          <div key={m.label} style={{ background:'rgba(255,255,255,0.04)', borderRadius:16, padding:20, borderTop:`3px solid ${m.c}` }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{m.icon}</div>
            <div style={{ fontSize:28, fontWeight:700, color:m.c }}>{m.value}</div>
            <div style={{ fontSize:12, color:'#71717a', marginTop:4 }}>{m.label}</div>
            <div style={{ fontSize:11, color:'#52525b' }}>{m.unit}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(244,63,94,0.06)', border:'1px solid rgba(244,63,94,0.2)', borderRadius:16, padding:24 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#f43f5e', marginBottom:12 }}>Connect Apple Watch</div>
        <div style={{ fontSize:13, color:'#a1a1aa', lineHeight:1.8 }}>
          Apple HealthKit data cannot be accessed directly by a web app. To stream your metrics here:<br />
          1. Create an <strong style={{color:'#e4e4e7'}}>Apple Shortcuts</strong> automation on your iPhone (runs daily or on unlock).<br />
          2. Use the "Get Health Samples" action to read Calories, Heart Rate, Steps, Sleep.<br />
          3. Use "Get Contents of URL" to POST the data to <code style={{background:'rgba(255,255,255,0.08)',padding:'1px 6px',borderRadius:4,fontSize:12}}>/api/health</code>.<br />
          4. The dashboard will display live data once the endpoint is wired up.
        </div>
      </div>
    </div>
  )
}

// ─── Family full page ─────────────────────────────────────────────────────────

function FamilyPage({ sub, setSub }: { sub: string; setSub: (s: string) => void }) {
  const [notes, setNotes] = useState<FamilyNote[]>([])
  const [text, setText] = useState('')
  const load = useCallback(async () => { const r = await fetch('/api/family'); setNotes(await r.json()) }, [])
  useEffect(() => { load() }, [load])

  const memberNotes = notes.filter(n => n.member === sub)

  const add = async () => {
    if (!text.trim()) return
    await fetch('/api/family', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ member:sub, content:text.trim() }) })
    setText(''); load()
  }
  const del = async (id: number) => {
    await fetch('/api/family', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id }) })
    load()
  }

  const subs = [{ id:'kids',label:'Kids',icon:'🧒'}, {id:'wife',label:'Wife',icon:'💑'}, {id:'parents',label:'Parents',icon:'👴'}]
  const cur = subs.find(s=>s.id===sub)

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:700, color:'#f4f4f5' }}>Family</h1>
        <div style={{ display:'flex', gap:6 }}>
          {subs.map(s=>(
            <button key={s.id} onClick={()=>setSub(s.id)} style={{ padding:'6px 16px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:600, fontSize:13, background:sub===s.id?'rgba(168,85,247,0.2)':'rgba(255,255,255,0.06)', color:sub===s.id?'#a855f7':'#71717a' }}>{s.icon} {s.label}</button>
          ))}
        </div>
      </div>
      <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:16, padding:24 }}>
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`Add a note about ${cur?.label}...`} rows={2} style={{ ...inputS, flex:1, resize:'none' }} onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();add()} }} />
          <button onClick={add} style={{ background:G.family.c, border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:13, padding:'0 18px', cursor:'pointer' }}>Add</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {memberNotes.map(n=>(
            <div key={n.id} style={{ background:'rgba(168,85,247,0.06)', borderRadius:12, padding:'14px 16px', borderLeft:`3px solid ${G.family.c}50`, position:'relative' }}>
              <div style={{ fontSize:13, color:'#d4d4d8', lineHeight:1.6 }}>{n.content}</div>
              <div style={{ fontSize:11, color:'#52525b', marginTop:8 }}>{new Date(n.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
              <button onClick={()=>del(n.id)} style={{ position:'absolute', top:10, right:10, background:'none', border:'none', color:'#52525b', cursor:'pointer', fontSize:13 }}>✕</button>
            </div>
          ))}
          {memberNotes.length===0&&<div style={{ color:'#3f3f46', fontSize:13, textAlign:'center', padding:'24px 0' }}>No notes for {cur?.label} yet</div>}
        </div>
      </div>
    </div>
  )
}

// ─── Friends full page ────────────────────────────────────────────────────────

function FriendsPage() {
  const [notes, setNotes] = useState<FriendNote[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const load = useCallback(async () => { const r = await fetch('/api/friends'); setNotes(await r.json()) }, [])
  useEffect(() => { load() }, [load])

  const names = Array.from(new Set(notes.map(n=>n.name)))
  const [filter, setFilter] = useState('')

  const add = async () => {
    if (!name.trim()||!text.trim()) return
    await fetch('/api/friends', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name:name.trim(), content:text.trim() }) })
    setText(''); load()
  }
  const del = async (id: number) => {
    await fetch('/api/friends', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id }) })
    load()
  }

  const filtered = notes.filter(n=>!filter||n.name===filter)

  return (
    <div>
      <h1 style={{ margin:'0 0 24px', fontSize:20, fontWeight:700, color:'#f4f4f5' }}>Friends</h1>
      <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:16, padding:24, marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr auto', gap:10, marginBottom:16 }}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Friend's name" style={inputS} />
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Note..." style={inputS} onKeyDown={e=>e.key==='Enter'&&add()} />
          <button onClick={add} style={{ background:G.friends.c, border:'none', borderRadius:10, color:'#000', fontWeight:700, fontSize:13, padding:'0 20px', cursor:'pointer' }}>Add</button>
        </div>
        {names.length>0&&(
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <button onClick={()=>setFilter('')} style={{ padding:'4px 12px', borderRadius:16, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:filter===''?G.friends.c:'rgba(255,255,255,0.07)', color:filter===''?'#000':'#71717a' }}>All</button>
            {names.map(n=>(
              <button key={n} onClick={()=>setFilter(n)} style={{ padding:'4px 12px', borderRadius:16, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:filter===n?G.friends.c:'rgba(255,255,255,0.07)', color:filter===n?'#000':'#71717a' }}>{n}</button>
            ))}
          </div>
        )}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.map(n=>(
          <div key={n.id} style={{ background:'rgba(52,211,153,0.05)', borderRadius:12, padding:'14px 16px', borderLeft:`3px solid ${G.friends.c}50`, position:'relative' }}>
            <div style={{ fontSize:12, fontWeight:700, color:G.friends.c, marginBottom:4 }}>{n.name}</div>
            <div style={{ fontSize:13, color:'#d4d4d8', lineHeight:1.6 }}>{n.content}</div>
            <div style={{ fontSize:11, color:'#52525b', marginTop:6 }}>{new Date(n.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
            <button onClick={()=>del(n.id)} style={{ position:'absolute', top:10, right:10, background:'none', border:'none', color:'#52525b', cursor:'pointer', fontSize:13 }}>✕</button>
          </div>
        ))}
        {filtered.length===0&&<div style={{ color:'#3f3f46', fontSize:13, textAlign:'center', padding:'24px 0' }}>No entries yet</div>}
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function CommandCentre() {
  const [page, setPage] = useState<Page>('dashboard')
  const [familySub, setFamilySub] = useState('kids')
  const [projects, setProjects] = useState<Project[]>([])

  const loadProjects = useCallback(async () => {
    const r = await fetch('/api/projects'); setProjects(await r.json())
  }, [])
  useEffect(() => { loadProjects() }, [loadProjects])

  const handleSetPage = (p: Page) => {
    if (p === 'family') { setFamilySub('kids') }
    setPage(p)
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#080809', color:'#e4e4e7', fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar page={page} setPage={handleSetPage} familySub={familySub} setFamilySub={setFamilySub} />
      <main style={{ flex:1, padding:28, overflowY:'auto', minWidth:0 }}>
        {page==='dashboard' && <Dashboard projects={projects} setPage={handleSetPage} />}
        {page==='projects'  && <ProjectsPage projects={projects} reload={loadProjects} />}
        {page==='health'    && <HealthPage />}
        {page==='family'    && <FamilyPage sub={familySub} setSub={setFamilySub} />}
        {page==='friends'   && <FriendsPage />}
      </main>
    </div>
  )
}
