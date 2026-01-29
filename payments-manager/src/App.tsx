import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './components/Layout/AppLayout'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard'
import PaymentList from './pages/Payments/PaymentList'
import PaymentForm from './pages/Payments/PaymentForm'
import DebtsByPerson from './pages/Debts/DebtsByPerson'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="payments" element={<PaymentList />} />
          <Route path="payments/new" element={<PaymentForm />} />
          <Route path="payments/:id/edit" element={<PaymentForm />} />
          <Route path="debts" element={<DebtsByPerson />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
