import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Calendar as CalendarIcon, Clock, Users, ArrowLeft, Pill, ChevronRight } from 'lucide-react';
import { getDayName, getFormattedDate } from '../utils/dateHelpers';

const CalendarPage = () => {
    const navigate = useNavigate();
    const { residents, loading } = useApp();

    const todayMedications = useMemo(() => {
        const meds = [];
        residents.forEach(resident => {
            resident.medications?.forEach(med => {
                if (med.status === 'active') {
                    // Split dosage pattern (e.g., "08:00-16:00-22:00")
                    const hours = med.dosagePattern?.split('-') || [];
                    hours.forEach(hour => {
                        meds.push({
                            ...med,
                            residentName: resident.name,
                            residentId: resident.id,
                            time: hour,
                            // Quick sortable time value
                            sortTime: parseInt(hour.replace(':', ''))
                        });
                    });
                }
            });
        });
        return meds.sort((a, b) => a.sortTime - b.sortTime);
    }, [residents]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            {/* Header */}
            <div className="glass-card p-6">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-text-muted hover:text-primary mb-4 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-1" />
                    Volver al Dashboard
                </button>
                <div className="flex items-center gap-4">
                    <div className="p-3 gradient-primary rounded-xl shadow-lg shadow-primary/20">
                        <CalendarIcon className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Calendario Global</h1>
                        <p className="text-text-muted mt-1">
                            {getDayName(new Date())}, {getFormattedDate(new Date())}
                        </p>
                    </div>
                </div>
            </div>

            {/* Timeline View */}
            <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 md:before:left-1/2 before:w-0.5 before:bg-glass-border before:-z-10">
                {todayMedications.length > 0 ? (
                    todayMedications.map((med, index) => (
                        <div key={`${med.id}-${med.time}-${index}`} className="relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0">
                            {/* Time Marker */}
                            <div className="md:w-1/2 md:pr-12 flex justify-start md:justify-end">
                                <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-glow-sm">
                                    <Clock size={16} />
                                    {med.time}
                                </div>
                            </div>

                            {/* Center Dot */}
                            <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-[#0F172A] z-10 hidden md:block"></div>

                            {/* Content Card */}
                            <div className="pl-12 md:pl-12 md:w-1/2 w-full">
                                <div
                                    onClick={() => navigate(`/resident/${med.residentId}/administer`)}
                                    className="glass-card p-5 hover:border-primary/50 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-secondary/10 text-secondary rounded-lg group-hover:scale-110 transition-transform">
                                                <Pill size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{med.name}</h3>
                                                <div className="flex items-center gap-2 text-text-muted mt-1">
                                                    <Users size={14} />
                                                    <span className="text-sm font-medium">{med.residentName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-text-muted group-hover:text-primary transition-colors" size={24} />
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-white/5 rounded text-xs text-text-muted">
                                            {med.presentation || 'Tableta'}
                                        </span>
                                        <span className="px-2 py-1 bg-white/5 rounded text-xs text-text-muted">
                                            Dosis: {med.dosagePattern}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-card p-12 text-center">
                        <p className="text-text-muted">No hay medicamentos programados para hoy.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarPage;
