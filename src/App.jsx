import { useState } from 'react'
import { useStorage } from './useStorage.js'
import { computeBalances, computeSettlements, fmt } from './calc.js'

// ─── constants ───────────────────────────────────────────────
const COLORS = ['#4F8EF7','#E67E22','#2ECC71','#9B59B6','#E74C3C','#1ABC9C','#F39C12','#3498DB']
const CATS   = ['🛒','🍽️','🏨','🚗','✈️','🎭','🎉','💊','🏋️','📱','⚡','🎁']

// ─── tiny design tokens ──────────────────────────────────────
const C = {
  navy:   '#1B2B4B',
  blue:   '#4F8EF7',
  bg:     '#F0F4FB',
  card:   '#FFFFFF',
  border: '#E8EDF4',
  muted:  '#94A3B8',
  text:   '#1B2B4B',
  sub:    '#64748B',
}

// ─── shared component styles ─────────────────────────────────
const S = {
  input: {
    width: '100%', padding: '13px 14px', borderRadius: 12,
    border: `1.5px solid ${C.border}`, fontSize: 16, outline: 'none',
    boxSizing: 'border-box', color: C.text, background: '#F7F9FC',
    WebkitAppearance: 'none',
  },
  btnPrimary: {
    background: C.navy, color: '#fff', border: 'none', borderRadius: 14,
    padding: '15px 0', cursor: 'pointer', fontWeight: 700, fontSize: 16,
    width: '100%', letterSpacing: 0.2,
  },
  btnSecondary: {
    background: C.bg, color: C.text, border: 'none', borderRadius: 14,
    padding: '15px 0', cursor: 'pointer', fontWeight: 600, fontSize: 15,
    width: '100%',
  },
  label: {
    fontSize: 11, fontWeight: 700, color: C.muted, display: 'block',
    marginBottom: 7, letterSpacing: 0.8, textTransform: 'uppercase',
  },
}

// ─── Avatar ──────────────────────────────────────────────────
function Avatar({ name = '?', color, size = 36 }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.38, letterSpacing: -0.5,
    }}>{initials}</div>
  )
}

// ─── Balance badge ────────────────────────────────────────────
function Badge({ amount }) {
  const pos = amount >= 0
  return (
    <span style={{
      background: pos ? '#D4F5E2' : '#FDE8E8',
      color: pos ? '#15803D' : '#B91C1C',
      borderRadius: 20, padding: '4px 11px', fontSize: 13, fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      {pos ? '+' : ''}€{fmt(Math.abs(amount))}
    </span>
  )
}

// ─── Bottom sheet modal ───────────────────────────────────────
function Sheet({ title, onClose, children, tall = false }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,20,45,.55)',
        zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.card, borderRadius: '20px 20px 0 0',
          paddingBottom: 'max(env(safe-area-inset-bottom), 20px)',
          maxHeight: tall ? '95vh' : '90vh', overflowY: 'auto',
          boxShadow: '0 -8px 40px rgba(0,0,0,.18)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px 16px' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{title}</span>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none',
            background: C.bg, fontSize: 18, cursor: 'pointer', color: C.sub,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        <div style={{ padding: '0 20px 8px' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm dialog ───────────────────────────────────────────
function Confirm({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,20,45,.6)',
      zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ background: C.card, borderRadius: 20, padding: 28, width: '100%', maxWidth: 320 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 20, textAlign: 'center' }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ ...S.btnSecondary, flex: 1 }}>Annuleren</button>
          <button onClick={onConfirm} style={{ ...S.btnPrimary, flex: 1, background: '#DC2626' }}>Verwijderen</button>
        </div>
      </div>
    </div>
  )
}

// ─── FAB ──────────────────────────────────────────────────────
function FAB({ onClick, icon = '+' }) {
  return (
    <button onClick={onClick} style={{
      position: 'fixed',
      bottom: 'max(env(safe-area-inset-bottom, 0px) + 20px, 24px)',
      right: 20,
      width: 58, height: 58, borderRadius: '50%',
      background: C.navy, border: 'none',
      boxShadow: '0 4px 20px rgba(27,43,75,.45)',
      cursor: 'pointer', fontSize: 28, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50,
    }}>{icon}</button>
  )
}

