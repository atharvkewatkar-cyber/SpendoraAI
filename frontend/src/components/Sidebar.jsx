import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle, ArrowLeftRight, BarChart3, Wallet,
  PiggyBank, Bot, ScanLine, FileText, Settings, Sparkles, X
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/add-expense', label: 'Add Expense', icon: PlusCircle },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/budgets', label: 'Budgets', icon: Wallet },
  { to: '/goals', label: 'Savings Goals', icon: PiggyBank },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
  { to: '/scanner', label: 'Receipt Scanner', icon: ScanLine },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 z-40 flex flex-col
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-mint-500 flex items-center justify-center shadow-md">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white leading-tight">SpendoraAI</p>
              <p className="text-[11px] text-slate-400 leading-tight">Expense Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${isActive
                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-brand-600" />}
                  <Icon size={18} strokeWidth={2} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-br from-brand-600 to-mint-500 text-white">
          <p className="text-xs font-semibold flex items-center gap-1.5"><Sparkles size={13}/> AI-Powered</p>
          <p className="text-[11px] mt-1 text-white/85 leading-relaxed">Smart categorization & insights running on every transaction.</p>
        </div>
      </aside>
    </>
  )
}
