import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const Alert = ({ type = 'info', title, message, onClose }) => {
    const config = {
        success: {
            icon: CheckCircle,
            bgClass: 'bg-success/10',
            borderClass: 'border-success/30',
            iconClass: 'text-success'
        },
        danger: {
            icon: AlertCircle,
            bgClass: 'bg-danger/10',
            borderClass: 'border-danger/30',
            iconClass: 'text-danger'
        },
        warning: {
            icon: AlertTriangle,
            bgClass: 'bg-warning/10',
            borderClass: 'border-warning/30',
            iconClass: 'text-warning'
        },
        info: {
            icon: Info,
            bgClass: 'bg-primary/10',
            borderClass: 'border-primary/30',
            iconClass: 'text-primary'
        }
    };

    const { icon: Icon, bgClass, borderClass, iconClass } = config[type] || config.info;

    return (
        <div className={`${bgClass} border ${borderClass} rounded-lg p-4 animate-in slide-in-from-bottom duration-300`}>
            <div className="flex gap-3">
                <Icon className={`${iconClass} flex-shrink-0`} size={24} />
                <div className="flex-1">
                    {title && <h4 className="font-bold mb-1">{title}</h4>}
                    {message && <p className="text-sm text-text-secondary">{message}</p>}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-1 hover:bg-glass rounded transition-all"
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Alert;
