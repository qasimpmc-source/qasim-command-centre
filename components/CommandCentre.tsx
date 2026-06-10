'use client'

import { useEffect, useState, useCallback } from 'react'

type LogEntry = { d: string; n: string }

type Project = {
  id: number
  title: string
  cat: string
  status: string
  phases: string[]
  cp: number
  next: string
  last: string
  dl: string
  who: string
  block: string
  log: LogEntry[]
}

const CAT_COLOURS: Record<string, { border: string; bg: string; text: string }> = {
  Clinical:       { border: '#059669', bg: '#d1fae5', text: '#064e3b' },
  Academic:       { border: '#3b82f6', bg: '#dbeafe', text: '#1e40af' },
  Entrepreneurial:{ border: '#8b5cf6', bg: '#ede9fe', text: '#5b21b6' },
  Career:         { border: '#d97706', bg: '#fef3c7', text: '#92400e' },
}

const STATUS_COLOURS: Record<string, { bg: string; text: string }> = {
  'In progress': { bg: '#d1fae5', text: '#064e3b' },
  'Not started': { bg: '#e4e4e7', text: '#52525b' },
  'On hold':     { bg: '#fef3c7', text: '#92400e' },
  'Complete':    { bg: '#dbeafe', text: '#1e40af' },
}

const CATEGORIES = ['All', 'Clinical', 'Academic', 'Entrepreneurial', 'Career']
const STATUSES = ['Not started', 'In progress', 'On hold', 'Complete']

const today = () => {
  const d = new Date()
  return d.getDate() + ' ' + d.toLocaleString('en-GB', { month: 'short' }) + ' ' + d.getFullYear()
}

function Badge({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 9999,
      fontSize: 11, fontWeight: 600, background: bg, color: text
    }}>{label}</span>
  )
}

function PhaseBar({ phases, cp }: { phases: string[]; cp: number }) {
  if (!phases.length) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {phases.map((p, i) => (
          <div key={i} style={{
            flex: 1, height: 5, borderRadius: 3,
            background: i < cp ? '#059669' : i === cp ? '#86efac' : '#e4e4e7'
          }} title={p} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: '#71717a', marginTop: 3 }}>
        {phases[cp] ?? 'Complete'} ({cp}/{phases.length})
      </div>
    </div>
  )
}

