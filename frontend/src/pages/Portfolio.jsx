import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    PieChart as PieChartIcon,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Sparkles,
    Brain,
    X,
    Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Chart } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    registerables
} from 'chart.js';
import { marketAPI } from '../services/api';
import TransactionModal from '../components/TransactionModal';

ChartJS.register(...registerables);

const Portfolio = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [review, setReview] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [showReview, setShowReview] = useState(false);

    const fetchPortfolio = async () => {
        try {
            const summary = await marketAPI.getPortfolioSummary();
            console.log("Portfolio summary fetched successfully:", summary);
            setData(summary);
        } catch (error) {
            console.error("Failed to fetch portfolio:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const handleReview = async () => {
        setReviewLoading(true);
        setShowReview(true);
        try {
            const res = await marketAPI.getPortfolioReview();
            setReview(res.review);
        } catch (error) {
            console.error("AI Review failed:", error);
            setReview("Failed to generate AI review. Technical analysts are investigating.");
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-fin-accent animate-spin mb-4" />
                <p className="text-fin-muted">Calculating your wealth...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <div className="p-4 bg-fin-red/10 border border-fin-red/20 rounded-xl mb-4">
                    <p className="text-fin-red text-sm font-bold">Failed to load portfolio data.</p>
                </div>
                <button onClick={fetchPortfolio} className="btn-primary px-6 py-2">Try Again</button>
            </div>
        );
    }

    const isPositive = data.total_gain >= 0;

    // Prepare chart data only if holdings exist
    const hasHoldings = data.holdings && data.holdings.length > 0;
    const chartData = hasHoldings ? {
        labels: data.holdings.map(h => h.ticker || 'Unknown'),
        datasets: [{
            data: data.holdings.map(h => h.market_value || 0),
            backgroundColor: [
                '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'
            ],
            borderWidth: 0,
            hoverOffset: 4
        }]
    } : null;

    return (
        <div className="space-y-6 lg:space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-fin-muted">
                        My Portfolio
                    </h1>
                    <p className="text-fin-muted text-sm flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        Live wealth tracking active
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        disabled={loading || reviewLoading}
                        onClick={handleReview}
                        className="btn-secondary flex items-center gap-2 px-6 py-2.5 bg-fin-accent/10 border-fin-accent/20 text-fin-accent hover:bg-fin-accent/20"
                    >
                        {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Review with AI
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary flex items-center gap-2 px-6 py-2.5"
                    >
                        <Plus className="w-4 h-4" />
                        Add Transaction
                    </button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6"
                >
                    <p className="text-sm text-fin-muted font-medium mb-1">Total Balance</p>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        ${(data.total_value || 0).toLocaleString()}
                    </h2>
                    <div className={`flex items-center gap-1.5 text-sm font-bold ${isPositive ? 'text-fin-green' : 'text-fin-red'}`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {isPositive ? '+' : ''}{(data.total_gain || 0).toLocaleString()} ({(data.total_gain_percent || 0).toFixed(2)}%)
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-panel p-6 md:col-span-2 flex flex-col md:flex-row items-center gap-8"
                >
                    <div className="w-40 h-40 shrink-0 flex items-center justify-center">
                        {hasHoldings && chartData ? (
                            <Chart
                                type="doughnut"
                                data={chartData}
                                options={{
                                    cutout: '70%',
                                    plugins: { legend: { display: false } }
                                }}
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full border-4 border-fin-border/30 border-dashed flex items-center justify-center">
                                <span className="text-[10px] text-fin-muted font-bold">No Data</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-3 w-full">
                        <h3 className="text-sm font-bold text-fin-muted flex items-center gap-2 mb-4">
                            <PieChartIcon className="w-4 h-4" />
                            Asset Allocation
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {hasHoldings ? data.holdings.slice(0, 6).map((h, i) => (
                                <div key={h.ticker || i} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'][i % 7] }} />
                                    <span className="text-xs font-bold text-white uppercase">{h.ticker || 'N/A'}</span>
                                    <span className="text-xs text-fin-muted ml-auto">
                                        {data.total_value > 0 ? (((h.market_value || 0) / data.total_value) * 100).toFixed(0) : 0}%
                                    </span>
                                </div>
                            )) : (
                                <p className="text-xs text-fin-muted col-span-3">Your allocation will appear here once you add assets.</p>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Holdings Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel overflow-hidden"
            >
                <div className="p-6 border-b border-fin-border/50">
                    <h2 className="font-bold flex items-center gap-2">
                        Your Holdings
                        <span className="text-xs bg-fin-accent/10 text-fin-accent px-2 py-0.5 rounded border border-fin-accent/20">
                            {data.holdings.length} Assets
                        </span>
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] uppercase tracking-wider text-fin-muted font-bold bg-fin-bg/30">
                            <tr>
                                <th className="px-6 py-4">Ticker</th>
                                <th className="px-6 py-4">Shares</th>
                                <th className="px-6 py-4">Avg Cost</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Market Value</th>
                                <th className="px-6 py-4 text-right">P&L</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-fin-border/30">
                            {data.holdings.map((h) => {
                                const holdPositive = h.gain >= 0;
                                return (
                                    <tr key={h.ticker} className="hover:bg-fin-card transition-colors">
                                        <td className="px-6 py-5 font-bold text-white uppercase">{h.ticker}</td>
                                        <td className="px-6 py-5 text-sm">{h.shares}</td>
                                        <td className="px-6 py-5 text-sm text-fin-muted">${(h.average_cost || 0).toLocaleString()}</td>
                                        <td className="px-6 py-5 text-sm font-medium">${(h.current_price || 0).toLocaleString()}</td>
                                        <td className="px-6 py-5 text-sm font-bold">${(h.market_value || 0).toLocaleString()}</td>
                                        <td className="px-6 py-5 text-right">
                                            <div className={`text-sm font-bold flex items-center justify-end gap-1 ${holdPositive ? 'text-fin-green' : 'text-fin-red'}`}>
                                                {holdPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                                ${Math.abs(h.gain || 0).toLocaleString()}
                                            </div>
                                            <div className={`text-[10px] font-bold ${holdPositive ? 'text-fin-green/70' : 'text-fin-red/70'}`}>
                                                {holdPositive ? '+' : '-'}{Math.abs(h.gain_percent || 0).toFixed(2)}%
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* AI Review Sidebar */}
            <AnimatePresence>
                {showReview && (
                    <div key="review-container">
                        <motion.div
                            key="review-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReview(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                        />
                        <motion.div
                            key="review-panel"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-fin-bg border-l border-fin-border z-[120] shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-fin-border bg-fin-card flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-fin-accent/10 rounded-lg">
                                        <Brain className="w-5 h-5 text-fin-accent" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">AI Portfolio Auditor</h2>
                                        <p className="text-xs text-fin-muted">Powered by Claude Analytic Engine</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowReview(false)}
                                    className="p-2 hover:bg-fin-bg rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5 text-fin-muted" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {reviewLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-fin-accent/20 border-t-fin-accent rounded-full animate-spin" />
                                            <Sparkles className="w-6 h-6 text-fin-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">Analyzing Markets...</h3>
                                            <p className="text-fin-muted text-sm max-w-[250px]">Claude is cross-referencing your holdings with macro trends.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <div className="p-4 bg-fin-accent/5 border border-fin-accent/10 rounded-xl mb-6 flex gap-3">
                                            <Info className="w-5 h-5 text-fin-accent shrink-0" />
                                            <p className="text-[11px] leading-relaxed text-fin-muted italic">
                                                Note: This analysis is AI-generated for informational purposes and does not constitute formal financial advice.
                                            </p>
                                        </div>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-white mt-8 mb-4 border-b border-fin-border pb-2" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-fin-accent mt-6 mb-3" {...props} />,
                                                p: ({ node, ...props }) => <p className="text-fin-muted leading-relaxed mb-4" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-4 text-fin-muted" {...props} />,
                                            }}
                                        >
                                            {review || ""}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-fin-border bg-fin-card">
                                <button
                                    onClick={() => setShowReview(false)}
                                    className="w-full py-3 bg-fin-bg hover:bg-fin-border/30 border border-fin-border rounded-xl text-sm font-bold text-white transition-all shadow-lg"
                                >
                                    Dismiss Analysis
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modals */}
            {showModal && (
                <TransactionModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchPortfolio();
                    }}
                />
            )}
        </div>
    );
};

export default Portfolio;
