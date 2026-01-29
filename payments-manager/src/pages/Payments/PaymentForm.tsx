import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react';

export default function PaymentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    beneficiary: '',
    payment_method: '',
    notes: ''
  });

  // Refund State
  const [refunds, setRefunds] = useState<any[]>([]);
  const [newRefund, setNewRefund] = useState({ amount: '', date: new Date().toISOString().split('T')[0], note: '' });
  const [refundLoading, setRefundLoading] = useState(false);

  // Suggestions state
  const [beneficiaryOptions, setBeneficiaryOptions] = useState<string[]>([]);
  const [methodOptions, setMethodOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchSuggestions();
    if (isEdit) {
      fetchPayment();
      fetchRefunds();
    }
  }, [id]);

  const fetchSuggestions = async () => {
    try {
      const { data: benData } = await supabase.from('payments').select('beneficiary').not('beneficiary', 'is', null);
      if (benData) setBeneficiaryOptions([...new Set(benData.map(i => i.beneficiary))] as string[]);

      const { data: methodData } = await supabase.from('payments').select('payment_method').not('payment_method', 'is', null);
      if (methodData) setMethodOptions([...new Set(methodData.map(i => i.payment_method))] as string[]);
    } catch (e) { console.error(e); }
  };

  const fetchPayment = async () => {
    if (!id) return;
    const { data, error } = await supabase.from('payments').select('*').eq('id', id).single();
    if (error) { navigate('/payments'); return; }
    if (data) {
      setFormData({
        service_name: data.service_name,
        amount: data.amount,
        date: data.date,
        beneficiary: data.beneficiary || '',
        payment_method: data.payment_method || '',
        notes: data.notes || ''
      });
    }
  };

  const fetchRefunds = async () => {
    if (!id) return;
    const { data } = await supabase.from('refunds').select('*').eq('payment_id', id).order('date', { ascending: false });
    setRefunds(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const payload = {
      user_id: user.id,
      service_name: formData.service_name,
      amount: parseFloat(formData.amount),
      date: formData.date,
      beneficiary: formData.beneficiary,
      payment_method: formData.payment_method,
      notes: formData.notes
    };

    let error;
    if (isEdit) {
      const { error: err } = await supabase.from('payments').update(payload).eq('id', id);
      error = err;
    } else {
      const { error: err } = await supabase.from('payments').insert([payload]);
      error = err;
    }

    setLoading(false);
    if (error) alert('Error: ' + error.message);
    else navigate('/payments');
  };

  const handleAddRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setRefundLoading(true);
    const { error } = await supabase.from('refunds').insert([{
      payment_id: id,
      amount: parseFloat(newRefund.amount),
      date: newRefund.date,
      note: newRefund.note
    }]);

    if(error) alert('Error al agregar reembolso: ' + error.message);
    else {
      setNewRefund({ amount: '', date: new Date().toISOString().split('T')[0], note: '' });
      fetchRefunds();
    }
    setRefundLoading(false);
  };

  const handleDeleteRefund = async (refundId: string) => {
    if (!confirm('¿Eliminar este reembolso?')) return;
    await supabase.from('refunds').delete().eq('id', refundId);
    fetchRefunds();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Calculations
  const totalAmount = parseFloat(formData.amount) || 0;
  const totalRefunded = refunds.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const pendingAmount = totalAmount - totalRefunded;
  const isFullyPaid = pendingAmount <= 0.1; // Small threshold for float precision

  return (
    <div className='max-w-4xl mx-auto pb-10'>
       <button onClick={() => navigate('/payments')} className='mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'>
         <ArrowLeft className='w-4 h-4 mr-1' />
         Volver
       </button>
       
       <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
         {/* Main Form */}
         <div className='lg:col-span-2 space-y-6'>
           <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>
             {isEdit ? 'Editar Pago' : 'Nuevo Pago'}
           </h2>
           <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6'>
             <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                     <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Servicio</label>
                     <input name='service_name' required placeholder='ej. Internet' value={formData.service_name} onChange={handleChange} className='w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white' />
                  </div>
                  <div>
                     <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Monto Pagado</label>
                     <input name='amount' type='number' step='0.01' required placeholder='0.00' value={formData.amount} onChange={handleChange} className='w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white' />
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                     <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Beneficiario</label>
                     <input name='beneficiary' list='beneficiary-options' placeholder='ej. Mamá' value={formData.beneficiary} onChange={handleChange} className='w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white' />
                     <datalist id='beneficiary-options'>{beneficiaryOptions.map((o, i) => <option key={i} value={o} />)}</datalist>
                  </div>
                  <div>
                     <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Medio de Pago</label>
                     <input name='payment_method' list='method-options' placeholder='ej. Tarjeta' value={formData.payment_method} onChange={handleChange} className='w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white' />
                     <datalist id='method-options'>{methodOptions.map((o, i) => <option key={i} value={o} />)}</datalist>
                  </div>
                </div>
                <div>
                   <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Fecha</label>
                   <input name='date' type='date' required value={formData.date} onChange={handleChange} className='w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white' />
                </div>
                 <div>
                   <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Notas</label>
                   <textarea name='notes' rows={2} value={formData.notes} onChange={handleChange} className='w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white' />
                </div>
                <div className='flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700'>
                   <button type='button' onClick={() => navigate('/payments')} className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300'>Cancelar</button>
                   <button type='submit' disabled={loading} className='flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition disabled:opacity-50'>
                     {loading ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <Save className='w-4 h-4 mr-2' />}
                     Guardar
                   </button>
                </div>
             </form>
           </div>
         </div>

         {/* Refunds Sidebar */}
         {isEdit && (
           <div className='space-y-6'>
             <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>Estado de Deuda</h2>
             
             {/* Summary Card */}
             <div className={`p-6 rounded-xl shadow-lg border ${isFullyPaid ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'}`}>
                <div className='space-y-3'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-400'>Monto Original:</span>
                    <span className='font-bold text-gray-900 dark:text-white'>S/ {totalAmount.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-400'>Reembolsado:</span>
                    <span className='font-bold text-green-600 dark:text-green-400'>- S/ {totalRefunded.toFixed(2)}</span>
                  </div>
                  <div className='pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between text-lg font-bold'>
                    <span className='text-gray-800 dark:text-white'>Pendiente:</span>
                    <span className={pendingAmount > 0.1 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}>
                      S/ {Math.max(0, pendingAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
                {isFullyPaid && <div className='mt-4 text-center text-green-700 dark:text-green-300 font-bold bg-green-100 dark:bg-green-800/30 py-1 rounded'>¡Pagado Totalmente!</div>}
             </div>

             {/* Add Refund Form */}
             <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4'>
                <h3 className='font-semibold mb-3 text-gray-800 dark:text-white'>Registrar Cobro/Reembolso</h3>
                <form onSubmit={handleAddRefund} className='space-y-3'>
                  <input type='number' step='0.01' required placeholder='Monto recibido' value={newRefund.amount} onChange={e => setNewRefund({...newRefund, amount: e.target.value})} className='w-full rounded border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white' />
                  <input type='date' required value={newRefund.date} onChange={e => setNewRefund({...newRefund, date: e.target.value})} className='w-full rounded border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white' />
                  <input type='text' placeholder='Nota (opcional)' value={newRefund.note} onChange={e => setNewRefund({...newRefund, note: e.target.value})} className='w-full rounded border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white' />
                  <button type='submit' disabled={refundLoading} className='w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium flex justify-center items-center'>
                    {refundLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : <Plus className='w-4 h-4 mr-2' />} Añadir
                  </button>
                </form>
             </div>

             {/* Refund History */}
             {refunds.length > 0 && (
               <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden'>
                 <h3 className='font-semibold p-4 border-b dark:border-gray-700 text-gray-800 dark:text-white'>Historial</h3>
                 <div className='divide-y dark:divide-gray-700'>
                   {refunds.map(r => (
                     <div key={r.id} className='p-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50'>
                       <div>
                         <p className='font-bold text-gray-900 dark:text-white'>S/ {r.amount}</p>
                         <p className='text-xs text-gray-500'>{r.date} {r.note && `• ${r.note}`}</p>
                       </div>
                       <button onClick={() => handleDeleteRefund(r.id)} className='text-red-500 hover:text-red-700 p-1'><Trash2 className='w-4 h-4' /></button>
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
         )}
       </div>
    </div>
  )
}
