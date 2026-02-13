import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, FileText, Package, Calendar, History, FileBarChart, Pill } from 'lucide-react';

const ResidentDashboard = () => {
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

    const activeMedications = resident.medications?.filter(m => m.status === 'active').length || 0;
    const totalMedications = resident.medications?.length || 0;

    const sections = [
        {
            title: 'Kardex',
            description: 'Gestionar medicamentos',
            icon: FileText,
            path: `/resident/${residentId}/kardex`,
            color: 'primary'
        },
        {
            title: 'Inventario',
            description: 'Control de stock',
            icon: Package,
            path: `/resident/${residentId}/inventory`,
            color: 'secondary'
        },
        {
            title: 'Calendario',
            description: 'Horarios de medicación',
            icon: Calendar,
            path: `/resident/${residentId}/calendar`,
            color: 'primary'
        },
        {
            title: 'Historial',
            description: 'Registro de administración',
            icon: History,
            path: `/resident/${residentId}/history`,
            color: 'secondary'
        },
        {
            title: 'Reportes',
            description: 'Análisis y estadísticas',
            icon: FileBarChart,
            path: `/resident/${residentId}/reports`,
            color: 'primary'
        }
    ];

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            {/* Header */}
            <div className="glass-card p-4 md:p-6">
                <button
                    onClick={() => navigate('/residents')}
                    className="btn btn-ghost mb-4 px-4 py-2.5 text-base"
                >
                    <ArrowLeft size={22} />
                    <span className="hidden sm:inline">Volver a Residentes</span>
                </button>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{resident.name}</h1>
                        {resident.age && (
                            <p className="mt-2 text-sm text-text-muted">Edad: {resident.age} años</p>
                        )}
                    </div>
                </div>

                {resident.notes && (
                    <div className="mt-4 p-4 bg-glass rounded-lg">
                        <p className="text-sm text-text-secondary">{resident.notes}</p>
                    </div>
                )}
            </div>

            {/* Medication Summary */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-secondary/20 rounded-lg">
                        <Pill className="text-secondary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Resumen de Medicamentos</h2>
                        <p className="text-sm text-text-muted">
                            {activeMedications} activos de {totalMedications} totales
                        </p>
                    </div>
                </div>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section, index) => {
                    const Icon = section.icon;
                    const colorClasses = {
                        primary: 'bg-primary/20 text-primary',
                        secondary: 'bg-secondary/20 text-secondary'
                    };

                    return (
                        <Link
                            key={index}
                            to={section.path}
                            className="glass-card p-6 hover:scale-105 transition-transform"
                        >
                            <div className={`p-3 rounded-lg ${colorClasses[section.color]} w-fit mb-4`}>
                                <Icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                            <p className="text-sm text-text-muted">{section.description}</p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default ResidentDashboard;
