import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-fin-green" />,
        error: <AlertCircle className="w-5 h-5 text-fin-red" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        info: <Info className="w-5 h-5 text-fin-accent" />,
    };

    const bgColors = {
        success: 'bg-fin-green/10 border-fin-green/20',
        error: 'bg-fin-red/10 border-fin-red/20',
        warning: 'bg-amber-500/10 border-amber-500/20',
        info: 'bg-fin-accent/10 border-fin-accent/20',
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`pointer-events-auto glass-panel p-4 flex items-start gap-3 shadow-2xl border ${bgColors[toast.type] || bgColors.info}`}
                    >
                        <div className="shrink-0 mt-0.5">
                            {icons[toast.type] || icons.info}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-fin-text leading-tight">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="shrink-0 text-fin-muted hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
