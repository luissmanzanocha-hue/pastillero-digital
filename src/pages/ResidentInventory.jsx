import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Package, Plus, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { calculateDailyDoses, calculateDailyUsage, calculateRemainingDays, decimalToFraction } from '../utils/calculations';

const ResidentInventory = () => {
    const { residentId } = useParams();
    const navigate = useNavigate();
    const { residents, updateInventory } = useApp();
    const [selectedMedication, setSelectedMedication] = useState(null);
    const [adjustingMed, setAdjustingMed] = useState(null);
    const [adjustAmount, setAdjustAmount] = useState('');

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
    const activeMedications = medications.filter(m => !m.status || m.status === 'active');

    const handleAdjustStock = (medicationId, isAdding) => {
        const amount = parseFloat(adjustAmount);
        if (!amount || amount <= 0) {
            alert('Por favor ingresa una cantidad válida');
            return;
        }

        const change = isAdding ? amount : -amount;
        updateInventory(residentId, medicationId, change, isAdding ? 'Entrada de stock' : 'Salida de stock');
        setAdjustingMed(null);
        setAdjustAmount('');
    };

    // --- RENDER HELPERS ---

    const renderListView = () => (
        <div className="space-y-4 animate-in slide-in-from-left duration-500">
            {/* Header for List */}
            <div className="glass-card p-4 md:p-6 mb-6">
                <button
                    onClick={() => navigate(`/resident/${residentId}`)}
                    className="btn btn-ghost mb-4 px-4 py-2.5 text-base text-white"
                >
                    <ArrowLeft size={22} />
                    <span className="hidden sm:inline">Volver al Dashboard</span>
                </button>

                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-secondary/20 rounded-lg">
                        <Package className="text-secondary" size={32} />
                    </div>
                    Inventario de {resident.name}
                </h1>
                <p className="text-text-muted mt-2">Selecciona un medicamento para ver detalles</p>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 gap-4">
                {activeMedications.map(med => {
                    const currentStock = parseFloat(med.current_stock) || 0;
                    const isOutOfStock = currentStock === 0;

                    // Simple logic for list preview colors
                    let statusColor = "bg-success/20 text-success border-success/20";
                    if (isOutOfStock) statusColor = "bg-danger/20 text-danger border-danger/20";
                    // Note: We can add more complex logic here if needed, but keeping it simple for the list

                    return (
                        <div
                            key={med.id}
                            onClick={() => setSelectedMedication(med)}
                            className="glass-card p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${statusColor}`}>
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{med.name}</h3>
                                    <p className="text-sm text-text-muted">Stock: <span className="text-white font-mono">{currentStock}</span></p>
                                </div>
                            </div>
                            <div className="text-gray-500 group-hover:translate-x-1 transition-transform">
                                <ArrowLeft size={24} className="rotate-180" /> {/* Right Arrow */}
                            </div>
                        </div>
                    );
                })}
                {activeMedications.length === 0 && (
                    <div className="glass-card p-12 text-center">
                        <p className="text-text-muted">No hay medicamentos activos</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderDetailView = () => {
        const medication = activeMedications.find(m => m.id === selectedMedication.id);
        if (!medication) return renderListView(); // Fallback

        const dailyDoses = calculateDailyDoses(medication.dosagePattern);
        const pillFraction = parseFloat(medication.pillFraction) || 1;
        const dailyUsage = calculateDailyUsage(dailyDoses, pillFraction);
        const currentStock = parseFloat(medication.current_stock) || 0;
        const remainingDays = calculateRemainingDays(currentStock, dailyUsage);
        const isLowStock = remainingDays < 7 && remainingDays > 0;
        const isOutOfStock = currentStock === 0;

        return (
            <div className="space-y-6">
                {/* Back Navigation */}
                <button
                    onClick={() => setSelectedMedication(null)}
                    className="btn btn-ghost mb-2 px-4 py-2 text-base flex items-center gap-2"
                >
                    <ArrowLeft size={22} />
                    <span>Volver a la lista</span>
                </button>

                {/* Detail Card (The original full card) */}
                <div className="glass-card p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{medication.name}</h3>
                            {medication.presentation && (
                                <p className="text-base text-text-muted">{medication.presentation}</p>
                            )}
                        </div>
                        {isOutOfStock ? (
                            <span className="px-4 py-2 bg-danger/20 text-danger rounded-full text-base font-semibold flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Sin Stock
                            </span>
                        ) : isLowStock ? (
                            <span className="px-4 py-2 bg-warning/20 text-warning rounded-full text-base font-semibold flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Stock Bajo
                            </span>
                        ) : (
                            <span className="px-4 py-2 bg-success/20 text-success rounded-full text-base font-semibold flex items-center gap-2">
                                <CheckCircle size={20} />
                                Stock OK
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-glass rounded-lg">
                            <p className="text-xs text-text-muted uppercase mb-1">Stock Actual</p>
                            <p className="text-3xl font-bold text-white">{currentStock}</p>
                            <p className="text-xs text-text-muted">pastillas</p>
                        </div>

                        <div className="p-4 bg-glass rounded-lg">
                            <p className="text-xs text-text-muted uppercase mb-1">Uso Diario</p>
                            <p className="text-3xl font-bold text-white">{dailyUsage}</p>
                            <p className="text-xs text-text-muted">
                                pastillas/día
                            </p>
                        </div>

                        <div className="p-4 bg-glass rounded-lg">
                            <p className="text-xs text-text-muted uppercase mb-1">Días Restantes</p>
                            <p className="text-3xl font-bold text-white">{remainingDays}</p>
                            <p className="text-xs text-text-muted">días estimados</p>
                        </div>

                        <div className="p-4 bg-glass rounded-lg">
                            <p className="text-xs text-text-muted uppercase mb-1">Patrón</p>
                            <p className="text-xl font-bold text-white">{medication.dosagePattern}</p>
                            <p className="text-xs text-text-muted">dosis/día</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-text-muted">Estado del suministro</span>
                            <span className="text-white font-medium">{Math.min((remainingDays / 30) * 100, 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-glass rounded-full h-4 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${isOutOfStock ? 'bg-danger' :
                                    isLowStock ? 'bg-warning' :
                                        'bg-success'
                                    }`}
                                style={{ width: `${Math.min((remainingDays / 30) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Stock Adjustment */}
                    <div className="bg-glass/50 p-4 rounded-xl border border-glass-border">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Package size={20} className="text-primary" />
                            Ajustar Inventario
                        </h4>

                        {adjustingMed === medication.id ? (
                            <div className="flex gap-2 items-end animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex-1">
                                    <label htmlFor={`adjust-${medication.id}`} className="text-xs text-text-muted mb-1 block">Cantidad</label>
                                    <input
                                        id={`adjust-${medication.id}`}
                                        type="number"
                                        value={adjustAmount}
                                        onChange={(e) => setAdjustAmount(e.target.value)}
                                        placeholder="0"
                                        min="1"
                                        autoFocus
                                        className="w-full text-lg"
                                    />
                                </div>
                                <button
                                    onClick={() => handleAdjustStock(medication.id, true)}
                                    className="btn btn-secondary px-4 h-[42px]"
                                >
                                    <Plus size={20} />
                                    <span className="hidden sm:inline ml-1">Entrada</span>
                                </button>
                                <button
                                    onClick={() => handleAdjustStock(medication.id, false)}
                                    className="btn btn-ghost px-4 h-[42px] hover:bg-red-500/20 hover:text-red-400"
                                >
                                    <Minus size={20} />
                                    <span className="hidden sm:inline ml-1">Salida</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setAdjustingMed(null);
                                        setAdjustAmount('');
                                    }}
                                    className="btn btn-ghost px-3 h-[42px]"
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAdjustingMed(medication.id)}
                                className="btn btn-primary w-full py-3 text-lg shadow-lg shadow-primary/20"
                            >
                                Modificar Stock
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto max-w-4xl">
            {selectedMedication ? renderDetailView() : renderListView()}
        </div>
    );
};

export default ResidentInventory;
