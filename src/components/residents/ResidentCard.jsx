import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Pill, Edit, Trash2 } from 'lucide-react';

const ResidentCard = ({ resident, onEdit, onDelete }) => {
    const navigate = useNavigate();

    // Calculate stats
    const medications = resident.medications || [];
    const activeMedications = medications.filter(m => m.status === 'active');
    const activeCount = activeMedications.length;
    const totalCount = medications.length;

    // Calculate low stock items (insufficient for remaining treatment)
    const lowStockCount = activeMedications.reduce((count, med) => {
        if (!med.currentStock || !med.dosagePattern) return count;

        // 1. Calculate Daily Usage (Robust Parsing)
        let dailyDoses = 0;
        if (med.dosagePattern.includes('-')) {
            dailyDoses = med.dosagePattern.split('-').reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
        } else {
            // Try to extract all numbers from string and sum them
            const matches = med.dosagePattern.match(/(\d+(\.\d+)?)/g);
            if (matches) {
                dailyDoses = matches.reduce((acc, curr) => acc + parseFloat(curr), 0);
            } else {
                dailyDoses = 0;
            }
        }

        const pillFraction = (med.doseType === 'fraction' && med.pillFraction) ? parseFloat(med.pillFraction) : 1;
        const dailyUsage = dailyDoses * pillFraction;

        // Safety: If we can't determine usage, flag it as low stock to force review
        if (dailyUsage === 0) return count + 1;

        // --- CALCULATION METHOD A: Days Remaining (Simple Stock) ---
        const currentStock = parseFloat(med.currentStock) || 0;
        const simpleDaysRemaining = Math.floor(currentStock / dailyUsage);
        const isSimpleLowStock = simpleDaysRemaining <= 5; // Alert if 5 days or less left

        // --- CALCULATION METHOD B: Treatment Deficit (Time Sensitive) ---
        let isTreatmentDeficit = false;

        if (med.startDate && med.treatmentDays) {
            const start = new Date(med.startDate);
            const today = new Date();
            start.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            const diffTime = today.getTime() - start.getTime();
            const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const treatmentDuration = parseInt(med.treatmentDays) || 30;

            // Strict check: Only calculate deficit if valid dates
            if (!isNaN(daysPassed)) {
                let pillsNeeded = 0;
                if (daysPassed < 0) {
                    pillsNeeded = treatmentDuration * dailyUsage;
                } else if (daysPassed < treatmentDuration) {
                    // Treatment active
                    const daysRemaining = treatmentDuration - daysPassed;
                    pillsNeeded = daysRemaining * dailyUsage;
                } else {
                    // Treatment finished by date
                    pillsNeeded = 0;
                }

                const balance = currentStock - pillsNeeded;
                if (balance < 0) isTreatmentDeficit = true;
            } else {
                // If dates are invalid, safer to assume deficit/alert
                isTreatmentDeficit = true;
            }
        }

        // AGGRESSIVE ALERT: If EITHER method flags a problem, count it.
        // This catches "Faltan 22" (Deficit) AND "Quedan 2 días" (Simple Low Stock)
        if (isSimpleLowStock || isTreatmentDeficit) {
            return count + 1;
        }

        return count;
    }, 0);

    return (
        <div className="glass-card p-6 animate-in slide-in-from-bottom duration-500 hover:border-indigo-500/30 transition-colors group">
            <div className="flex items-center gap-4 mb-5">
                <div className="p-3.5 gradient-primary rounded-2xl shadow-lg shadow-indigo-500/20">
                    <User size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{resident.name}</h3>
                    {resident.age && (
                        <p className="text-sm text-gray-400 font-medium">
                            {resident.age} años
                        </p>
                    )}
                </div>
            </div>

            {lowStockCount > 0 && (
                <div className="flex items-center gap-3 mb-6 p-4 rounded-xl border bg-red-500/10 border-red-500/20">
                    <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                        <Pill size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-red-200">
                            {lowStockCount} medicamentos por terminar
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                            {activeCount} de {totalCount} activos
                        </span>
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    onClick={() => navigate(`/resident/${resident.id}/administer`)}
                    className="btn btn-primary btn-glow flex-1 shadow-lg shadow-indigo-500/20"
                >
                    SUMINISTRAR
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate(`/resident/${resident.id}`)}
                        className="btn btn-ghost p-3 text-gray-400 hover:text-white border border-glass-border"
                        title="Ver Perfil"
                    >
                        <User size={20} />
                    </button>
                    <button
                        onClick={() => onEdit(resident)}
                        className="btn btn-ghost p-3 text-gray-400 hover:text-white border border-glass-border"
                        title="Editar"
                        aria-label="Editar"
                    >
                        <Edit size={20} />
                    </button>
                    <button
                        onClick={() => onDelete(resident.id)}
                        className="btn btn-ghost p-3 text-gray-400 hover:text-red-400 border border-glass-border"
                        title="Eliminar"
                        aria-label="Eliminar"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResidentCard;
