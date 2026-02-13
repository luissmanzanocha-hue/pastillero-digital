import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Package, Pill, Activity, CheckCircle, Edit2, ChevronRight } from 'lucide-react';
import Modal from '../components/common/Modal';

const AdministerPage = () => {
    const { residentId } = useParams();
    const navigate = useNavigate();
    const { residents, administerMedication } = useApp();
    const [selectedMed, setSelectedMed] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [tempDose, setTempDose] = useState('');
    const [doseType, setDoseType] = useState('fraction');
    const [pillFraction, setPillFraction] = useState('1');

    const resident = residents.find(r => r.id === residentId);
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

    const activeMedications = resident.medications?.filter(m => m.status === 'active') || [];

    const handleSelectMed = (med) => {
        setSelectedMed(med);
        setDoseType(med.doseType || 'fraction');
        setPillFraction(med.pillFraction || '1');

        // Default dose logic for display
        let defaultDose = '1';
        if (med.dosagePattern) {
            const parts = med.dosagePattern.split('-');
            if (parts.length > 0) defaultDose = parts[0];
        }

        setTempDose(med.doseType === 'dosage' ? (med.doseAmount || defaultDose) : defaultDose);
        setIsEditMode(false);
    };

    const handleAdminister = () => {
        if (!selectedMed) return;

        let amount = 0;
        if (doseType === 'fraction') {
            amount = parseFloat(pillFraction);
        } else {
            amount = parseFloat(tempDose);
        }

        if (isNaN(amount) || amount <= 0) {
            alert('Por favor ingrese una dosis válida');
            return;
        }

        const units = doseType === 'fraction' ? 'pastillas' : 'unidades';
        administerMedication(residentId, selectedMed.id, amount, selectedMed.name, units);
        setSelectedMed(null);
        // Show success animation or toast if available
        alert(`Se suministraron ${amount} de ${selectedMed.name} correctamente.`);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            {/* Header */}
            <div className="glass-card p-6">
                <button
                    onClick={() => navigate(`/resident/${residentId}`)}
                    className="flex items-center text-text-muted hover:text-primary mb-4 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-1" />
                    Volver al Perfil
                </button>
                <div className="flex items-center gap-4">
                    <div className="p-3 gradient-primary rounded-xl shadow-lg shadow-primary/20">
                        <Activity className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Suministrar Medicación</h1>
                        <p className="text-text-muted mt-1">{resident.name}</p>
                    </div>
                </div>
            </div>

            {/* Medication List */}
            <div className="grid gap-4">
                {activeMedications.length > 0 ? (
                    activeMedications.map(med => (
                        <div
                            key={med.id}
                            onClick={() => handleSelectMed(med)}
                            className="glass-card p-5 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-secondary/10 text-secondary rounded-lg group-hover:bg-secondary/20 transition-colors">
                                    <Pill size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">{med.name}</h3>
                                    <p className="text-sm text-text-muted">Dosis: {med.dosagePattern}</p>
                                </div>
                            </div>
                            <ChevronRight className="text-text-muted group-hover:text-primary transition-colors" size={24} />
                        </div>
                    ))
                ) : (
                    <div className="glass-card p-12 text-center">
                        <p className="text-text-muted">No hay medicamentos activos para suministrar.</p>
                    </div>
                )}
            </div>

            {/* Administer Modal */}
            <Modal
                isOpen={!!selectedMed}
                onClose={() => setSelectedMed(null)}
                title="Confirmar Administración"
                size="md"
            >
                {selectedMed && (
                    <div className="space-y-6">
                        <div className="bg-glass p-4 rounded-xl border border-glass-border">
                            <h3 className="text-xl font-bold text-white mb-2">{selectedMed.name}</h3>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <p className="text-xs text-white/70 uppercase">Presentación</p>
                                    <p className="font-semibold text-white">{selectedMed.presentation || 'Tabletas'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-white/70 uppercase">Kardex Dosis</p>
                                    <p className="font-semibold text-white">{selectedMed.dosagePattern}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-white uppercase tracking-wider">Dosis a suministrar</label>
                                {!isEditMode && (
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        className="text-primary text-xs flex items-center gap-1 hover:underline"
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
                                                ? 'border-primary bg-primary text-white shadow-glow'
                                                : 'border-glass-border bg-white/5 text-text-muted hover:border-primary/30'
                                                }`}
                                        >
                                            FRACCIÓN
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDoseType('dosage')}
                                            className={`py-2 px-3 rounded-lg text-xs font-bold border-2 transition-all ${doseType === 'dosage'
                                                ? 'border-primary bg-primary text-white shadow-glow'
                                                : 'border-glass-border bg-white/5 text-text-muted hover:border-primary/30'
                                                }`}
                                        >
                                            MILIGRAMOS
                                        </button>
                                    </div>

                                    {doseType === 'fraction' ? (
                                        <select
                                            value={pillFraction}
                                            onChange={(e) => setPillFraction(e.target.value)}
                                            className="w-full text-2xl font-bold text-center py-4 bg-white/10 border-primary shadow-[0_0_15px_rgba(99,102,241,0.2)] focus:ring-primary text-white rounded-xl"
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
                                            className="w-full text-2xl font-bold text-center py-4 bg-white/10 border-primary shadow-[0_0_15px_rgba(99,102,241,0.2)] focus:ring-primary rounded-xl"
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

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setSelectedMed(null)}
                                className="btn btn-ghost flex-1 py-4"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAdminister}
                                className="btn btn-primary flex-1 py-4 text-lg font-bold shadow-lg shadow-primary/30"
                            >
                                <CheckCircle size={24} className="mr-2" />
                                SUMINISTRAR
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdministerPage;
