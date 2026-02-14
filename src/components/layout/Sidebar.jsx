import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Menu, X, Pill, BarChart3, Settings, Calendar, Package, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, signOut } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Residentes', href: '/residents', icon: Users },
        { name: 'Inventario', href: '/global-inventory', icon: Package },
        { name: 'Calendario', href: '/calendar', icon: Calendar },
        { name: 'Reportes', href: '/reports', icon: BarChart3 },
        { name: 'Configuración', href: '/settings', icon: Settings }
    ];

    const isActive = (href) => {
        if (href === '/') return location.pathname === '/';
        return location.pathname.startsWith(href);
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-glass border border-glass-border rounded-lg shadow-lg backdrop-blur-md"
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen w-80 border-r border-glass-border
                    transition-transform duration-300 z-50 flex flex-col
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
                style={{ backgroundColor: '#0F172A' }}
            >
                {/* Logo Section */}
                <div className="p-8 border-b border-glass-border">
                    <div className="flex flex-col items-center">
                        <div className="w-full h-24 flex items-center justify-center p-2 rounded-xl bg-white/5 border border-glass-border overflow-hidden shadow-lg shadow-white/5">
                            <img
                                src="/logo_le_monde_final.png"
                                alt="Le Monde Logo"
                                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Navigation Section */}
                <nav className="flex-1 p-6 overflow-y-auto min-h-0">
                    <div className="space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center gap-4 px-5 py-4 rounded-xl
                                        transition-all duration-300 group
                                        ${active
                                            ? 'bg-primary/20 text-white shadow-lg shadow-primary/10'
                                            : 'text-text-muted hover:bg-glass hover:text-white'
                                        }
                                    `}
                                >
                                    <Icon
                                        size={24}
                                        className={`transition-colors duration-300 ${active ? 'text-primary' : 'text-text-muted group-hover:text-primary'}`}
                                    />
                                    <span className="font-semibold text-base tracking-wide">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                </nav>

                {/* Footer - Logout and User Info */}
                <div className="flex-shrink-0 border-t border-glass-border bg-[#0F172A]">
                    {user && (
                        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-1">Usuario</p>
                            <p className="text-sm text-white font-medium truncate">{user.email}</p>
                        </div>
                    )}

                    <div className="p-4">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300 group"
                        >
                            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                            <span className="font-semibold">Cerrar Sesión</span>
                        </button>
                    </div>

                    <div className="p-3 text-center border-t border-white/5 opacity-30">
                        <p className="text-[9px] text-text-muted font-medium uppercase tracking-widest">Premium Edition</p>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;

