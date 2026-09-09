import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, WalletCards, UserRound, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const result = mode === 'login' ? login(email, password) : signup(name, email, password)
      if (!result.ok) setError(result.message)
      setLoading(false)
    }, 250)
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="hidden lg:flex relative overflow-hidden p-10 xl:p-14 bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 text-white">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-mint-400/10 blur-3xl" />
          <div className="relative z-10 flex flex-col justify-between w-full">
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                  <WalletCards size={23} />
                </div>
                <div>
                  <p className="font-bold text-xl">SpendoraAI</p>
                  <p className="text-xs text-white/65">Smart money, simpler life</p>
                </div>
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight">Your money.<br />Your control.</h1>
              <p className="mt-5 max-w-md text-white/75 leading-7">Track expenses, manage budgets, understand your spending and make smarter financial decisions — all in one place.</p>
            </div>
            <div className="space-y-4 text-sm text-white/80">
              {['Private account for your personal dashboard', 'Indian Rupee (₹) focused expense tracking', 'AI-powered insights and smart categorization'].map(item => (
                <div key={item} className="flex items-center gap-3"><ShieldCheck size={17} />{item}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 lg:p-12 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center"><WalletCards size={21} /></div>
              <div><p className="font-bold text-lg">SpendoraAI</p><p className="text-xs text-slate-400">Smart money, simpler life</p></div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{mode === 'login' ? 'Sign in to continue to your financial dashboard.' : 'Start managing your money in a few seconds.'}</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="label">Full name</label>
                  <div className="relative"><UserRound size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-10" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" /></div>
                </div>
              )}
              <div>
                <label className="label">Email address</label>
                <div className="relative"><Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-10" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative"><LockKeyhole size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-10 pr-11" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
              </div>

              {error && <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{error}</div>}

              <button disabled={loading} className="btn-primary w-full py-3.5 mt-2">
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <div className="text-center mt-7 text-sm text-slate-500 dark:text-slate-400">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button onClick={switchMode} className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">{mode === 'login' ? 'Create one' : 'Sign in'}</button>
            </div>

            <p className="text-center text-[11px] text-slate-400 mt-8">By continuing, you agree to use SpendoraAI responsibly for personal financial tracking.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
