import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, X, BarChart3, Settings, Calendar, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
    const { isSidebarOpen } = useApp(); // Kept for context subscription if needed, though strictly we only need this if we want to collapse it on desktop too. 
    // Actually, for this "Desktop Permanent" version, we might not even need isSidebarOpen unless we implement desktop collapsing later.
    // For now, let's keep it simple: It's ALWAYS visible on desktop.
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
        <aside className="hidden lg:flex fixed top-0 left-0 w-80 h-screen bg-[#0F172A] border-r border-glass-border flex-col z-50">
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
            <nav className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
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

            <div className="flex-shrink-0 border-t border-glass-border bg-[#0F172A] p-4 pb-8">
                <div className="p-3 text-center border border-white/5 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest">Premium Edition v2.5</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
