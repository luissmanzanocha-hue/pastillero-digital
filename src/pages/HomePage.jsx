import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Users, Pill, AlertTriangle, Plus, ArrowRight, Activity, Package, TrendingUp, CheckCircle } from 'lucide-react';
import { calculateDailyDoses, calculateDailyUsage, calculateRemainingDays } from '../utils/calculations';

const HomePage = () => {
    const navigate = useNavigate();
    const { residents } = useApp();

    const totalMedications = residents.reduce((sum, r) => sum + (r.medications?.length || 0), 0);
    const activeMedications = residents.reduce((sum, r) =>
        sum + (r.medications?.filter(m => m.status === 'active').length || 0), 0
    );

    const lowStockMedications = residents.reduce((count, resident) => {
        return count + (resident.medications?.filter(med => {
            if (med.status !== 'active') return false;
            const dailyDoses = calculateDailyDoses(med.dosagePattern);
            const pillFraction = parseFloat(med.pillFraction) || 1;
            const dailyUsage = calculateDailyUsage(dailyDoses, pillFraction);
            const stock = med.inventory?.currentStock || 0;
            const remainingDays = calculateRemainingDays(stock, dailyUsage);
            return remainingDays < 7 && remainingDays >= 0;
        }).length || 0);
    }, 0);

    const criticalStockMedications = residents.reduce((count, resident) => {
        return count + (resident.medications?.filter(med => {
            if (med.status !== 'active') return false;
            const stock = med.inventory?.currentStock || 0;
            return stock === 0;
        }).length || 0);
    }, 0);

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 gradient-primary opacity-10"></div>
                <div className="glass-card p-8 md:p-12 relative">
                    <div className="max-w-3xl">

                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Gestión Inteligente de <span className="gradient-text">Medicamentos</span>
                        </h1>
                        <p className="text-lg text-text-secondary mb-8">
                            Plataforma premium para la administración de cuidados y medicación.
                            Control total, seguridad y trazabilidad para nuestros residentes.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate('/residents')}
                                className="btn btn-primary px-8 py-4 text-lg"
                            >
                                <Plus size={24} />
                                Nuevo Residente
                            </button>
                            <button
                                onClick={() => navigate('/residents')}
                                className="btn btn-ghost px-8 py-4 text-lg"
                            >
                                Ver Todos
                                <ArrowRight size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Redesigned */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Residents */}
                <div
                    className="glass-card p-6 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => navigate('/residents')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 gradient-primary rounded-xl">
                            <Users size={28} className="text-white" />
                        </div>
                        <TrendingUp className="text-success" size={20} />
                    </div>
                    <h3 className="text-5xl font-bold mb-2 gradient-text">{residents.length}</h3>
                    <p className="text-text-secondary font-semibold">Residentes</p>
                    <p className="text-xs text-text-muted mt-2">Click para gestionar</p>
                </div>

                {/* Active Medications */}
                <div
                    className="glass-card p-6 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => navigate('/global-inventory?filter=all')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 gradient-secondary rounded-xl">
                            <Pill size={28} className="text-white" />
                        </div>
                        <Activity className="text-secondary" size={20} />
                    </div>
                    <h3 className="text-5xl font-bold mb-2">{activeMedications}</h3>
                    <p className="text-text-secondary font-semibold">Medicamentos Activos</p>
                    <p className="text-xs text-text-muted mt-2">de {totalMedications} totales</p>
                </div>

                {/* Low Stock Alerts */}
                <div
                    className={`glass-card p-6 cursor-pointer hover:scale-105 transition-transform ${lowStockMedications > 0 ? 'border-2 border-warning/50' : ''}`}
                    onClick={() => navigate('/global-inventory?filter=low')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${lowStockMedications > 0 ? 'bg-warning/20' : 'bg-glass'}`}>
                            <AlertTriangle size={28} className={lowStockMedications > 0 ? 'text-warning' : 'text-text-muted'} />
                        </div>
                        {lowStockMedications > 0 && (
                            <span className="px-2 py-1 bg-warning/20 text-warning text-xs font-bold rounded-full">
                                ¡ATENCIÓN!
                            </span>
                        )}
                    </div>
                    <h3 className={`text-5xl font-bold mb-2 ${lowStockMedications > 0 ? 'text-warning' : ''}`}>
                        {lowStockMedications}
                    </h3>
                    <p className="text-text-secondary font-semibold">Stock Bajo</p>
                    <p className="text-xs text-text-muted mt-2">{'<'} 7 días restantes</p>
                </div>

                {/* Critical Stock */}
                <div
                    className={`glass-card p-6 cursor-pointer hover:scale-105 transition-transform ${criticalStockMedications > 0 ? 'border-2 border-danger/50' : ''}`}
                    onClick={() => navigate('/global-inventory?filter=critical')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${criticalStockMedications > 0 ? 'bg-danger/20' : 'bg-glass'}`}>
                            <Package size={28} className={criticalStockMedications > 0 ? 'text-danger' : 'text-text-muted'} />
                        </div>
                        {criticalStockMedications === 0 && (
                            <CheckCircle className="text-success" size={20} />
                        )}
                    </div>
                    <h3 className={`text-5xl font-bold mb-2 ${criticalStockMedications > 0 ? 'text-danger' : 'text-success'}`}>
                        {criticalStockMedications}
                    </h3>
                    <p className="text-text-secondary font-semibold">Sin Stock</p>
                    <p className="text-xs text-text-muted mt-2">
                        {criticalStockMedications === 0 ? 'Todo en orden' : 'Requiere atención'}
                    </p>
                </div>
            </div>

            {/* Recent Residents - Improved */}
            {residents.length > 0 ? (
                <div className="glass-card p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Residentes Activos</h2>
                        <button
                            onClick={() => navigate('/residents')}
                            className="btn btn-ghost text-sm"
                        >
                            Ver Todos
                            <ArrowRight size={18} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {residents.slice(0, 6).map(resident => {
                            const activeMeds = resident.medications?.filter(m => m.status === 'active').length || 0;
                            const totalMeds = resident.medications?.length || 0;

                            return (
                                <div
                                    key={resident.id}
                                    className="glass-card p-5 hover:scale-102 transition-all cursor-pointer border border-glass-border hover:border-primary/50"
                                    onClick={() => navigate(`/resident/${resident.id}`)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 gradient-primary rounded-lg">
                                                <Users size={22} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">{resident.name}</p>
                                                {resident.age && (
                                                    <p className="text-xs text-text-muted mt-1">Edad: {resident.age}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-glass-border">
                                        <div className="flex items-center gap-2">
                                            <Pill size={16} className="text-secondary" />
                                            <span className="text-sm font-semibold">
                                                {activeMeds} activos
                                            </span>
                                        </div>
                                        <span className="text-xs text-text-muted">
                                            {totalMeds} total
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <div className="p-8 bg-primary/10 rounded-full w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                        <Users size={80} className="text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">¡Comienza Ahora!</h3>
                    <p className="text-text-muted mb-8 max-w-md mx-auto">
                        No hay residentes registrados. Agrega tu primer residente para comenzar a gestionar medicamentos.
                    </p>
                    <button
                        onClick={() => navigate('/residents')}
                        className="btn btn-primary px-8 py-4 text-lg"
                    >
                        <Plus size={24} />
                        Agregar Primer Residente
                    </button>
                </div>
            )}
        </div>
    );
};

export default HomePage;
