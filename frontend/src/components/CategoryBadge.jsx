import { getCategory } from '../lib/categories'
import DynamicIcon from './DynamicIcon'

export default function CategoryBadge({ categoryId, size = 'md' }) {
  const cat = getCategory(categoryId)
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }
  return (
    <span
      className={`badge ${sizes[size]}`}
      style={{ backgroundColor: `${cat.color}1a`, color: cat.color }}
    >
      <DynamicIcon name={cat.icon} size={size === 'sm' ? 11 : 13} />
      {cat.label}
    </span>
  )
}

export function CategoryIconCircle({ categoryId, size = 40 }) {
  const cat = getCategory(categoryId)
  return (
    <div
      className="rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${cat.color}1a`, width: size, height: size, color: cat.color }}
    >
      <DynamicIcon name={cat.icon} size={size * 0.45} />
    </div>
  )
}
