import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Menu, X, Pill, BarChart3, Settings, Calendar, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
    const { isSidebarOpen, toggleSidebar, closeSidebar } = useApp();
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
                onClick={toggleSidebar}
                className={`lg:hidden fixed top-4 right-4 z-50 p-3 bg-glass border border-glass-border rounded-lg shadow-lg backdrop-blur-md transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                aria-label="Toggle menu"
            >                <Menu size={24} className="text-white" />
            </button>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 w-80 border-r border-glass-border
                    transition-transform duration-300 flex flex-col
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
                style={{ backgroundColor: '#0F172A', zIndex: 9999, height: '100dvh' }}
            >
                {/* Logo Section */}
                <div className="p-8 border-b border-glass-border relative">
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
                                    onClick={closeSidebar}
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

                <div className="flex-shrink-0 border-t border-glass-border bg-[#0F172A] p-4 pb-12">
                    {/* Mobile Close Button (Bottom) */}
                    <div className="lg:hidden w-full mb-2 relative z-[10000]">
                        <button
                            type="button"
                            onClick={closeSidebar}
                            className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 hover:bg-red-500/20 active:bg-red-500/30 transition-all active:scale-95 cursor-pointer"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            <X size={20} />
                            <span className="font-bold uppercase tracking-widest text-sm">Cerrar Menú</span>
                        </button>
                    </div>

                    <div className="p-3 text-center border border-white/5 rounded-xl bg-white/[0.02]">
                        <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest">Premium Edition v2.5</p>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 z-30"
                    onClick={closeSidebar}
                />
            )}
        </>
    );
};

export default Sidebar;
