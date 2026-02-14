import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, Users, Package, Calendar, BarChart3, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const MobileNavbar = () => {
    const { isSidebarOpen, toggleSidebar } = useApp();

    return (
        <div className="lg:hidden fixed top-0 left-0 w-full z-[10000] pointer-events-none">
            {/* Header Bar Background - Only blocks events where visible */}
            <div className="absolute top-0 left-0 w-full h-16 bg-[#0F172A] border-b border-white/10 shadow-lg pointer-events-auto flex items-center justify-center">
                <span className="text-sm font-bold tracking-widest text-text-muted uppercase">Pastillero Digital</span>
            </div>

            {/* Toggle Button - High Priority Interactivity */}
            <button
                onClick={toggleSidebar}
                className={`pointer-events-auto absolute top-3 left-4 p-2.5 rounded-xl border shadow-xl transition-all duration-300 ${isSidebarOpen
                    ? 'bg-red-500/10 border-red-500/30 text-red-500'
                    : 'bg-slate-800 border-white/10 text-white hover:bg-slate-700'
                    }`}
                aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
            >
                {isSidebarOpen ? (
                    <X size={26} strokeWidth={2.5} />
                ) : (
                    <Menu size={26} strokeWidth={2.5} />
                )}
            </button>
        </div>
    );
};

export default MobileNavbar;