function Tag({ icon, value }: { icon: string; value: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#52525b', marginTop: 4 }}>
      <span>{icon}</span><span>{value}</span>
    </div>
  )
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const cat = CAT_COLOURS[project.cat] ?? CAT_COLOURS.Clinical
  const status = STATUS_COLOURS[project.status] ?? STATUS_COLOURS['Not started']
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 12, padding: 16,
      borderLeft: `4px solid ${cat.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.07)', cursor: 'pointer',
      transition: 'box-shadow 0.15s',
      marginBottom: 12
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#18181b', lineHeight: 1.4 }}>{project.title}</div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <Badge label={project.cat} bg={cat.bg} text={cat.text} />
          <Badge label={project.status} bg={status.bg} text={status.text} />
        </div>
      </div>
      {project.next && (
        <div style={{ fontSize: 12, color: '#3f3f46', marginTop: 6, fontStyle: 'italic' }}>
          Next: {project.next}
        </div>
      )}
      <PhaseBar phases={project.phases} cp={project.cp} />
      <Tag icon="📅" value={project.dl} />
      <Tag icon="🚧" value={project.block} />
      <Tag icon="👤" value={project.who} />
    </div>
  )
}

function Modal({ project, onClose, onSave, onDelete }: {
  project: Project | null
  onClose: () => void
  onSave: (p: Project) => Promise<void>
  onDelete: (id: number) => Promise<void>
}) {
  const [form, setForm] = useState<Project | null>(null)
  const [newPhase, setNewPhase] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(project ? { ...project, phases: [...project.phases], log: [...project.log] } : null)
  }, [project])

  if (!form) return null

  const set = (key: keyof Project, val: any) => setForm(f => f ? { ...f, [key]: val } : f)

  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!form || !confirm('Delete this project?')) return
    await onDelete(form.id)
    onClose()
  }

  const addPhase = () => {
    if (!newPhase.trim()) return
    set('phases', [...form.phases, newPhase.trim()])
    setNewPhase('')
  }

  const removePhase = (i: number) => {
    const phases = form.phases.filter((_, idx) => idx !== i)
    set('phases', phases)
    if (form.cp >= phases.length) set('cp', Math.max(0, phases.length - 1))
  }

  const movePhase = (i: number, dir: -1 | 1) => {
    const phases = [...form.phases]
    const j = i + dir
    if (j < 0 || j >= phases.length) return
    ;[phases[i], phases[j]] = [phases[j], phases[i]]
    set('phases', phases)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 640,
        maxHeight: '90vh', overflowY: 'auto', padding: 28
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#18181b' }}>
            {form.id ? 'Edit Project' : 'New Project'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#71717a' }}>✕</button>
        </div>

        <Field label="Title">
          <input value={form.title} onChange={e => set('title', e.target.value)} style={inputStyle} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Category">
            <select value={form.cat} onChange={e => set('cat', e.target.value)} style={inputStyle}>
              {['Clinical','Academic','Entrepreneurial','Career'].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Deadline">
            <input value={form.dl} onChange={e => set('dl', e.target.value)} style={inputStyle} placeholder="e.g. 30 Sep 2026" />
          </Field>
          <Field label="Assigned to">
            <input value={form.who} onChange={e => set('who', e.target.value)} style={inputStyle} />
          </Field>
        </div>

        <Field label="Next step">
          <input value={form.next} onChange={e => set('next', e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Last action (adding text here logs an entry)">
          <input value={form.last} onChange={e => set('last', e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Blocker">
          <input value={form.block} onChange={e => set('block', e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Phases">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {form.phases.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ flex: 1, fontSize: 13, color: '#18181b' }}>{p}</span>
                <button onClick={() => movePhase(i, -1)} style={smallBtn}>↑</button>
                <button onClick={() => movePhase(i, 1)} style={smallBtn}>↓</button>
                <button onClick={() => removePhase(i)} style={{ ...smallBtn, color: '#ef4444' }}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <input
                value={newPhase}
                onChange={e => setNewPhase(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPhase()}
                placeholder="Add phase..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={addPhase} style={{ ...smallBtn, background: '#f4f4f5', padding: '6px 12px' }}>Add</button>
            </div>
          </div>
        </Field>

        <Field label={`Current phase (${form.cp + 1} of ${form.phases.length || 1})`}>
          <input
            type="range" min={0} max={Math.max(0, form.phases.length - 1)}
            value={form.cp} onChange={e => set('cp', Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: 12, color: '#71717a' }}>{form.phases[form.cp] ?? 'None'}</div>
        </Field>

        {form.log.length > 0 && (
          <Field label="Activity log">
            <div style={{ maxHeight: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[...form.log].reverse().map((entry, i) => (
                <div key={i} style={{ fontSize: 12, color: '#52525b', borderLeft: '2px solid #e4e4e7', paddingLeft: 8 }}>
                  <span style={{ fontWeight: 600 }}>{entry.d}</span> — {entry.n}
                </div>
              ))}
            </div>
          </Field>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          {form.id ? (
            <button onClick={handleDelete} style={{
              background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
              borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14
            }}>Delete project</button>
          ) : <div />}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{
              background: '#f4f4f5', color: '#52525b', border: 'none',
              borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14
            }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{
              background: '#059669', color: '#fff', border: 'none',
              borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              opacity: saving ? 0.7 : 1
            }}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#71717a', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', border: '1px solid #e4e4e7',
  borderRadius: 8, fontSize: 14, color: '#18181b', background: '#fafafa',
  boxSizing: 'border-box'
}

const smallBtn: React.CSSProperties = {
  background: 'none', border: '1px solid #e4e4e7', borderRadius: 6,
  padding: '2px 7px', cursor: 'pointer', fontSize: 12, color: '#52525b'
}

export default function CommandCentre() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('All')
  const [view, setView] = useState<'board' | 'list'>('board')
  const [selected, setSelected] = useState<Project | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchProjects = useCallback(async () => {
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const filtered = projects.filter(p => cat === 'All' || p.cat === cat)

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'In progress').length,
    blockers: projects.filter(p => p.block).length,
    deadlines: projects.filter(p => p.dl).length,
  }

  const openNew = () => {
    setSelected({
      id: 0, title: '', cat: 'Clinical', status: 'Not started',
      phases: [], cp: 0, next: '', last: '', dl: '', who: '', block: '', log: []
    })
    setModalOpen(true)
  }

  const openEdit = (p: Project) => { setSelected(p); setModalOpen(true) }

  const handleSave = async (form: Project) => {
    const prevLast = projects.find(p => p.id === form.id)?.last ?? ''
    let log = form.log
    if (form.last && form.last !== prevLast) {
      log = [...form.log, { d: today(), n: form.last }]
    }
    const payload = { ...form, log }

    if (form.id) {
      await fetch('/api/projects', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } else {
      const { id: _id, ...body } = payload
      await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    await fetchProjects()
  }

  const handleDelete = async (id: number) => {
    await fetch('/api/projects', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await fetchProjects()
  }

  const boardCols = STATUSES.map(s => ({
    status: s,
    items: filtered.filter(p => p.status === s)
  }))

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f5' }}>
      {/* Top bar */}
      <div style={{ background: '#1c1c1e', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>Command Centre</div>
        <button onClick={openNew} style={{
          background: '#059669', color: '#fff', border: 'none', borderRadius: 8,
          padding: '7px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14
        }}>+ New project</button>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total projects', value: stats.total },
            { label: 'In progress', value: stats.inProgress },
            { label: 'Blockers', value: stats.blockers },
            { label: 'Deadlines', value: stats.deadlines },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 10, padding: '12px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', minWidth: 100
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#18181b' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#71717a' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + view toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 13,
                background: cat === c ? '#1c1c1e' : '#fff',
                color: cat === c ? '#fff' : '#52525b',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
              }}>{c}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, background: '#fff', borderRadius: 8, padding: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {(['board', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 13, textTransform: 'capitalize',
                background: view === v ? '#1c1c1e' : 'transparent',
                color: view === v ? '#fff' : '#52525b'
              }}>{v}</button>
            ))}
          </div>
        </div>

        {loading && <div style={{ textAlign: 'center', color: '#71717a', padding: 40 }}>Loading...</div>}

        {/* Board view */}
        {!loading && view === 'board' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>
            {boardCols.map(col => {
              const status = STATUS_COLOURS[col.status]
              return (
                <div key={col.status}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Badge label={col.status} bg={status.bg} text={status.text} />
                    <span style={{ fontSize: 12, color: '#71717a', fontWeight: 600 }}>{col.items.length}</span>
                  </div>
                  {col.items.map(p => <ProjectCard key={p.id} project={p} onClick={() => openEdit(p)} />)}
                </div>
              )
            })}
          </div>
        )}

        {/* List view */}
        {!loading && view === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(p => <ProjectCard key={p.id} project={p} onClick={() => openEdit(p)} />)}
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal
          project={selected}
          onClose={() => { setModalOpen(false); setSelected(null) }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
