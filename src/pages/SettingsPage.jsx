import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Database, Moon, Sun, Building2, ArrowLeft, Download, Upload, UploadCloud, RefreshCcw, LogOut, User, Stethoscope, Plus, Trash2, Eye, EyeOff, Copy, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { residents, migrateLocalData } = useApp();
    const { user, signOut } = useAuth();
    const [theme, setTheme] = useState('dark');
    const [isMigrating, setIsMigrating] = useState(false);

    // Nurse management state
    const [nurses, setNurses] = useState([]);
    const [nursesLoading, setNursesLoading] = useState(true);
    const [newNurseName, setNewNurseName] = useState('');
    const [createdNurse, setCreatedNurse] = useState(null);
    const [showPasswords, setShowPasswords] = useState({});
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        fetchNurses();
    }, []);

    const fetchNurses = async () => {
        setNursesLoading(true);
        try {
            const { data, error } = await supabase
                .from('nurses')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error) setNurses(data || []);
        } catch (e) {
            console.error('Error fetching nurses:', e);
        } finally {
            setNursesLoading(false);
        }
    };

    const generateUsername = (fullName) => {
        const parts = fullName.trim().toLowerCase().split(/\s+/);
        if (parts.length >= 2) {
            return `enf.${parts[0]}.${parts[parts.length - 1]}`;
        }
        return `enf.${parts[0]}`;
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleCreateNurse = async () => {
        if (!newNurseName.trim()) return;

        const username = generateUsername(newNurseName);
        const password = generatePassword();

        try {
            const { data, error } = await supabase
                .from('nurses')
                .insert([{
                    full_name: newNurseName.trim(),
                    username: username,
                    password: password,
                    created_by: user?.id || null,
                    is_active: true
                }])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    alert('Ya existe una enfermera con ese nombre de usuario. Intenta con otro nombre.');
                } else {
                    throw error;
                }
                return;
            }

            setCreatedNurse({ ...data, password });
            setNewNurseName('');
            fetchNurses();
        } catch (error) {
            console.error('Error creating nurse:', error);
            alert('Error al crear la enfermera.');
        }
    };

    const handleDeleteNurse = async (nurseId, nurseName) => {
        if (!window.confirm(`¿Eliminar a ${nurseName}? Esta acción no se puede deshacer.`)) return;

        try {
            const { error } = await supabase
                .from('nurses')
                .delete()
                .eq('id', nurseId);

            if (error) throw error;
            fetchNurses();
        } catch (error) {
            console.error('Error deleting nurse:', error);
            alert('Error al eliminar la enfermera.');
        }
    };

    const toggleShowPassword = (nurseId) => {
        setShowPasswords(prev => ({ ...prev, [nurseId]: !prev[nurseId] }));
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const handleSave = () => {
        alert('Configuración guardada correctamente.');
    };

    const handleSignOut = async () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            try {
                await signOut();
            } catch (error) {
                console.error('Error signing out:', error);
            }
        }
    };

    const handleExport = () => {
        try {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ residents }));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `pastillero_backup_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        } catch (error) {
            console.error('Error al exportar:', error);
            alert('Error al exportar los datos.');
        }
    };

    const handleMigration = async () => {
        if (window.confirm('¿Estás seguro de que deseas migrar tus datos locales a la nube? Esto copiará todos tus residentes y medicamentos a tu cuenta de Supabase.')) {
            setIsMigrating(true);
            try {
                const success = await migrateLocalData();
                if (success) {
                    alert('Migración completada con éxito.');
                }
            } catch (error) {
                console.error('Error en la migración:', error);
            } finally {
                setIsMigrating(false);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="glass-card p-6">
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-ghost mb-4 text-white"
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
                            <h1 className="text-3xl font-bold text-white">Configuración</h1>
                            <p className="text-text-muted mt-1">Personaliza tu experiencia y gestiona tus datos</p>
                        </div>
                    </div>

                    <div className="max-w-[150px] text-center md:text-right border-t md:border-t-0 md:border-l border-white/5 pt-2 md:pt-0 md:pl-4 opacity-70">
                        <p className="text-[10px] text-white font-bold whitespace-nowrap">
                            © 2026 José Luis Manzano
                        </p>
                        <p className="text-[8px] text-text-muted leading-tight italic">
                            Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* General Settings */}
                    <div className="glass-card p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                            <Building2 size={24} className="text-primary" />
                            General
                        </h3>

                        <div className="space-y-6">
                            <div className="mb-8 border-b border-white/5 pb-8">
                                <label className="block text-sm font-bold text-white uppercase tracking-wider mb-4">Cuenta de Usuario</label>
                                <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-glass-border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/20 rounded-full">
                                            <User size={20} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{user?.email}</p>
                                            <p className="text-xs text-text-muted">Administrador</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="btn btn-ghost text-red-400 hover:bg-red-500/10 hover:text-red-400"
                                        title="Cerrar Sesión"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </div>
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
                                        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all opacity-50 cursor-not-allowed border-glass-border text-text-muted`}
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

                    {/* Nurse Management Section */}
                    <div className="glass-card p-8 border-l-4 border-emerald-500">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                            <Stethoscope size={24} className="text-emerald-400" />
                            Gestión de Enfermeras
                        </h3>

                        {/* Create Nurse */}
                        <div className="bg-white/5 rounded-xl p-5 border border-glass-border mb-6">
                            <label className="block text-sm font-bold text-white uppercase tracking-wider mb-3">Nueva Enfermera</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newNurseName}
                                    onChange={(e) => setNewNurseName(e.target.value)}
                                    placeholder="Nombre completo (ej: María López)"
                                    className="flex-1 bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateNurse()}
                                />
                                <button
                                    onClick={handleCreateNurse}
                                    disabled={!newNurseName.trim()}
                                    className="px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{ background: newNurseName.trim() ? 'linear-gradient(135deg, #059669, #10B981)' : undefined }}
                                >
                                    <Plus size={20} />
                                    Crear
                                </button>
                            </div>
                            {newNurseName.trim() && (
                                <p className="text-xs text-emerald-400 mt-2">
                                    Usuario generado: <span className="font-mono font-bold">{generateUsername(newNurseName)}</span>
                                </p>
                            )}
                        </div>

                        {/* Created Nurse Credentials Modal */}
                        {createdNurse && (
                            <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl p-5 mb-6 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle size={20} className="text-emerald-400" />
                                    <h4 className="font-bold text-emerald-400">¡Enfermera creada exitosamente!</h4>
                                </div>
                                <p className="text-xs text-text-muted mb-4">Guarda estas credenciales. La contraseña no se puede recuperar después.</p>

                                <div className="space-y-3 bg-black/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-text-muted uppercase">Nombre</p>
                                            <p className="text-white font-bold">{createdNurse.full_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-text-muted uppercase">Usuario</p>
                                            <p className="text-white font-mono font-bold">{createdNurse.username}</p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(createdNurse.username, 'user-new')}
                                            className="text-emerald-400 hover:text-emerald-300 p-1"
                                        >
                                            {copiedId === 'user-new' ? <CheckCircle size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-text-muted uppercase">Contraseña</p>
                                            <p className="text-white font-mono font-bold text-lg">{createdNurse.password}</p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(createdNurse.password, 'pass-new')}
                                            className="text-emerald-400 hover:text-emerald-300 p-1"
                                        >
                                            {copiedId === 'pass-new' ? <CheckCircle size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setCreatedNurse(null)}
                                    className="mt-4 text-xs text-text-muted hover:text-white transition-colors"
                                >
                                    Cerrar este aviso
                                </button>
                            </div>
                        )}

                        {/* Nurses List */}
                        <div className="space-y-3">
                            {nursesLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-emerald-500"></div>
                                </div>
                            ) : nurses.length === 0 ? (
                                <div className="text-center py-8">
                                    <Stethoscope size={32} className="text-text-muted mx-auto mb-2 opacity-30" />
                                    <p className="text-text-muted text-sm">No hay enfermeras registradas.</p>
                                </div>
                            ) : (
                                nurses.map(nurse => (
                                    <div key={nurse.id} className="bg-white/5 rounded-xl p-4 border border-glass-border flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                <Stethoscope size={18} className="text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{nurse.full_name}</p>
                                                <p className="text-xs text-text-muted font-mono">{nurse.username}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs text-text-muted">
                                                        Contraseña: {showPasswords[nurse.id] ? (
                                                            <span className="font-mono text-emerald-400 font-bold">{nurse.password}</span>
                                                        ) : '••••••'}
                                                    </p>
                                                    <button
                                                        onClick={() => toggleShowPassword(nurse.id)}
                                                        className="text-text-muted hover:text-white transition-colors"
                                                    >
                                                        {showPasswords[nurse.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteNurse(nurse.id, nurse.full_name)}
                                            className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Eliminar enfermera"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-8 border-l-4 border-secondary">
                        <h1 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                            <Database size={24} className="text-secondary" />
                            Gestión de Datos
                        </h1>

                        <div className="space-y-4">
                            <button
                                onClick={handleMigration}
                                disabled={isMigrating}
                                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${isMigrating ? 'bg-primary/10 border-primary text-primary cursor-not-allowed' : 'bg-primary/20 border-primary/30 hover:bg-primary/30 text-white shadow-lg shadow-primary/10'}`}
                            >
                                <div className="flex items-center gap-3">
                                    {isMigrating ? <RefreshCcw size={22} className="animate-spin" /> : <UploadCloud size={22} className="text-primary" />}
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
                                <b>Nota Cloud:</b> Tus datos ahora se guardan automáticamente en la nube.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
