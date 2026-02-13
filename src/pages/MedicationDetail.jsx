import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Pill } from 'lucide-react';

const MedicationDetail = () => {
    const { residentId, medicationId } = useParams();
    const navigate = useNavigate();
    const { residents } = useApp();

    const resident = residents.find(r => r.id === residentId);
    const medication = resident?.medications?.find(m => m.id === medicationId);

    if (!resident || !medication) {
        return (
            <div className="glass-card p-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Medicamento no encontrado</h2>
                <button onClick={() => navigate('/residents')} className="btn btn-primary">
                    <ArrowLeft size={20} />
                    Volver a Residentes
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="glass-card p-4 md:p-6">
                <button
                    onClick={() => navigate(`/resident/${residentId}/kardex`)}
                    className="btn btn-ghost mb-4 px-4 py-2.5 text-base"
                >
                    <ArrowLeft size={22} />
                    <span className="hidden sm:inline">Volver al Kardex</span>
                </button>

                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Pill className="text-primary" size={32} />
                    </div>
                    {medication.name}
                </h1>
                <p className="text-text-muted mt-2">{resident.name}</p>
            </div>

            <div className="glass-card p-12 text-center">
                <div className="p-6 bg-primary/10 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                    <Pill size={64} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Detalles del Medicamento</h3>
                <p className="text-text-muted">Esta sección estará disponible próximamente</p>
            </div>
        </div>
    );
};

export default MedicationDetail;