// ─── Section label ────────────────────────────────────────────
function SectionLabel({ children, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <label style={S.label}>{children}</label>
      {action}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
export default function App() {
  const { groups, setGroups } = useStorage()

  // navigation
  const [screen, setScreen]         = useState('home')  // 'home' | 'group'
  const [activeGroupId, setActiveGroupId] = useState(null)
  const [tab, setTab]               = useState('expenses')

  // sheets
  const [sheetNewGroup, setSheetNewGroup]   = useState(false)
  const [sheetAddExp,   setSheetAddExp]     = useState(false)
  const [sheetAddMember,setSheetAddMember]  = useState(false)
  const [sheetEditGroup,setSheetEditGroup]  = useState(false)

  // confirm dialogs
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(null) // groupId
  const [confirmDeleteExp,   setConfirmDeleteExp]   = useState(null) // expId

  // forms
  const [ngName,    setNgName]    = useState('')
  const [ngMembers, setNgMembers] = useState(['', ''])
  const [newMemberName, setNewMemberName] = useState('')
  const [editGroupName, setEditGroupName] = useState('')

  const [expForm, setExpForm] = useState({
    description: '', amount: '', paidBy: '', splitWith: [], category: '🛒',
  })

  // ── derived ──────────────────────────────────────────────────
  const activeGroup  = groups.find(g => g.id === activeGroupId) ?? null
  const balances     = activeGroup ? computeBalances(activeGroup.members, activeGroup.expenses) : {}
  const settlements  = activeGroup ? computeSettlements(activeGroup.members, balances) : []
  const totalSpent   = activeGroup ? activeGroup.expenses.reduce((s, e) => s + e.amount, 0) : 0
  const gm = id => activeGroup?.members.find(m => m.id === id)

  // ── navigation ───────────────────────────────────────────────
  function openGroup(id) {
    setActiveGroupId(id)
    setScreen('group')
    setTab('expenses')
  }

  // ── group actions ────────────────────────────────────────────
  function createGroup() {
    const names = ngMembers.filter(n => n.trim())
    if (!ngName.trim() || names.length < 2) return
    const members = names.map((name, i) => ({
      id: Date.now() + i,
      name: name.trim(),
      color: COLORS[i % COLORS.length],
    }))
    const g = { id: Date.now(), name: ngName.trim(), members, expenses: [], createdAt: new Date().toISOString() }
    setGroups(prev => [g, ...prev])
    setNgName(''); setNgMembers(['', ''])
    setSheetNewGroup(false)
    openGroup(g.id)
  }

  function saveGroupName() {
    if (!editGroupName.trim()) return
    setGroups(prev => prev.map(g => g.id === activeGroupId ? { ...g, name: editGroupName.trim() } : g))
    setSheetEditGroup(false)
  }

  function doDeleteGroup(id) {
    setGroups(prev => prev.filter(g => g.id !== id))
    setConfirmDeleteGroup(null)
    if (activeGroupId === id) setScreen('home')
  }

  // ── member actions ───────────────────────────────────────────
  function addMember() {
    if (!newMemberName.trim()) return
    const m = {
      id: Date.now(),
      name: newMemberName.trim(),
      color: COLORS[activeGroup.members.length % COLORS.length],
    }
    setGroups(prev => prev.map(g => g.id === activeGroupId ? { ...g, members: [...g.members, m] } : g))
    setNewMemberName('')
    setSheetAddMember(false)
  }

  // ── expense actions ──────────────────────────────────────────
  function openAddExpense() {
    setExpForm({
      description: '',
      amount: '',
      paidBy: String(activeGroup.members[0]?.id ?? ''),
      splitWith: activeGroup.members.map(m => m.id),
      category: '🛒',
    })
    setSheetAddExp(true)
  }

  function addExpense() {
    const { description, amount, paidBy, splitWith, category } = expForm
    if (!description.trim() || !amount || !paidBy || splitWith.length === 0) return
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) return

    const exp = {
      id: Date.now(),
      description: description.trim(),
      amount: parsed,
      paidBy: Number(paidBy),
      splitWith: splitWith.map(Number),
      date: new Date().toISOString().split('T')[0],
      category,
    }
    setGroups(prev => prev.map(g =>
      g.id === activeGroupId ? { ...g, expenses: [exp, ...g.expenses] } : g
    ))
    setSheetAddExp(false)
  }

  function doDeleteExpense(eid) {
    setGroups(prev => prev.map(g =>
      g.id === activeGroupId ? { ...g, expenses: g.expenses.filter(e => e.id !== eid) } : g
    ))
    setConfirmDeleteExp(null)
  }

  function toggleSplit(mid) {
    setExpForm(p => ({
      ...p,
      splitWith: p.splitWith.includes(mid)
        ? p.splitWith.filter(x => x !== mid)
        : [...p.splitWith, mid],
    }))
  }

  // ══════════════════════════════════════════════════════════════
  // HOME SCREEN
  // ══════════════════════════════════════════════════════════════
  if (screen === 'home') return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: C.bg, maxWidth: 480, margin: '0 auto',
    }}>
      {/* Status bar area */}
      <div style={{
        background: C.navy,
        paddingTop: 'env(safe-area-inset-top, 44px)',
        flexShrink: 0,
      }}>
        <div style={{ padding: '18px 20px 20px' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
            💸 SplitMate
          </div>
          <div style={{ fontSize: 13, color: '#7FA8D0', marginTop: 2 }}>
            Kosten slim verdelen
          </div>
        </div>
      </div>

      {/* Group list */}
      <div className="scroll-hide" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px' }}>
        {groups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏝️</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 6 }}>
              Nog geen groepen
            </div>
            <div style={{ fontSize: 14 }}>Tik op + om een groep aan te maken</div>
          </div>
        ) : (
          groups.map(g => {
            const bal = computeBalances(g.members, g.expenses)
            const total = g.expenses.reduce((s, e) => s + e.amount, 0)
            const emoji = g.name.match(/\p{Emoji_Presentation}/u)?.[0] ?? '👥'
            return (
              <div
                key={g.id}
                style={{
                  background: C.card, borderRadius: 16, padding: '16px',
                  marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,.07)',
                  border: `1px solid ${C.border}`, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 14,
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none',
                }}
              >
                <div
                  onClick={() => openGroup(g.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}
                >
                  <div style={{
                    width: 48, height: 48, background: C.bg, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, flexShrink: 0,
                  }}>{emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: 15, color: C.text,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                      {g.members.length} leden · {g.expenses.length} uitgaven
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>€{fmt(total)}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>totaal</div>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmDeleteGroup(g.id)}
                  style={{
                    border: 'none', background: '#FEF2F2', borderRadius: 8,
                    width: 32, height: 32, cursor: 'pointer', color: '#EF4444',
                    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >🗑️</button>
              </div>
            )
          })
        )}
      </div>

      <FAB onClick={() => setSheetNewGroup(true)} />

      {/* Sheet: nieuwe groep */}
      {sheetNewGroup && (
        <Sheet title="Nieuwe groep" onClose={() => setSheetNewGroup(false)}>
          <label style={S.label}>GROEPSNAAM</label>
          <input
            style={{ ...S.input, marginBottom: 18 }}
            placeholder="bijv. Vakantie Spanje 🇪🇸"
            value={ngName}
            onChange={e => setNgName(e.target.value)}
          />
          <SectionLabel>LEDEN (min. 2)</SectionLabel>
          {ngMembers.map((name, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                style={{ ...S.input, flex: 1 }}
                placeholder={`Persoon ${i + 1}`}
                value={name}
                onChange={e => setNgMembers(p => p.map((n, j) => j === i ? e.target.value : n))}
              />
              {ngMembers.length > 2 && (
                <button
                  onClick={() => setNgMembers(p => p.filter((_, j) => j !== i))}
                  style={{ ...S.btnSecondary, width: 44, padding: 0, borderRadius: 12, flexShrink: 0 }}
                >×</button>
              )}
            </div>
          ))}
          <button
            onClick={() => setNgMembers(p => [...p, ''])}
            style={{ ...S.btnSecondary, marginBottom: 20 }}
          >+ Lid toevoegen</button>
          <button onClick={createGroup} style={S.btnPrimary}>Groep aanmaken</button>
        </Sheet>
      )}

      {/* Confirm delete group */}
      {confirmDeleteGroup && (
        <Confirm
          message="Groep en alle uitgaven verwijderen?"
          onConfirm={() => doDeleteGroup(confirmDeleteGroup)}
          onCancel={() => setConfirmDeleteGroup(null)}
        />
      )}
    </div>
  )

  // ══════════════════════════════════════════════════════════════
  // GROUP SCREEN
  // ══════════════════════════════════════════════════════════════
  if (!activeGroup) { setScreen('home'); return null }

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: C.bg, maxWidth: 480, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        background: C.navy,
        paddingTop: 'env(safe-area-inset-top, 44px)',
        flexShrink: 0,
      }}>
        <div style={{ padding: '14px 16px 0' }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <button
              onClick={() => setScreen('home')}
              style={{
                background: 'rgba(255,255,255,.12)', border: 'none', borderRadius: 10,
                width: 38, height: 38, cursor: 'pointer', color: '#fff', fontSize: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >←</button>
            <div
              style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
              onClick={() => { setEditGroupName(activeGroup.name); setSheetEditGroup(true) }}
            >
              <div style={{
                fontSize: 17, fontWeight: 800, color: '#fff',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{activeGroup.name}</div>
              <div style={{ fontSize: 12, color: '#7FA8D0', marginTop: 1 }}>
                €{fmt(totalSpent)} · {activeGroup.members.length} leden
              </div>
            </div>
            <button
              onClick={() => setSheetAddMember(true)}
              style={{
                background: 'rgba(255,255,255,.12)', border: 'none', borderRadius: 10,
                width: 38, height: 38, cursor: 'pointer', color: '#fff', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >👤+</button>
          </div>

          {/* Avatar strip */}
          <div
            className="scroll-hide"
            style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 14 }}
          >
            {activeGroup.members.map(m => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <Avatar name={m.name} color={m.color} size={36} />
                <div style={{
                  fontSize: 10, color: '#7FA8D0',
                  maxWidth: 48, overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', textAlign: 'center',
                }}>{m.name.split(' ')[0]}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,.08)',
            borderRadius: '12px 12px 0 0', padding: '4px 4px 0',
          }}>
            {[['expenses','Uitgaven'],['balances','Saldo\'s'],['settle','Verrekenen']].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  flex: 1, border: 'none', padding: '10px 0', cursor: 'pointer',
                  fontSize: 13, fontWeight: tab === k ? 700 : 500,
                  borderRadius: '10px 10px 0 0',
                  background: tab === k ? C.bg : 'transparent',
                  color: tab === k ? C.navy : 'rgba(255,255,255,.65)',
                  transition: 'background .15s',
                }}
              >{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="scroll-hide" style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 100px' }}>

        {/* ── UITGAVEN ── */}
        {tab === 'expenses' && (
          <>
            {activeGroup.expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
                <div style={{ fontWeight: 600, fontSize: 16, color: C.text }}>Nog geen uitgaven</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Tik op + om een uitgave toe te voegen</div>
              </div>
            ) : (
              activeGroup.expenses.map(exp => {
                const payer = gm(exp.paidBy)
                const perPerson = exp.amount / exp.splitWith.length
                return (
                  <div
                    key={exp.id}
                    style={{
                      background: C.card, borderRadius: 14, padding: '14px',
                      marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,.06)',
                      border: `1px solid ${C.border}`, display: 'flex', gap: 12, alignItems: 'center',
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, background: C.bg, borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, flexShrink: 0,
                    }}>{exp.category}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600, fontSize: 14, color: C.text,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{exp.description}</div>
                      <div style={{ fontSize: 12, color: C.sub, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Avatar name={payer?.name ?? '?'} color={payer?.color ?? '#ccc'} size={14} />
                        {payer?.name ?? '?'} · {exp.splitWith.length}p · €{fmt(perPerson)}/p
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>€{fmt(exp.amount)}</div>
                      <button
                        onClick={() => setConfirmDeleteExp(exp.id)}
                        style={{
                          border: 'none', background: 'none', cursor: 'pointer',
                          fontSize: 15, padding: '2px 0 0', color: C.muted,
                        }}
                      >🗑️</button>
                    </div>
                  </div>
                )
              })
            )}
          </>
        )}

        {/* ── SALDO'S ── */}
        {tab === 'balances' && (
          <>
            {activeGroup.members.map(m => {
              const bal   = balances[m.id] ?? 0
              const paid  = activeGroup.expenses
                .filter(e => e.paidBy === m.id)
                .reduce((s, e) => s + e.amount, 0)
              const share = activeGroup.expenses
                .reduce((s, e) => e.splitWith.includes(m.id) ? s + e.amount / e.splitWith.length : s, 0)
              return (
                <div
                  key={m.id}
                  style={{
                    background: C.card, borderRadius: 14, padding: '16px',
                    marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,.06)',
                    border: `1px solid ${C.border}`,
                    borderLeft: `4px solid ${m.color}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Avatar name={m.name} color={m.color} size={42} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                        {Math.abs(bal) < 0.01
                          ? 'Alles verrekend ✅'
                          : bal > 0 ? 'Krijgt terug' : 'Moet betalen'}
                      </div>
                    </div>
                    <Badge amount={bal} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[['Betaald', paid],['Aandeel', share]].map(([lbl, val]) => (
                      <div key={lbl} style={{
                        flex: 1, background: C.bg, borderRadius: 10,
                        padding: '9px 10px', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>{lbl}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginTop: 3 }}>€{fmt(val)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* ── VERREKENEN ── */}
        {tab === 'settle' && (
          <>
            {settlements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 14 }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: 17, color: C.text }}>Alles verrekend!</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>
                  Niemand heeft nog openstaande schulden
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 13, color: C.sub, marginBottom: 14 }}>
                  Minimale betalingen om alles glad te trekken:
                </div>
                {settlements.map((tx, i) => (
                  <div
                    key={i}
                    style={{
                      background: C.card, borderRadius: 14, padding: '16px',
                      marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,.06)',
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <Avatar name={tx.fromName} color={tx.fromColor} size={38} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: C.muted }}>betaalt aan</div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>
                          {tx.fromName} → {tx.toName}
                        </div>
                      </div>
                      <Avatar name={tx.toName} color={tx.toColor} size={38} />
                    </div>
                    <div style={{
                      background: C.bg, borderRadius: 10, padding: '10px',
                      textAlign: 'center',
                    }}>
                      <span style={{ fontWeight: 800, fontSize: 22, color: C.text }}>
                        €{fmt(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* FAB — only on expenses tab */}
      {tab === 'expenses' && <FAB onClick={openAddExpense} />}

      {/* ── SHEET: uitgave toevoegen ── */}
      {sheetAddExp && (
        <Sheet title="Uitgave toevoegen" onClose={() => setSheetAddExp(false)} tall>
          <label style={S.label}>CATEGORIE</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {CATS.map(cat => (
              <button
                key={cat}
                onClick={() => setExpForm(p => ({ ...p, category: cat }))}
                style={{
                  width: 44, height: 44, borderRadius: 10, fontSize: 22, cursor: 'pointer',
                  border: expForm.category === cat ? `2.5px solid ${C.blue}` : `1.5px solid ${C.border}`,
                  background: expForm.category === cat ? '#EFF6FF' : C.bg,
                }}
              >{cat}</button>
            ))}
          </div>

          <label style={S.label}>OMSCHRIJVING</label>
          <input
            style={{ ...S.input, marginBottom: 14 }}
            placeholder="bijv. Hotel, Benzine, Boodschappen…"
            value={expForm.description}
            onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))}
          />

          <label style={S.label}>BEDRAG (€)</label>
          <input
            style={{ ...S.input, fontSize: 22, fontWeight: 700, marginBottom: 14 }}
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={expForm.amount}
            onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))}
          />

          <label style={S.label}>BETAALD DOOR</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {activeGroup.members.map(m => {
              const sel = String(expForm.paidBy) === String(m.id)
              return (
                <button
                  key={m.id}
                  onClick={() => setExpForm(p => ({ ...p, paidBy: String(m.id) }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '9px 14px', borderRadius: 22,
                    border: sel ? `2.5px solid ${m.color}` : `1.5px solid ${C.border}`,
                    background: sel ? m.color + '22' : C.bg,
                    cursor: 'pointer', fontSize: 14,
                    fontWeight: sel ? 700 : 500,
                    color: sel ? m.color : C.sub,
                  }}
                >
                  <Avatar name={m.name} color={m.color} size={22} />
                  {m.name.split(' ')[0]}
                </button>
              )
            })}
          </div>

          <SectionLabel action={
            <button
              onClick={() => setExpForm(p => ({ ...p, splitWith: activeGroup.members.map(m => m.id) }))}
              style={{ fontSize: 13, color: C.blue, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
            >Iedereen</button>
          }>VERDELEN MET</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {activeGroup.members.map(m => {
              const sel = expForm.splitWith.includes(m.id)
              return (
                <button
                  key={m.id}
                  onClick={() => toggleSplit(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '9px 14px', borderRadius: 22,
                    border: sel ? `2.5px solid ${m.color}` : `1.5px solid ${C.border}`,
                    background: sel ? m.color + '22' : C.bg,
                    cursor: 'pointer', fontSize: 14,
                    fontWeight: sel ? 700 : 500,
                    color: sel ? m.color : C.sub,
                  }}
                >
                  <Avatar name={m.name} color={m.color} size={22} />
                  {m.name.split(' ')[0]}
                </button>
              )
            })}
          </div>

          {expForm.splitWith.length > 0 && expForm.amount && !isNaN(parseFloat(expForm.amount)) && (
            <div style={{ fontSize: 13, color: C.sub, marginBottom: 18, marginTop: 4 }}>
              €{fmt(parseFloat(expForm.amount) / expForm.splitWith.length)} per persoon
            </div>
          )}

          <button onClick={addExpense} style={{ ...S.btnPrimary, marginTop: 8 }}>Toevoegen</button>
        </Sheet>
      )}

      {/* ── SHEET: lid toevoegen ── */}
      {sheetAddMember && (
        <Sheet title="Lid toevoegen" onClose={() => setSheetAddMember(false)}>
          <label style={S.label}>NAAM</label>
          <input
            style={{ ...S.input, marginBottom: 20 }}
            placeholder="Naam van het lid"
            value={newMemberName}
            onChange={e => setNewMemberName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMember()}
            autoFocus
          />
          <button onClick={addMember} style={S.btnPrimary}>Toevoegen</button>
        </Sheet>
      )}

      {/* ── SHEET: groepsnaam bewerken ── */}
      {sheetEditGroup && (
        <Sheet title="Groep bewerken" onClose={() => setSheetEditGroup(false)}>
          <label style={S.label}>NAAM</label>
          <input
            style={{ ...S.input, marginBottom: 20 }}
            value={editGroupName}
            onChange={e => setEditGroupName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveGroupName()}
            autoFocus
          />
          <button onClick={saveGroupName} style={{ ...S.btnPrimary, marginBottom: 10 }}>Opslaan</button>
          <button
            onClick={() => { setSheetEditGroup(false); setConfirmDeleteGroup(activeGroupId) }}
            style={{ ...S.btnSecondary, color: '#DC2626' }}
          >Groep verwijderen</button>
        </Sheet>
      )}

      {/* Confirm delete expense */}
      {confirmDeleteExp && (
        <Confirm
          message="Uitgave verwijderen?"
          onConfirm={() => doDeleteExpense(confirmDeleteExp)}
          onCancel={() => setConfirmDeleteExp(null)}
        />
      )}

      {/* Confirm delete group (from within group screen) */}
      {confirmDeleteGroup && (
        <Confirm
          message="Groep en alle uitgaven verwijderen?"
          onConfirm={() => doDeleteGroup(confirmDeleteGroup)}
          onCancel={() => setConfirmDeleteGroup(null)}
        />
      )}
    </div>
  )
}
