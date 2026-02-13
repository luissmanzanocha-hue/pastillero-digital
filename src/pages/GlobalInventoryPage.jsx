import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    Search,
    Filter,
    AlertTriangle,
    CheckCircle,
    Package,
    ArrowLeft,
    ArrowRight,
    Users
} from 'lucide-react';
import { calculateDailyDoses, calculateDailyUsage, calculateRemainingDays } from '../utils/calculations';

const GlobalInventoryPage = () => {
    const { residents, loading } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    // Parse query params for initial filter
    const queryParams = new URLSearchParams(location.search);
    const initialFilter = queryParams.get('filter') || 'all';

    const [filter, setFilter] = useState(initialFilter);
    const [searchTerm, setSearchTerm] = useState('');

    // Update filter when URL parameters change
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const newFilter = params.get('filter') || 'all';
        setFilter(newFilter);
    }, [location.search]);

    const allMedications = useMemo(() => {
        if (!residents) return [];
        let meds = [];
        residents.forEach(resident => {
            if (resident?.medications) {
                resident.medications.forEach(med => {
                    if (med.status === 'active') {
                        const dailyDoses = calculateDailyDoses(med.dosagePattern);
                        const pillFraction = parseFloat(med.pillFraction) || 1;
                        const dailyUsage = calculateDailyUsage(dailyDoses, pillFraction);
                        const stock = med.inventory?.currentStock || 0;
                        const remainingDays = calculateRemainingDays(stock, dailyUsage);

                        meds.push({
                            ...med,
                            residentName: resident.name,
                            residentId: resident.id,
                            remainingDays,
                            stock,
                            dailyUsage
                        });
                    }
                });
            }
        });
        return meds.sort((a, b) => a.remainingDays - b.remainingDays);
    }, [residents]);

    const filteredMedications = useMemo(() => {
        return allMedications.filter(med => {
            const matchesSearch =
                med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                med.residentName.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            if (filter === 'critical') return med.stock === 0;
            if (filter === 'low') return med.remainingDays < 7 && med.remainingDays >= 0 && med.stock > 0;
            if (filter === 'good') return med.remainingDays >= 7;

            return true; // 'all' or 'active'
        });
    }, [allMedications, filter, searchTerm]);

    const getStatusColor = (med) => {
        if (med.stock === 0) return 'text-danger bg-danger/10 border-danger/20';
        if (med.remainingDays < 7) return 'text-warning bg-warning/10 border-warning/20';
        return 'text-success bg-success/10 border-success/20';
    };

    const getStatusText = (med) => {
        if (med.stock === 0) return 'Sin Stock';
        if (med.remainingDays < 7) return 'Bajo Stock';
        return 'Stock Correcto';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-text-muted hover:text-primary mb-2 transition-colors"
                        style={{ backgroundColor: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={20} className="mr-1" />
                        Volver al Dashboard
                    </button>
                    <h1 className="text-3xl font-bold gradient-text">Inventario Global</h1>
                    <p className="text-text-secondary">Gestión centralizada de medicamentos</p>
                </div>
            </div>

            {/* Filters & Search - Removed sticky to avoid z-index issues */}
            <div className="glass-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => {
                            navigate('/global-inventory');
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === 'all'
                            ? 'gradient-primary text-white shadow-lg shadow-primary/30'
                            : 'text-gray-400 border border-glass-border hover:bg-glass-hover hover:text-white'
                            }`}
                        style={filter !== 'all' ? { backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}}
                    >
                        Todos ({allMedications.length})
                    </button>
                    <button
                        onClick={() => {
                            navigate('/global-inventory?filter=critical');
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${filter === 'critical'
                            ? 'text-white shadow-lg shadow-danger/30'
                            : 'text-danger border border-danger/20 hover:bg-danger/20'
                            }`}
                        style={filter === 'critical' ? { backgroundColor: 'var(--danger)' } : { backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    >
                        <Package size={16} />
                        Sin Stock
                    </button>
                    <button
                        onClick={() => {
                            navigate('/global-inventory?filter=low');
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${filter === 'low'
                            ? 'text-white shadow-lg shadow-warning/30'
                            : 'text-warning border border-warning/20 hover:bg-warning/20'
                            }`}
                        style={filter === 'low' ? { backgroundColor: 'var(--warning)' } : { backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                    >
                        <AlertTriangle size={16} />
                        Bajo Stock
                    </button>
                    <button
                        onClick={() => {
                            navigate('/global-inventory?filter=good');
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${filter === 'good'
                            ? 'text-white shadow-lg shadow-success/30'
                            : 'text-success border border-success/20 hover:bg-success/20'
                            }`}
                        style={filter === 'good' ? { backgroundColor: 'var(--success)' } : { backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                    >
                        <CheckCircle size={16} />
                        Stock OK
                    </button>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white'
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Inventory List */}
            <div className="grid gap-4">
                {filteredMedications.length > 0 ? (
                    filteredMedications.map((med, index) => (
                        <div
                            key={`${med.residentId}-${med.id}-${index}`}
                            className="glass-card p-4 hover:shadow-md transition-all border border-transparent hover:border-primary/20"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between md:justify-start gap-4 mb-2 md:mb-0">
                                        <h3 className="text-lg font-bold text-white">{med.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(med)}`}>
                                            {getStatusText(med)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-text-secondary mt-1">
                                        <Users size={14} />
                                        <span className="text-sm font-medium">{med.residentName}</span>
                                        <span className="text-gray-300 mx-2">|</span>
                                        <span className="text-sm">{med.presentation || 'Tabletas'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 justify-between md:justify-end bg-white/5 p-3 rounded-lg md:bg-transparent md:p-0">
                                    <div className="text-center">
                                        <p className="text-xs text-text-muted uppercase tracking-wider">Stock</p>
                                        <p className={`text-xl font-bold ${med.stock === 0 ? 'text-danger' : 'text-white'}`}>
                                            {med.stock}
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-xs text-text-muted uppercase tracking-wider">Diario</p>
                                        <p className="text-xl font-bold text-white">{med.dailyUsage}</p>
                                    </div>

                                    <div className="text-center min-w-[80px]">
                                        <p className="text-xs text-text-muted uppercase tracking-wider">Días</p>
                                        <p className={`text-xl font-bold ${med.remainingDays < 7 ? 'text-warning' : 'text-success'}`}>
                                            {med.stock === 0 ? '0' : Math.floor(med.remainingDays)}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/resident/${med.residentId}/inventory`)}
                                        className="btn btn-ghost p-2 hover:bg-primary/10 hover:text-primary rounded-full"
                                        title="Ir al inventario"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 glass-card">
                        <div className="bg-white/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Filter size={32} className="text-text-muted" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No se encontraron resultados</h3>
                        <p className="text-text-secondary">
                            {allMedications.length === 0
                                ? "No hay medicamentos registrados en el sistema."
                                : "Intenta cambiar los filtros o el término de búsqueda."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalInventoryPage;
