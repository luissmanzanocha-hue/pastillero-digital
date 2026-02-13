import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateWordReport } from '../utils/wordGenerator';
import { ArrowLeft, FileBarChart, Download } from 'lucide-react';

const ResidentReports = () => {
    const { residentId } = useParams();
    const navigate = useNavigate();
    const { residents } = useApp();

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportNotes, setReportNotes] = useState(
        `Recuerden que es importante contar con los medicamentos antes de que termine el mes, tomar en cuenta que el pastillero cubre hasta el día 30 o 31 del mes en curso.\nHorario de recepción: lunes a viernes 10:00 am a 17:30 recibe Jefe de enfermería, sábado y domingo 10:00 a 17:30 recibe enfermeras en turno.`
    );

    const resident = residents.find(r => r.id === residentId);

    if (!resident) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    const activeMedications = resident.medications?.filter(m => m.status === 'active') || [];

    // Calculate stats
    const totalMeds = activeMedications.length;
    const lowStockMeds = activeMedications.filter(m => {
        const dailyDoses = m.dosagePattern.split('-').reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
        const pillFraction = parseFloat(m.pillFraction) || 1;
        const dailyUsage = dailyDoses * pillFraction;
        const currentStock = m.inventory?.currentStock || 0;
        return (currentStock / dailyUsage) < 7;
    });

    const totalStock = activeMedications.reduce((acc, m) => acc + (m.inventory?.currentStock || 0), 0);

    const handleDownload = async () => {
        await generateWordReport(resident, activeMedications, reportNotes);
        setShowReportModal(false);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            {/* Header */}
            <div className="glass-card p-4 md:p-6">
                <button
                    onClick={() => navigate(`/resident/${residentId}`)}
                    className="btn btn-ghost mb-4 px-4 py-2.5 text-base"
                >
                    <ArrowLeft size={22} />
                    <span className="hidden sm:inline">Volver al Dashboard</span>
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <FileBarChart className="text-primary" size={32} />
                        </div>
                        Reporte de {resident.name}
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Download size={18} />
                            <span>Generar Requerimiento (Word)</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Config Modal for Report */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1E293B] p-6 rounded-xl max-w-lg w-full shadow-2xl border border-gray-700">
                        <h3 className="text-xl font-bold mb-4 text-white">Configurar Reporte Word</h3>

                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">Notas del Reporte</label>
                            <textarea
                                value={reportNotes}
                                onChange={(e) => setReportNotes(e.target.value)}
                                className="w-full h-40 bg-black/20 border border-gray-600 rounded-lg p-3 text-sm text-white resize-none focus:border-primary-500 outline-none"
                                placeholder="Escribe las notas aquí..."
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-2">
                                Este texto aparecerá al pie del documento.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="btn btn-ghost"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDownload}
                                className="btn btn-primary"
                            >
                                <Download size={18} />
                                Descargar .docx
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Hidden Printable Report */}
            {/* <RequirementReport
                resident={resident}
                activeMedications={activeMedications}
                notes={reportNotes}
            /> */}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <p className="text-sm text-text-muted uppercase mb-2">Medicamentos Activos</p>
                    <p className="text-4xl font-bold text-white">{totalMeds}</p>
                </div>
                <div className="glass-card p-6">
                    <p className="text-sm text-text-muted uppercase mb-2">Alertas de Stock</p>
                    <p className={`text-4xl font-bold ${lowStockMeds.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {lowStockMeds.length}
                    </p>
                </div>
                <div className="glass-card p-6">
                    <p className="text-sm text-text-muted uppercase mb-2">Inventario Total</p>
                    <p className="text-4xl font-bold text-white">{totalStock}</p>
                    <p className="text-xs text-text-muted">pastillas</p>
                </div>
            </div>

            {/* Adherence Chart (Mockup) */}
            <div className="glass-card p-6 print:hidden">
                <h3 className="text-xl font-bold mb-6">Adherencia Mensual (Simulado)</h3>
                <div className="h-48 flex items-end justify-between gap-2 px-4">
                    {[95, 80, 100, 90, 85, 95, 100].map((val, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1">
                            <div
                                className="w-full bg-primary/50 rounded-t-lg transition-all hover:bg-primary/80"
                                style={{ height: `${val}%` }}
                            ></div>
                            <span className="text-xs text-text-muted">Sem {i + 1}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-center text-sm text-text-muted">
                    Promedio de toma: <span className="text-white font-bold">92%</span>
                </div>
            </div>

            {/* Restock Alerts List */}
            {lowStockMeds.length > 0 && (
                <div className="glass-card p-6 border border-red-500/30 print:hidden">
                    <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
                        ⚠️ Requieren Reabastecimiento
                    </h3>
                    <div className="space-y-3">
                        {lowStockMeds.map(med => (
                            <div key={med.id} className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                                <div>
                                    <p className="font-bold text-white">{med.name}</p>
                                    <p className="text-xs text-red-300">Stock actual: {med.inventory?.currentStock}</p>
                                </div>
                                <button
                                    onClick={() => navigate(`/resident/${residentId}/inventory`)}
                                    className="btn btn-sm btn-secondary"
                                >
                                    Ir a Inventario
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div >
    );
};

export default ResidentReports;
