import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Centering Wrapper */}
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Modal Content */}
                <div className={`relative w-full ${sizeClasses[size]} max-h-[90vh] bg-[#0F172A] border border-glass-border rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col`}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-glass-border shrink-0">
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-all text-text-muted hover:text-white"
                            aria-label="Cerrar"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Body - scrollable */}
                    <div className="overflow-y-auto p-4 md:p-5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
