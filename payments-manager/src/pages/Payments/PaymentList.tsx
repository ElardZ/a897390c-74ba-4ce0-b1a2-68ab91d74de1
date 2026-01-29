import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Loader2, Edit, Trash2 } from 'lucide-react';

export default function PaymentList() {
  const [searchParams] = useSearchParams();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      setPayments(data || []);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError('Error cargando datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este pago? Se borrarán también todos sus reembolsos.')) return;
    
    try {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw error;
      setPayments(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const filteredPayments = payments.filter(p => {
    if (!p) return false;
    const term = searchTerm.toLowerCase();
    const service = (p.service_name || '').toLowerCase();
    const beneficiary = (p.beneficiary || '').toLowerCase();
    return service.includes(term) || beneficiary.includes(term);
  });

  const safeFormatCurrency = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return 'S/ 0.00';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(num);
  };

  const safeFormatDate = (val: any) => {
    if (!val) return '-';
    const parts = val.split('-');
    if (parts.length !== 3) return val;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div>
      <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
        <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>Historial de Pagos</h2>
        <Link to='/payments/new' className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition'>
           <Plus className='w-5 h-5 mr-2' />
           Nuevo Pago
        </Link>
      </div>
      
      <div className='mb-6'>
         <div className='relative max-w-md'>
            <span className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search className='h-5 w-5 text-gray-400' />
            </span>
            <input 
              type='text' 
              className='block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Buscar...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-100 dark:border-gray-700'>
        {loading ? (
           <div className='flex justify-center items-center h-48'>
             <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
           </div>
        ) : filteredPayments.length === 0 ? (
           <div className='p-8 text-center text-gray-500 dark:text-gray-400'>
             No se encontraron pagos.
           </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
               <thead className='bg-gray-50 dark:bg-gray-900'>
                 <tr>
                   <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Fecha</th>
                   <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Servicio</th>
                   <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Beneficiario</th>
                   <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Monto</th>
                   <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>Acciones</th>
                 </tr>
               </thead>
               <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                 {filteredPayments.map((payment) => (
                   <tr key={payment.id} className='hover:bg-gray-50 dark:hover:bg-gray-700/50 transition'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{safeFormatDate(payment.date)}</td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>{payment.service_name}</td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{payment.beneficiary || '-'}</td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white'>{safeFormatCurrency(payment.amount)}</td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                         <Link to={`/payments/${payment.id}/edit`} className='text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-3 inline-block'>
                            <Edit className='w-4 h-4' />
                         </Link>
                         <button onClick={() => handleDelete(payment.id)} className='text-red-600 hover:text-red-900 dark:hover:text-red-400 inline-block'>
                            <Trash2 className='w-4 h-4' />
                         </button>
                      </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
