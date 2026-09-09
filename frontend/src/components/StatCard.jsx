import DynamicIcon from './DynamicIcon'

export default function StatCard({ label, value, icon, trend, trendUp, accent = 'brand', delay = 0 }) {
  const accents = {
    brand: 'from-brand-500 to-brand-600 text-brand-600 bg-brand-50 dark:bg-brand-950/40',
    mint: 'from-mint-400 to-mint-600 text-mint-600 bg-mint-50 dark:bg-mint-950/30',
    rose: 'from-rose-400 to-rose-600 text-rose-600 bg-rose-50 dark:bg-rose-950/30',
    amber: 'from-amber-400 to-amber-600 text-amber-600 bg-amber-50 dark:bg-amber-950/30',
  }
  return (
    <div
      className="card card-hover p-5 animate-fadeInUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1.5 text-slate-900 dark:text-white tracking-tight">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accents[accent].split(' ').slice(2).join(' ')}`}>
          <DynamicIcon name={icon} size={20} className={accents[accent].split(' ')[2]} />
        </div>
      </div>
      {trend && (
        <p className={`text-xs mt-3 font-medium flex items-center gap-1 ${trendUp ? 'text-mint-600' : 'text-rose-500'}`}>
          <DynamicIcon name={trendUp ? 'TrendingUp' : 'TrendingDown'} size={13} />
          {trend}
        </p>
      )}
    </div>
  )
}
