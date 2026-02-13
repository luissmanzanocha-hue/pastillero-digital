import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, FileText, Plus, Edit, Trash2, Pill, PlusCircle } from 'lucide-react';
import MedicationForm from '../components/kardex/MedicationForm';
import { decimalToFraction } from '../utils/calculations';

const ResidentKardex = () => {
    const { residentId } = useParams();
    const navigate = useNavigate();
    const { residents, addMedication, updateMedication, deleteMedication } = useApp();

    // State to control view mode (list vs form)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMedication, setEditingMedication] = useState(null);

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

    const medications = resident.medications || [];

    const handleSubmit = (formData) => {
        if (editingMedication) {
            updateMedication(residentId, editingMedication.id, formData);
        } else {
            addMedication(residentId, formData);
        }
        setIsFormOpen(false);
        setEditingMedication(null);
    };

    const handleEdit = (medication) => {
        setEditingMedication(medication);
        setIsFormOpen(true);
    };

    const handleDelete = (medicationId) => {
        if (window.confirm('¿Estás seguro de eliminar este medicamento?')) {
            deleteMedication(residentId, medicationId);
        }
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingMedication(null);
    };

    const calculateStockStatus = (medication) => {
        if (!medication.currentStock && medication.currentStock !== 0) return { color: 'bg-gray-100 text-gray-400', message: 'Sin stock registrado' };

        // Calculate daily usage
        const dailyDoses = medication.dosagePattern.split('-').reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
        const pillFraction = medication.doseType === 'fraction' ? parseFloat(medication.pillFraction) : 1;
        const dailyUsage = dailyDoses * pillFraction;

        if (dailyUsage === 0) return { color: 'bg-gray-100 text-gray-400', message: 'Dosis diaria 0' };

        const daysRemaining = Math.floor(medication.currentStock / dailyUsage);

        let color = 'bg-emerald-500/10 text-emerald-400'; // Green (> 10 days)
        if (daysRemaining <= 5) color = 'bg-red-500/10 text-red-400'; // Red (<= 5 days)
        else if (daysRemaining <= 10) color = 'bg-yellow-500/10 text-yellow-400'; // Yellow (<= 10 days)

        return {
            color,
            message: `Stock: ${medication.currentStock} (${daysRemaining} días restantes)`
        };
    };

    const handleAddStock = (medication) => {
        const addedAmount = prompt(`Agregar stock para ${medication.name}.\nIngrese cantidad de pastillas a agregar:`);
        if (addedAmount && !isNaN(addedAmount)) {
            const newStock = (parseInt(medication.currentStock) || 0) + parseInt(addedAmount);
            updateMedication(residentId, medication.id, { ...medication, currentStock: newStock });
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            {isFormOpen ? (
                /* FORM VIEW */
                <div className="glass-card p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-glass-border">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                                {editingMedication ? 'Editar Medicamento' : 'Nuevo Medicamento'}
                            </h2>
                            <p className="text-text-muted">
                                {editingMedication ? 'Modifica los datos del medicamento' : 'Registra un nuevo medicamento para ' + resident.name}
                            </p>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="btn btn-ghost"
                        >
                            <ArrowLeft size={20} />
                            Volver
                        </button>
                    </div>

                    <MedicationForm
                        residentName={resident.name}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        initialData={editingMedication}
                    />
                </div>
            ) : (
                /* LIST VIEW */
                <>
                    {/* Header */}
                    <div className="glass-card p-4 md:p-6">
                        <button
                            onClick={() => navigate(`/resident/${residentId}`)}
                            className="btn btn-ghost mb-4 px-4 py-2.5 text-base"
                        >
                            <ArrowLeft size={22} />
                            <span className="hidden sm:inline">Volver al Dashboard</span>
                        </button>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-primary/20 rounded-lg">
                                        <FileText className="text-primary" size={32} />
                                    </div>
                                    Kardex
                                </h1>
                                <p className="text-text-muted mt-2">{resident.name}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingMedication(null);
                                    setIsFormOpen(true);
                                }}
                                className="btn btn-primary"
                            >
                                <Plus size={20} />
                                <span className="hidden sm:inline">Agregar Medicamento</span>
                            </button>
                        </div>
                    </div>

                    {/* Medications List */}
                    {medications.length > 0 ? (
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-primary/5 border-b border-glass-border">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vía</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dosis</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Horario</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Surtir</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estados</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-glass-border">
                                        {medications.map((medication) => {
                                            const stockStatus = calculateStockStatus(medication);

                                            // Supply calculation
                                            let supplyMessage = '-';
                                            let supplyColor = 'text-gray-500';
                                            let supplyBg = 'bg-gray-100 border-gray-200';

                                            if (medication.startDate && medication.treatmentDays && medication.dosagePattern) {
                                                const dailyDoses = medication.dosagePattern.split('-').reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
                                                const pillFraction = medication.doseType === 'fraction' ? parseFloat(medication.pillFraction) : 1;
                                                const dailyUsage = dailyDoses * pillFraction;

                                                if (dailyUsage > 0) {
                                                    const start = new Date(medication.startDate);
                                                    const today = new Date();
                                                    start.setHours(0, 0, 0, 0);
                                                    today.setHours(0, 0, 0, 0);

                                                    const diffTime = today.getTime() - start.getTime();
                                                    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                                    const treatmentDuration = parseInt(medication.treatmentDays) || 30;

                                                    let pillsNeeded = 0;

                                                    if (daysPassed < 0) {
                                                        pillsNeeded = treatmentDuration * dailyUsage;
                                                    } else if (daysPassed < treatmentDuration) {
                                                        const daysRemaining = treatmentDuration - daysPassed;
                                                        pillsNeeded = daysRemaining * dailyUsage;
                                                    } else {
                                                        pillsNeeded = 0;
                                                    }

                                                    const currentStock = parseFloat(medication.currentStock) || 0;
                                                    const balance = currentStock - pillsNeeded;

                                                    // Only show warning if we are short
                                                    if (balance < 0) {
                                                        const missing = Math.abs(balance);
                                                        const missingText = medication.doseType === 'fraction' && missing < 1
                                                            ? decimalToFraction(missing)
                                                            : missing.toFixed(2).replace(/\.00$/, '');
                                                        supplyMessage = `Faltan ${missingText}`;
                                                        supplyColor = 'text-red-400 font-bold border-red-500/50';
                                                        supplyBg = 'bg-red-500/10';
                                                    } else {
                                                        const extra = balance;
                                                        const extraText = medication.doseType === 'fraction' && extra < 1
                                                            ? decimalToFraction(extra)
                                                            : extra.toFixed(2).replace(/\.00$/, '');
                                                        supplyMessage = `Sobran ${extraText}`;
                                                        supplyColor = 'text-emerald-400 font-bold border-emerald-500/50';
                                                        supplyBg = 'bg-emerald-500/10';
                                                    }
                                                }
                                            }

                                            return (
                                                <tr key={medication.id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div
                                                                className={`p-1.5 rounded-lg mr-2 shadow-sm ${stockStatus.color} transition-colors duration-300`}
                                                                title={stockStatus.message}
                                                            >
                                                                <Pill size={16} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-extrabold text-indigo-950 uppercase tracking-wider">{medication.name}</div>
                                                                {medication.presentation && (
                                                                    <div className="text-[10px] text-gray-500 font-medium">{medication.presentation}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-xs font-extrabold text-slate-800 border-2 border-slate-700 bg-transparent px-2 py-0.5 rounded-sm">{medication.via}</span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex flex-col gap-1 items-start">
                                                            <div className="text-sm font-bold text-gray-800 tracking-wide">
                                                                {medication.doseType === 'fraction' ? (
                                                                    <span>{decimalToFraction(medication.pillFraction)} pastilla</span>
                                                                ) : (
                                                                    <span>{medication.doseAmount} mg</span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-700 font-mono border-2 border-slate-600 bg-transparent px-1.5 py-0.5 rounded-sm w-fit shadow-sm">
                                                                {medication.dosagePattern}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-1">
                                                            {medication.schedules && medication.schedules.length > 0 && medication.schedules[0] && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {medication.schedules.filter(s => s).map((schedule, idx) => (
                                                                        <span key={idx} className="text-sm font-extrabold text-indigo-950 px-2 py-0.5">
                                                                            {schedule}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`text-xs px-2 py-0.5 rounded border ${supplyBg} ${supplyColor}`}>
                                                            {supplyMessage}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-xs text-gray-600 font-medium">
                                                            {medication.doctor || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-full border ${medication.status === 'active'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                            }`}>
                                                            {medication.status === 'active' ? 'Activo' : 'Suspendido'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                                                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                                                            <button
                                                                onClick={() => handleAddStock(medication)}
                                                                className="w-7 h-7 rounded-full bg-white border-2 border-slate-900 shadow-[1px_1px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center"
                                                                title="Agregar Stock"
                                                            >
                                                                <Plus size={14} className="text-slate-900 stroke-[3]" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(medication)}
                                                                className="w-7 h-7 rounded-full bg-white border-2 border-slate-900 shadow-[1px_1px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center"
                                                                title="Editar"
                                                            >
                                                                <Edit size={12} className="text-indigo-600 stroke-[2.5]" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(medication.id)}
                                                                className="w-7 h-7 rounded-full bg-white border-2 border-slate-900 shadow-[1px_1px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 size={12} className="text-slate-900 stroke-[2.5]" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <div className="p-6 bg-primary/10 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                                <FileText size={64} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No hay medicamentos registrados</h3>
                            <p className="text-text-muted mb-6">Agrega el primer medicamento para este residente</p>
                            <button
                                onClick={() => {
                                    setEditingMedication(null);
                                    setIsFormOpen(true);
                                }}
                                className="btn btn-primary"
                            >
                                <Plus size={20} />
                                Agregar Medicamento
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ResidentKardex;
