import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AddExpense from './pages/AddExpense'
import Transactions from './pages/Transactions'
import Analytics from './pages/Analytics'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'
import Assistant from './pages/Assistant'
import Scanner from './pages/Scanner'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import { useAuth } from './context/AuthContext'

function ProtectedApp() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  const { isAuthenticated } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="*" element={<ProtectedApp />} />
    </Routes>
  )
}
