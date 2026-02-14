import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Menu, X, BarChart3, Settings, Calendar, Package } from 'lucide-react';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
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

    return (
        <>
            {/* Mobile Menu Button - Only visible when menu is closed */}
            <button
                onClick={() => setIsOpen(true)}
                className={`lg:hidden fixed top-4 right-4 z-50 p-3 bg-glass border border-glass-border rounded-lg shadow-lg backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                aria-label="Toggle menu"
            >
                <Menu size={24} className="text-white" />
            </button>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen w-80 border-r border-glass-border
                    transition-transform duration-300 flex flex-col
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
                style={{ backgroundColor: '#0F172A', zIndex: 9999 }}
            >
                {/* Logo Section */}
                <div className="p-8 border-b border-glass-border relative">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden absolute top-2 right-2 p-4 text-text-muted hover:text-white transition-colors"
                        style={{ zIndex: 10000 }}
                        aria-label="Cerrar menú"
                    >
                        <X size={32} />
                    </button>
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

                <div className="flex-shrink-0 border-t border-glass-border bg-[#0F172A] p-4">
                    <div className="p-3 text-center border border-white/5 rounded-xl bg-white/[0.02]">
                        <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest">Premium Edition v2.5</p>
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
