import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, ShoppingCart, Loader2 } from 'lucide-react';
import { marketAPI } from '../services/api';

const TransactionModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        ticker: '',
        type: 'BUY',
        shares: '',
        price: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await marketAPI.addTransaction({
                ticker: formData.ticker.toUpperCase().trim(),
                type: formData.type,
                shares: parseFloat(formData.shares),
                price: parseFloat(formData.price)
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to record transaction. Check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-fin-card border border-fin-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-fin-border/50 flex items-center justify-between bg-gradient-to-r from-fin-accent/10 to-transparent">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-fin-accent" />
                        New Transaction
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-fin-bg rounded-lg transition-colors">
                        <X className="w-5 h-5 text-fin-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-fin-red/10 border border-fin-red/20 rounded-lg flex items-center gap-2 text-fin-red text-xs font-bold">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 p-1 bg-fin-bg rounded-xl border border-fin-border/50">
                        {['BUY', 'SELL'].map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setFormData({ ...formData, type: t })}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === t
                                    ? t === 'BUY' ? 'bg-fin-green text-white shadow-lg' : 'bg-fin-red text-white shadow-lg'
                                    : 'text-fin-muted hover:text-white'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-fin-muted ml-1 mb-1.5 block">Ticker</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. AAPL"
                                value={formData.ticker}
                                onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                                className="w-full bg-fin-bg border border-fin-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fin-accent/50 focus:ring-1 focus:ring-fin-accent/30 uppercase font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-fin-muted ml-1 mb-1.5 block">Shares</label>
                                <input
                                    required
                                    type="number"
                                    step="any"
                                    placeholder="0.00"
                                    value={formData.shares}
                                    onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                                    className="w-full bg-fin-bg border border-fin-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fin-accent/50 focus:ring-1 focus:ring-fin-accent/30 font-bold"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-fin-muted ml-1 mb-1.5 block">Price ($)</label>
                                <input
                                    required
                                    type="number"
                                    step="any"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full bg-fin-bg border border-fin-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fin-accent/50 focus:ring-1 focus:ring-fin-accent/30 font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-fin-border rounded-xl text-sm font-bold text-fin-muted hover:text-white hover:bg-fin-bg transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            className={`flex-1 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all ${formData.type === 'BUY' ? 'bg-fin-green hover:bg-fin-green/90' : 'bg-fin-red hover:bg-fin-red/90'
                                }`}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Log {formData.type.toLowerCase()}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default TransactionModal;
