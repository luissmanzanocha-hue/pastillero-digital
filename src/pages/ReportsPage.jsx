import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Package, ArrowLeft, Pill, Users, Activity } from 'lucide-react';
import { calculateDailyDoses, calculateDailyUsage, calculateRemainingDays } from '../utils/calculations';

const ReportsPage = () => {
    const navigate = useNavigate();
    const { residents, loading } = useApp();

    const stats = useMemo(() => {
        let totalVal = 0;
        let activeCount = 0;
        let criticalCount = 0;
        let lowStockCount = 0;
        let totalDailyUsage = 0;

        residents.forEach(resident => {
            resident.medications?.forEach(med => {
                totalVal++;
                if (med.status === 'active') {
                    activeCount++;
                    const dailyDoses = calculateDailyDoses(med.dosagePattern);
                    const pillFraction = parseFloat(med.pillFraction) || 1;
                    const dailyUsage = calculateDailyUsage(dailyDoses, pillFraction);
                    totalDailyUsage += dailyUsage;

                    const stock = med.inventory?.currentStock || 0;
                    const remainingDays = calculateRemainingDays(stock, dailyUsage);

                    if (stock === 0) criticalCount++;
                    else if (remainingDays < 7) lowStockCount++;
                }
            });
        });

        return {
            total: totalVal,
            active: activeCount,
            critical: criticalCount,
            lowStock: lowStockCount,
            dailyUsage: totalDailyUsage.toFixed(1),
            compliance: 95 // Simulated metric
        };
    }, [residents]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            {/* Header */}
            <div className="glass-card p-6">
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-ghost mb-4 text-white"
                >
                    <ArrowLeft size={20} className="mr-1" />
                    Volver al Dashboard
                </button>
                <div className="flex items-center gap-4">
                    <div className="p-3 gradient-primary rounded-xl shadow-lg shadow-primary/20">
                        <BarChart3 className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Reportes Globales</h1>
                        <p className="text-text-muted mt-1">Métricas y análisis de todo el centro</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary/20 rounded-xl text-primary">
                            <Activity size={24} />
                        </div>
                        <span className="text-success text-xs font-bold flex items-center gap-1">
                            <TrendingUp size={12} /> +12%
                        </span>
                    </div>
                    <p className="text-4xl font-bold text-white mb-1">{stats.active}</p>
                    <p className="text-text-muted text-sm font-medium uppercase tracking-wider">Tratamientos Activos</p>
                </div>

                <div className="glass-card p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-secondary/20 rounded-xl text-secondary">
                            <Pill size={24} />
                        </div>
                        <span className="text-text-muted text-xs font-bold">Hoy</span>
                    </div>
                    <p className="text-4xl font-bold text-white mb-1">{stats.dailyUsage}</p>
                    <p className="text-text-muted text-sm font-medium uppercase tracking-wider">Consumo Diario Estimado</p>
                </div>

                <div className="glass-card p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-success/20 rounded-xl text-success">
                            <CheckCircle size={24} />
                        </div>
                        <span className="text-success text-xs font-bold">{stats.compliance}%</span>
                    </div>
                    <p className="text-4xl font-bold text-white mb-1">{stats.compliance}%</p>
                    <p className="text-text-muted text-sm font-medium uppercase tracking-wider">Tasa de Cumplimiento</p>
                </div>
            </div>

            {/* Alert Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 border-l-4 border-danger">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-danger/20 rounded-xl text-danger">
                            <Package size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Alertas Críticas</h3>
                            <p className="text-text-muted text-sm">Medicamentos sin stock actual</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {stats.critical > 0 ? (
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <span className="font-semibold text-white">{stats.critical} medicamentos agotados</span>
                                <button onClick={() => navigate('/global-inventory?filter=critical')} className="text-primary font-bold text-sm hover:underline">Ver detalles</button>
                            </div>
                        ) : (
                            <p className="text-success font-medium flex items-center gap-2">
                                <CheckCircle size={16} /> Todo el stock está cubierto.
                            </p>
                        )}
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-warning">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-warning/20 rounded-xl text-warning">
                            <AlertTriangle size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Stock Próximo a Agotarse</h3>
                            <p className="text-text-muted text-sm">Menos de 7 días de reserva</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {stats.lowStock > 0 ? (
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <span className="font-semibold text-white">{stats.lowStock} próximos a agotarse</span>
                                <button onClick={() => navigate('/global-inventory?filter=low')} className="text-primary font-bold text-sm hover:underline">Ver detalles</button>
                            </div>
                        ) : (
                            <p className="text-success font-medium flex items-center gap-2">
                                <CheckCircle size={16} /> Niveles de stock saludables.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
