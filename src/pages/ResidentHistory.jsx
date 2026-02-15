import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, History, Pill, Stethoscope } from 'lucide-react';

const ResidentHistory = () => {
    const { residentId } = useParams();
    const navigate = useNavigate();
    const { residents, getTransactions } = useApp();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const resident = residents.find(r => r.id === residentId);

    useEffect(() => {
        const loadHistory = async () => {
            if (resident) {
                setLoading(true);
                try {
                    const { supabase } = await import('../lib/supabaseClient');
                    const { data, error } = await supabase
                        .from('transactions')
                        .select('*')
                        .eq('resident_id', residentId)
                        .eq('type', 'administer');

                    if (error) {
                        console.error('Error loading history:', error);
                    } else {
                        // Sort client-side by most recent first
                        const sorted = (data || []).sort((a, b) => {
                            const dateA = new Date(a.created_at || a.date || 0);
                            const dateB = new Date(b.created_at || b.date || 0);
                            return dateB - dateA;
                        });
                        setTransactions(sorted);
                    }
                } catch (err) {
                    console.error('Error in loadHistory:', err);
                }
                setLoading(false);
            }
        };

        loadHistory();
    }, [residentId, resident]);

    if (!resident) {
        return (
            <div className="glass-card p-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Residente no encontrado</h2>
                <button onClick={() => navigate('/residents')} className="btn btn-primary">
                    <ArrowLeft size={20} />
                    Volver a Residentes
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="glass-card p-4 md:p-6">
                <button
                    onClick={() => navigate(`/resident/${residentId}`)}
                    className="btn btn-ghost mb-4 px-4 py-2.5 text-base"
                >
                    <ArrowLeft size={22} />
                    <span className="hidden sm:inline">Volver al Dashboard</span>
                </button>

                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-secondary/20 rounded-lg">
                        <History className="text-secondary" size={32} />
                    </div>
                    Historial Administrado
                </h1>
                <p className="text-text-muted mt-2">{resident.name}</p>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                    </div>
                ) : transactions.length > 0 ? (
                    transactions.map(admin => (
                        <div key={admin.id} className="glass-card p-4 flex items-center justify-between border-l-4 border-primary">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Pill size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">
                                        {resident.medications?.find(m => m.id === admin.medication_id)?.name || 'Medicamento'}
                                    </h4>
                                    <p className="text-xs text-text-muted">
                                        Dosis: <span className="text-primary font-bold">{admin.amount} {admin.units || 'unidades'}</span>
                                    </p>
                                    {admin.nurse_name && (
                                        <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                                            <Stethoscope size={12} />
                                            <span className="font-medium">Enf. {admin.nurse_name}</span>
                                        </p>
                                    )}
                                    {admin.note && <p className="text-[10px] text-text-muted italic mt-1">{admin.note}</p>}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-white">
                                    {new Date(admin.created_at || admin.date).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-text-muted">
                                    {new Date(admin.created_at || admin.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-card p-12 text-center">
                        <div className="p-6 bg-secondary/10 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                            <History size={64} className="text-secondary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Sin Historial</h3>
                        <p className="text-text-muted">Aún no se han administrado medicamentos a este residente.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResidentHistory;
