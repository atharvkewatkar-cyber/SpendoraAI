import * as Icons from 'lucide-react'

export default function DynamicIcon({ name, size = 18, className = '', ...props }) {
  const Icon = Icons[name] || Icons.Circle
  return <Icon size={size} className={className} {...props} />
}
