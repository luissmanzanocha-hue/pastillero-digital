import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Stethoscope, LogOut, Activity, Pill, CheckCircle, Edit2, ChevronRight, User } from 'lucide-react';
import Modal from '../components/common/Modal';

const NurseDashboard = () => {
    const { nurseSession, signOut } = useAuth();
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMed, setSelectedMed] = useState(null);
    const [selectedResident, setSelectedResident] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [doseType, setDoseType] = useState('fraction');
    const [pillFraction, setPillFraction] = useState('1');
    const [tempDose, setTempDose] = useState('1');
    const [administerLoading, setAdministerLoading] = useState(false);

    useEffect(() => {
        fetchResidents();
    }, []);

    const fetchResidents = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('residents')
                .select(`*, medications (*)`)
                .order('name', { ascending: true });

            if (error) throw error;
            setResidents(data || []);
        } catch (error) {
            console.error('Error fetching residents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMed = (resident, med) => {
        setSelectedResident(resident);
        setSelectedMed(med);
        setDoseType(med.doseType || 'fraction');
        setPillFraction(med.pillFraction || '1');

        let defaultDose = '1';
        if (med.dosagePattern) {
            const parts = med.dosagePattern.split('-');
            if (parts.length > 0) defaultDose = parts[0];
        }
        setTempDose(med.doseType === 'dosage' ? (med.doseAmount || defaultDose) : defaultDose);
        setIsEditMode(false);
    };

    const handleAdminister = async () => {
        if (!selectedMed || !selectedResident) return;
        setAdministerLoading(true);

        let amount = 0;
        if (doseType === 'fraction') {
            amount = parseFloat(pillFraction);
        } else {
            amount = parseFloat(tempDose);
        }

        if (isNaN(amount) || amount <= 0) {
            alert('Por favor ingrese una dosis válida');
            setAdministerLoading(false);
            return;
        }

        const units = doseType === 'fraction' ? 'pastillas' : 'unidades';
        const nurseName = nurseSession?.full_name || 'Enfermera';

        try {
            // 1. Record transaction with nurse name
            const { error: transError } = await supabase
                .from('transactions')
                .insert([{
                    medication_id: selectedMed.id,
                    resident_id: selectedResident.id,
                    type: 'administer',
                    amount: amount,
                    note: `Administración por Enf. ${nurseName}: ${selectedMed.name} (${amount} ${units})`,
                    nurse_name: nurseName
                }]);

            if (transError) throw transError;

            // 2. Update stock
            const newStock = Math.max(0, (parseFloat(selectedMed.current_stock) || 0) - amount);
            const { error: medError } = await supabase
                .from('medications')
                .update({ current_stock: newStock })
                .eq('id', selectedMed.id);

            if (medError) throw medError;

            // 3. Refresh local data
            await fetchResidents();

            alert(`✅ Se suministraron ${amount} ${units} de ${selectedMed.name} a ${selectedResident.name}.\nRegistrado por: Enf. ${nurseName}`);
            setSelectedMed(null);
            setSelectedResident(null);
        } catch (error) {
            console.error('Error administering:', error);
            alert('Error al registrar la suministración. Intenta de nuevo.');
        } finally {
            setAdministerLoading(false);
        }
    };

    const handleSignOut = () => {
        if (window.confirm('¿Deseas cerrar sesión?')) {
            signOut();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0F172A]/95 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-xl">
                            <Stethoscope size={24} className="text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-white">Enfermería</h1>
                            <p className="text-xs text-emerald-400 font-medium">{nurseSession?.full_name}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <Activity size={24} className="text-emerald-400" />
                    <h2 className="text-xl font-bold">Suministrar Medicamentos</h2>
                </div>
                <p className="text-text-muted text-sm">Selecciona un medicamento para suministrar al residente.</p>

                {residents.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="p-6 bg-white/5 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                            <User size={40} className="text-text-muted" />
                        </div>
                        <p className="text-text-muted">No hay residentes registrados.</p>
                    </div>
                ) : (
                    residents.map(resident => {
                        const allMeds = resident.medications || [];
                        const activeMeds = allMeds.filter(m => !m.status || m.status === 'active');
                        if (activeMeds.length === 0) return null;

                        return (
                            <div key={resident.id} className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                                {/* Resident Header */}
                                <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                                            {resident.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{resident.name}</h3>
                                            {resident.room && (
                                                <p className="text-xs text-text-muted">Habitación {resident.room}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Medications */}
                                <div className="divide-y divide-white/5">
                                    {activeMeds.map(med => (
                                        <button
                                            key={med.id}
                                            onClick={() => handleSelectMed(resident, med)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                                    <Pill size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white">{med.name}</h4>
                                                    <p className="text-xs text-text-muted">Dosis: {med.dosagePattern || med.dose}</p>
                                                    <p className="text-xs text-text-muted">Stock: {med.current_stock ?? 0}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="text-text-muted group-hover:text-emerald-400 transition-colors" size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </main>

            {/* Administer Modal */}
            <Modal
                isOpen={!!selectedMed}
                onClose={() => { setSelectedMed(null); setSelectedResident(null); }}
                title="Confirmar Suministración"
                size="md"
            >
                {selectedMed && selectedResident && (
                    <div className="space-y-6">
                        <div className="bg-glass p-4 rounded-xl border border-glass-border">
                            <p className="text-xs text-emerald-400 uppercase font-bold mb-1">Residente</p>
                            <h3 className="text-lg font-bold text-white mb-3">{selectedResident.name}</h3>
                            <p className="text-xs text-text-muted uppercase font-bold mb-1">Medicamento</p>
                            <h3 className="text-xl font-bold text-white">{selectedMed.name}</h3>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <p className="text-xs text-white/70 uppercase">Presentación</p>
                                    <p className="font-semibold text-white">{selectedMed.presentation || 'Tabletas'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-white/70 uppercase">Kardex Dosis</p>
                                    <p className="font-semibold text-white">{selectedMed.dosagePattern || selectedMed.dose}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-white uppercase tracking-wider">Dosis a suministrar</label>
                                {!isEditMode && (
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        className="text-emerald-400 text-xs flex items-center gap-1 hover:underline"
                                    >
                                        <Edit2 size={12} />
                                        Editar dosis
                                    </button>
                                )}
                            </div>

                            {isEditMode ? (
                                <div className="animate-in fade-in zoom-in-95 duration-200 space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setDoseType('fraction')}
                                            className={`py-2 px-3 rounded-lg text-xs font-bold border-2 transition-all ${doseType === 'fraction'
                                                ? 'border-emerald-500 bg-emerald-500 text-white shadow-glow'
                                                : 'border-glass-border bg-white/5 text-text-muted hover:border-emerald-500/30'
                                                }`}
                                        >
                                            FRACCIÓN
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDoseType('dosage')}
                                            className={`py-2 px-3 rounded-lg text-xs font-bold border-2 transition-all ${doseType === 'dosage'
                                                ? 'border-emerald-500 bg-emerald-500 text-white shadow-glow'
                                                : 'border-glass-border bg-white/5 text-text-muted hover:border-emerald-500/30'
                                                }`}
                                        >
                                            MILIGRAMOS
                                        </button>
                                    </div>

                                    {doseType === 'fraction' ? (
                                        <select
                                            value={pillFraction}
                                            onChange={(e) => setPillFraction(e.target.value)}
                                            className="w-full text-2xl font-bold text-center py-4 bg-white/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] focus:ring-emerald-500 text-white rounded-xl"
                                        >
                                            <option value="0.25">1/4 pastilla</option>
                                            <option value="0.5">1/2 pastilla</option>
                                            <option value="0.75">3/4 pastilla</option>
                                            <option value="1">1 pastilla</option>
                                            <option value="1.5">1.5 pastillas</option>
                                            <option value="2">2 pastillas</option>
                                        </select>
                                    ) : (
                                        <input
                                            type="number"
                                            step="0.25"
                                            value={tempDose}
                                            onChange={(e) => setTempDose(e.target.value)}
                                            className="w-full text-2xl font-bold text-center py-4 bg-white/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] focus:ring-emerald-500 rounded-xl"
                                            autoFocus
                                        />
                                    )}
                                    <p className="text-xs text-warning mt-2 text-center font-medium">
                                        * Este cambio solo aplica para esta suministración.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-4xl font-bold text-center py-6 bg-white/5 rounded-xl border border-glass-border text-white">
                                    {doseType === 'fraction' ? (
                                        <span>
                                            {pillFraction === '0.25' ? '1/4' :
                                                pillFraction === '0.5' ? '1/2' :
                                                    pillFraction === '0.75' ? '3/4' : pillFraction}
                                        </span>
                                    ) : tempDose}
                                    <span className="text-sm text-white/60 ml-2 font-normal">
                                        {doseType === 'fraction' ? 'pastillas' : 'unidades'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                            <p className="text-xs text-emerald-400 font-medium">
                                Registrado por: <span className="font-bold">Enf. {nurseSession?.full_name}</span>
                            </p>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => { setSelectedMed(null); setSelectedResident(null); }}
                                className="btn btn-ghost flex-1 py-4"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAdminister}
                                disabled={administerLoading}
                                className="flex-1 py-4 rounded-xl text-lg font-bold shadow-lg flex items-center justify-center gap-2 text-white transition-all"
                                style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
                            >
                                {administerLoading ? (
                                    <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle size={24} />
                                        SUMINISTRAR
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default NurseDashboard;
