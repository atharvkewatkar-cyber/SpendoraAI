import { useState } from 'react'
import { User, Bell, Palette, Database, DollarSign, Check, RotateCcw, Trash2, Sun, Moon, Monitor, RefreshCw } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import Modal from '../components/Modal'

function CurrencySection() {
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><DollarSign size={17} /> Currency</h3>
      <div className="input sm:w-64 flex items-center">Indian Rupee (₹)</div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">All expenses, income, budgets and reports are displayed in Indian Rupees (₹).</p>
    </div>
  )
}

export default function Settings() {
  const { userName, setUserName, notifications, setNotifications, resetDemoData, clearAllData, transactions, goals, budgets } = useData()
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState(userName)
  const [savedProfile, setSavedProfile] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)

  const saveProfile = (e) => {
    e.preventDefault()
    setUserName(name)
    setSavedProfile(true)
    setTimeout(() => setSavedProfile(false), 1800)
  }

  const toggleNotif = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your profile, preferences and data</p>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><User size={17} /> Profile</h3>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-mint-500 text-white text-xl font-bold flex items-center justify-center">
              {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <label className="label">Display Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary text-sm">
            {savedProfile ? <><Check size={15} /> Saved</> : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Palette size={17} /> Appearance</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${theme === id ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40' : 'border-slate-200 dark:border-slate-700'}`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
          <button
            onClick={() => setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
          >
            <Monitor size={20} />
            <span className="text-xs font-medium">System</span>
          </button>
        </div>
      </div>

      {/* Currency */}
      <CurrencySection />

      {/* Notifications */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Bell size={17} /> Notifications</h3>
        <div className="space-y-3">
          {[
            { key: 'budgetAlerts', label: 'Budget Alerts', desc: 'Notify me when I approach or exceed a budget' },
            { key: 'weeklySummary', label: 'Weekly Summary', desc: 'Receive a weekly spending recap' },
            { key: 'anomalyAlerts', label: 'Anomaly Alerts', desc: 'Notify me of unusual transactions' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{n.label}</p>
                <p className="text-xs text-slate-400">{n.desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(n.key)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${notifications[n.key] ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifications[n.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data management */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Database size={17} /> Data Management</h3>
        <div className="grid grid-cols-3 gap-4 mb-5 text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-lg font-bold text-slate-800 dark:text-white">{transactions.length}</p>
            <p className="text-xs text-slate-400">Transactions</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-lg font-bold text-slate-800 dark:text-white">{budgets.length}</p>
            <p className="text-xs text-slate-400">Budgets</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-lg font-bold text-slate-800 dark:text-white">{goals.length}</p>
            <p className="text-xs text-slate-400">Goals</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setResetConfirm(true)} className="btn-secondary flex-1 text-sm">
            <RotateCcw size={15} /> Reset to Demo Data
          </button>
          <button onClick={() => setClearConfirm(true)} className="flex-1 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 font-medium px-4 py-2.5 text-sm flex items-center justify-center gap-2 transition-colors">
            <Trash2 size={15} /> Clear All Data
          </button>
        </div>
      </div>

      <Modal open={resetConfirm} onClose={() => setResetConfirm(false)} title="Reset to Demo Data" maxWidth="max-w-sm">
        <p className="text-sm text-slate-600 dark:text-slate-300">This will replace your current data with fresh demo transactions, budgets, and goals. Continue?</p>
        <div className="flex gap-2 mt-5">
          <button className="btn-secondary flex-1" onClick={() => setResetConfirm(false)}>Cancel</button>
          <button className="btn-primary flex-1" onClick={() => { resetDemoData(); setResetConfirm(false) }}>Reset Data</button>
        </div>
      </Modal>

      <Modal open={clearConfirm} onClose={() => setClearConfirm(false)} title="Clear All Data" maxWidth="max-w-sm">
        <p className="text-sm text-slate-600 dark:text-slate-300">This will permanently delete all your transactions, budgets, and goals. This cannot be undone.</p>
        <div className="flex gap-2 mt-5">
          <button className="btn-secondary flex-1" onClick={() => setClearConfirm(false)}>Cancel</button>
          <button className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5" onClick={() => { clearAllData(); setClearConfirm(false) }}>Clear Everything</button>
        </div>
      </Modal>
    </div>
  )
}
