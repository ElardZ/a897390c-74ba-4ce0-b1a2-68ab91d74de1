import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Users, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DebtItem {
  person: string;
  totalOriginal: number;
  totalRefunded: number;
  remaining: number;
  services: string[];
}

export default function DebtsByPerson() {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          service_name,
          amount,
          beneficiary,
          refunds ( amount )
        `);

      if (error) throw error;

      const grouped: Record<string, DebtItem> = {};

      payments?.forEach((p: any) => {
        const person = p.beneficiary || 'Sin Nombre';
        if (!grouped[person]) {
          grouped[person] = { 
            person, 
            totalOriginal: 0, 
            totalRefunded: 0, 
            remaining: 0,
            services: []
          };
        }
        
        grouped[person].totalOriginal += Number(p.amount);
        if (!grouped[person].services.includes(p.service_name)) {
           grouped[person].services.push(p.service_name);
        }

        if (p.refunds) {
          p.refunds.forEach((r: any) => {
            grouped[person].totalRefunded += Number(r.amount);
          });
        }
      });

      // Calculate remaining
      Object.values(grouped).forEach(item => {
        item.remaining = item.totalOriginal - item.totalRefunded;
      });

      setDebts(Object.values(grouped).sort((a, b) => b.remaining - a.remaining));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredDebts = debts.filter(d => 
    d.person.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);

  return (
    <div>
      <h2 className='text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2'>
        <Users className='w-6 h-6' />
        Deudas por Persona
      </h2>

      <div className='mb-6 max-w-md relative'>
        <span className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
           <Search className='h-5 w-5 text-gray-400' />
        </span>
        <input 
           type='text'
           className='block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500'
           placeholder='Buscar persona...'
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className='flex justify-center p-12'>
          <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
        </div>
      ) : filteredDebts.length === 0 ? (
        <p className='text-gray-500 dark:text-gray-400'>No se encontraron registros.</p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredDebts.map((item, idx) => (
            <div key={idx} className='bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition'>
              <div className='p-6'>
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <h3 className='font-bold text-lg text-gray-900 dark:text-white'>{item.person}</h3>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[200px]'>
                      {item.services.join(', ')}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.remaining > 0.1 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                    {item.remaining > 0.1 ? 'Debe' : 'Paz y Salvo'}
                  </div>
                </div>

                <div className='space-y-2 mt-4'>
                   <div className='flex justify-between text-sm'>
                     <span className='text-gray-500'>Total Prestado:</span>
                     <span className='font-medium dark:text-gray-300'>{formatCurrency(item.totalOriginal)}</span>
                   </div>
                   <div className='flex justify-between text-sm'>
                     <span className='text-gray-500'>Reembolsado:</span>
                     <span className='font-medium text-green-600 dark:text-green-400'>{formatCurrency(item.totalRefunded)}</span>
                   </div>
                   <div className='pt-3 border-t dark:border-gray-700 flex justify-between font-bold text-lg'>
                      <span className='dark:text-white'>Pendiente:</span>
                      <span className={item.remaining > 0.1 ? 'text-orange-600' : 'text-green-600'}>
                        {formatCurrency(item.remaining)}
                      </span>
                   </div>
                </div>
              </div>
              <div className='bg-gray-50 dark:bg-gray-700/50 p-3 text-center'>
                 <Link to={`/payments?search=${encodeURIComponent(item.person)}`} className='text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center justify-center'>
                   Ver detalles <ChevronRight className='w-4 h-4 ml-1' />
                 </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
