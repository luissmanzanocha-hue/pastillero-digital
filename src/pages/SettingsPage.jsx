import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Database, Moon, Sun, Building2, ArrowLeft, Download, Upload, CloudUpload, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { residents, migrateLocalData } = useApp();
    const [theme, setTheme] = useState('dark');
    const [isMigrating, setIsMigrating] = useState(false);

    // ... handleSave, handleExport ...

    const handleMigration = async () => {
        if (window.confirm('¿Estás seguro de que deseas migrar tus datos locales a la nube? Esto copiará todos tus residentes y medicamentos a tu cuenta de Supabase.')) {
            setIsMigrating(true);
            const success = await migrateLocalData();
            setIsMigrating(false);
            if (success) {
                // Optional: redirect or reload
            }
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            {/* Header */}
            {/* ... */}
            <div className="glass-card p-6">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-text-muted hover:text-primary mb-4 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-1" />
                    Volver al Dashboard
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 gradient-primary rounded-xl shadow-lg shadow-primary/20">
                            <Settings className="text-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Configuración</h1>
                            <p className="text-text-muted mt-1">Personaliza tu experiencia y gestiona tus datos</p>
                        </div>
                    </div>

                    {/* Legal Notice Integration */}
                    <div className="max-w-[150px] text-center md:text-right border-t md:border-t-0 md:border-l border-white/5 pt-2 md:pt-0 md:pl-4 transform scale-[0.1] origin-center md:origin-right opacity-10 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white font-bold whitespace-nowrap">
                            © 2026 José Luis Manzano
                        </p>
                        <p className="text-[8px] text-text-muted leading-tight italic">
                            Todos los derechos reservados. Este software está protegido por las leyes de propiedad intelectual.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* General Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* ... */}
                    <div className="glass-card p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <Building2 size={24} className="text-primary" />
                            General
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-white uppercase tracking-wider mb-2">Tema del Sistema</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/20 text-white shadow-glow-sm' : 'border-glass-border text-text-muted'}`}
                                    >
                                        <Moon size={20} />
                                        Oscuro (Premium)
                                    </button>
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/20 text-white' : 'border-glass-border text-text-muted cursor-not-allowed opacity-50'}`}
                                        disabled
                                    >
                                        <Sun size={20} />
                                        Claro (Próximamente)
                                    </button>
                                </div>
                                <p className="text-xs text-text-muted mt-2">El modo oscuro es la interfaz por defecto para máxima legibilidad.</p>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleSave}
                                    className="btn btn-primary w-full md:w-auto px-8 py-3"
                                >
                                    <Save size={20} />
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Management */}
                <div className="space-y-6">
                    <div className="glass-card p-8 border-l-4 border-secondary">
                        <h1 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <Database size={24} className="text-secondary" />
                            Gestión de Datos
                        </h1>

                        <div className="space-y-4">
                            {/* Migration Button */}
                            <button
                                onClick={handleMigration}
                                disabled={isMigrating}
                                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${isMigrating ? 'bg-primary/10 border-primary text-primary cursor-not-allowed' : 'bg-primary/20 border-primary/30 hover:bg-primary/30 text-white shadow-lg shadow-primary/10'}`}
                            >
                                <div className="flex items-center gap-3">
                                    {isMigrating ? <Loader2 size={22} className="animate-spin" /> : <CloudUpload size={22} className="text-primary" />}
                                    <div className="text-left">
                                        <span className="block font-bold">Sincronizar Nube</span>
                                        <span className="block text-[10px] opacity-70">Migrar datos de este equipo</span>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={handleExport}
                                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-white border border-glass-border"
                            >
                                <div className="flex items-center gap-3">
                                    <Download size={20} className="text-secondary" />
                                    <span>Exportar Backup</span>
                                </div>
                            </button>

                            <button
                                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl opacity-50 cursor-not-allowed text-white border border-glass-border"
                                disabled
                            >
                                <div className="flex items-center gap-3">
                                    <Upload size={20} className="text-text-muted" />
                                    <span>Importar Backup</span>
                                </div>
                            </button>

                            <p className="text-xs text-text-muted border-t border-white/5 pt-4">
                                <b>Nota Cloud:</b> Tus datos ahora se guardan automáticamente en la nube. Usa la opción "Sincronizar" solo para subir datos que tenías antes de esta actualización.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default SettingsPage;
