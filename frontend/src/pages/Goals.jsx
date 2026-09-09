import { useState } from 'react'
import { Plus, PiggyBank, Trash2, Check, Calendar, TrendingUp } from 'lucide-react'
import { useData } from '../context/DataContext'
import { formatCurrency, formatDate } from '../lib/format'
import DynamicIcon from '../components/DynamicIcon'
import Modal from '../components/Modal'

const ICON_OPTIONS = ['Target', 'Plane', 'Home', 'Laptop', 'ShieldCheck', 'Car', 'GraduationCap', 'Heart', 'Gift']
const COLOR_OPTIONS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#ef4444']

export default function Goals() {
  const { goals, addGoal, deleteGoal, contributeToGoal, currency } = useData()
  const [addOpen, setAddOpen] = useState(false)
  const [contributeGoal, setContributeGoal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Savings Goals</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track progress toward what matters to you</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary text-sm">
          <Plus size={15} /> New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card p-16 text-center">
          <PiggyBank size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">You don't have any savings goals yet.</p>
          <button onClick={() => setAddOpen(true)} className="btn-primary mx-auto">
            <Plus size={15} /> Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g, i) => {
            const pct = Math.min(100, Math.round((g.saved / g.target) * 100))
            const isComplete = g.saved >= g.target
            const daysLeft = Math.max(0, Math.ceil((new Date(g.deadline) - new Date()) / 86400000))
            const monthlyNeeded = daysLeft > 0 ? (g.target - g.saved) / (daysLeft / 30) : 0

            return (
              <div key={g.id} className="card p-5 card-hover animate-fadeInUp" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${g.color}22`, color: g.color }}>
                      <DynamicIcon name={g.icon} size={22} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{g.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={11} /> {daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setDeleteConfirm(g)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-100 dark:text-slate-800" />
                    <circle
                      cx="48" cy="48" r="40" stroke={g.color} strokeWidth="8" fill="none"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - pct / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-800 dark:text-white">{pct}%</span>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(g.saved, currency)}</p>
                  <p className="text-xs text-slate-400">of {formatCurrency(g.target, currency)} goal</p>
                </div>

                {isComplete ? (
                  <div className="badge bg-mint-50 dark:bg-mint-950/30 text-mint-600 w-full justify-center py-2">
                    <Check size={13} /> Goal Achieved!
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] text-slate-400 text-center mb-3 flex items-center justify-center gap-1">
                      <TrendingUp size={11} /> Save {formatCurrency(monthlyNeeded, currency)}/mo to hit your deadline
                    </p>
                    <button onClick={() => setContributeGoal(g)} className="btn-primary w-full text-sm py-2">
                      <Plus size={14} /> Add Funds
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create Savings Goal">
        <GoalForm onSave={(goal) => { addGoal(goal); setAddOpen(false) }} onClose={() => setAddOpen(false)} />
      </Modal>

      <Modal open={!!contributeGoal} onClose={() => setContributeGoal(null)} title="Add Funds" maxWidth="max-w-sm">
        {contributeGoal && (
          <ContributeForm
            goal={contributeGoal}
            currency={currency}
            onSave={(amount) => { contributeToGoal(contributeGoal.id, amount); setContributeGoal(null) }}
            onClose={() => setContributeGoal(null)}
          />
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Goal" maxWidth="max-w-sm">
        {deleteConfirm && (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
            <div className="flex gap-2 mt-5">
              <button className="btn-secondary flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5" onClick={() => { deleteGoal(deleteConfirm.id); setDeleteConfirm(null) }}>Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function GoalForm({ onSave, onClose }) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')
  const [deadline, setDeadline] = useState('')
  const [icon, setIcon] = useState('Target')
  const [color, setColor] = useState('#3b82f6')

  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ name, target, saved: saved || 0, deadline: new Date(deadline).toISOString(), icon, color }) }} className="space-y-4">
      <div>
        <label className="label">Goal Name</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dream Vacation" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Target Amount</label>
          <input className="input" type="number" min="1" value={target} onChange={e => setTarget(e.target.value)} required />
        </div>
        <div>
          <label className="label">Already Saved</label>
          <input className="input" type="number" min="0" value={saved} onChange={e => setSaved(e.target.value)} placeholder="0" />
        </div>
      </div>
      <div>
        <label className="label">Target Date</label>
        <input className="input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required />
      </div>
      <div>
        <label className="label">Icon</label>
        <div className="grid grid-cols-5 gap-2">
          {ICON_OPTIONS.map(ic => (
            <button type="button" key={ic} onClick={() => setIcon(ic)} className={`p-2.5 rounded-xl border flex items-center justify-center ${icon === ic ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40' : 'border-slate-200 dark:border-slate-700'}`}>
              <DynamicIcon name={ic} size={17} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Color</label>
        <div className="flex gap-2">
          {COLOR_OPTIONS.map(c => (
            <button type="button" key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-full ring-offset-2 dark:ring-offset-slate-900 transition-all" style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }} />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1">Create Goal</button>
      </div>
    </form>
  )
}

function ContributeForm({ goal, currency, onSave, onClose }) {
  const [amount, setAmount] = useState('')
  const remaining = goal.target - goal.saved
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(parseFloat(amount)) }} className="space-y-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">{formatCurrency(remaining, currency)} remaining for <strong>{goal.name}</strong></p>
      <div>
        <label className="label">Amount to Add</label>
        <input className="input" type="number" min="1" step="1" max={remaining} value={amount} onChange={e => setAmount(e.target.value)} required autoFocus />
      </div>
      <div className="flex gap-2 flex-wrap">
        {[50, 100, 250, 500].filter(v => v <= remaining).map(v => (
          <button type="button" key={v} onClick={() => setAmount(String(v))} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700">
            +{formatCurrency(v, currency)}
          </button>
        ))}
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1">Add Funds</button>
      </div>
    </form>
  )
}
