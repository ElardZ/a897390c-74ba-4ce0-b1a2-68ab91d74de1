import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Receipt, LogOut, Users } from 'lucide-react'

export default function AppLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  }

  return (
    <div className='flex h-screen bg-gray-100 dark:bg-gray-900'>
      <aside className='w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700'>
        <div className='p-6'>
          <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>PayManager</h1>
        </div>
        <nav className='mt-6 px-4 space-y-2'>
          <Link to='/' className='flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'>
            <LayoutDashboard className='w-5 h-5 mr-3' />
            Inicio
          </Link>
          <Link to='/payments' className='flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'>
            <Receipt className='w-5 h-5 mr-3' />
            Pagos
          </Link>
          <Link to='/debts' className='flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'>
             <Users className='w-5 h-5 mr-3' />
             Deudas
          </Link>
          <button onClick={handleSignOut} className='w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-8'>
            <LogOut className='w-5 h-5 mr-3' />
            Cerrar Sesión
          </button>
        </nav>
      </aside>
      <main className='flex-1 overflow-y-auto p-8'>
        <Outlet />
      </main>
    </div>
  )
}
