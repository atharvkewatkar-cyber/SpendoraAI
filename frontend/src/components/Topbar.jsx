import { useNavigate } from 'react-router-dom'
import { Menu, Sun, Moon, Bell, Search, PlusCircle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Topbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme()
  const { userName } = useData()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/transactions?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={onMenuClick} className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-white shrink-0">
            <Menu size={22} />
          </button>
          <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search transactions, merchants..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-800 text-sm outline-none transition-all"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/add-expense')}
            className="hidden sm:inline-flex btn-primary text-sm py-2"
          >
            <PlusCircle size={16} /> Add Expense
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all active:scale-90"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all">
            <Bell size={19} />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
          </button>

          <button
            onClick={() => navigate('/settings')}
            title="Open profile settings"
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-mint-500 text-white text-xs font-bold flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            {initials}
          </button>
          <button onClick={logout} className="hidden sm:inline-flex btn-ghost text-xs" title="Sign out">Sign out</button>
        </div>
      </div>
    </header>
  )
}
