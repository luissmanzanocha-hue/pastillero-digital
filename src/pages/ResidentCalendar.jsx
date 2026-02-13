import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Calendar } from 'lucide-react';

const ResidentCalendar = () => {
    const { residentId } = useParams();
    const navigate = useNavigate();
    const { residents } = useApp();

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

    const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const timeSlots = [
        { id: 0, label: 'Mañana', icon: '☀️' },
        { id: 1, label: 'Tarde', icon: '🌤️' },
        { id: 2, label: 'Noche', icon: '🌙' }
    ];

    const getScheduleForMed = (med) => {
        // Try to parse "1-0-1" format
        if (med.dosagePattern && med.dosagePattern.includes('-')) {
            const parts = med.dosagePattern.split('-').map(p => parseFloat(p));
            // Standardize to 3 slots if possible. 
            // If 3 parts: M-T-N. If 4 parts: M-T-N-S(Sleep)? We'll assume first 3 map to our slots.
            return parts.slice(0, 3).map((dose, index) => ({
                slotId: index,
                dose: dose
            }));
        }
        return []; // Non-standard pattern
    };

    const activeMedications = resident.medications?.filter(m => m.status === 'active') || [];

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

                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Calendar className="text-primary" size={32} />
                    </div>
                    Calendario Semanal
                </h1>
                <p className="text-text-muted mt-2">{resident.name}</p>
            </div>

            {/* Weekly Grid */}
            <div className="glass-card p-6 overflow-x-auto">
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-8 gap-4 mb-4 border-b border-glass-border pb-4">
                        <div className="font-bold text-text-muted">Horario</div>
                        {weekDays.map(day => (
                            <div key={day} className="font-bold text-center text-white">{day}</div>
                        ))}
                    </div>

                    {timeSlots.map(slot => (
                        <div key={slot.id} className="grid grid-cols-8 gap-4 mb-6">
                            <div className="flex flex-col justify-center">
                                <span className="text-2xl mb-1">{slot.icon}</span>
                                <span className="font-bold text-gray-300">{slot.label}</span>
                            </div>
                            {weekDays.map(day => (
                                <div key={`${slot.id}-${day}`} className="bg-glass/30 rounded-xl p-2 min-h-[100px] border border-glass-border">
                                    {activeMedications.map(med => {
                                        const schedule = getScheduleForMed(med);
                                        const slotSchedule = schedule.find(s => s.slotId === slot.id);

                                        if (slotSchedule && slotSchedule.dose > 0) {
                                            return (
                                                <div key={med.id} className="mb-2 p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30 text-xs">
                                                    <div className="font-bold text-indigo-200 truncate" title={med.name}>{med.name}</div>
                                                    <div className="text-indigo-300">{slotSchedule.dose} {parseFloat(med.pillFraction) < 1 ? 'pastilla' : 'tabs'}</div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Non-Standard Schedule Notes */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-secondary" />
                    Otros Horarios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeMedications.filter(m => getScheduleForMed(m).length === 0).map(med => (
                        <div key={med.id} className="p-4 bg-glass rounded-lg border-l-4 border-secondary">
                            <h4 className="font-bold text-white">{med.name}</h4>
                            <p className="text-text-muted mt-1">
                                <span className="font-semibold text-secondary">Frecuencia:</span> {med.dosagePattern}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">Consultar indicaciones específicas</p>
                        </div>
                    ))}
                    {activeMedications.filter(m => getScheduleForMed(m).length === 0).length === 0 && (
                        <p className="text-text-muted italic">Todos los medicamentos están en el calendario semanal.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResidentCalendar;
