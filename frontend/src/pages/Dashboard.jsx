import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Loader2, Zap } from 'lucide-react';
import IndexCard from '../components/IndexCard';
import StockCard from '../components/StockCard';
import { marketAPI } from '../services/api';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await marketAPI.getDashboard();
                setData(result);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Simulate real-time updates every 15s
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !data) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-fin-accent animate-spin mb-4" />
                <p className="text-fin-muted animate-pulse font-medium">Initializing Financial Engines...</p>
            </div>
        );
    }

    // Custom Chart Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-panel !p-3 !bg-fin-bg/95 border-fin-border min-w-[120px] shadow-2xl z-50">
                    <p className="text-fin-muted text-xs mb-1 font-medium">{label}</p>
                    <p className="text-fin-text font-bold text-lg">${payload[0].value.toFixed(2)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-fade-in pb-12 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-1 lg:mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-fin-muted">Market Overview</h1>
                    <p className="text-fin-muted flex items-center gap-2 text-sm">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fin-green opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fin-green"></span>
                        </span>
                        Live market data active
                    </p>
                </div>
                <div className="hidden sm:block glass-panel px-4 py-2 border-fin-border/50">
                    <div className="text-right flex items-center gap-4">
                        <div className="text-sm text-fin-muted font-medium">S&P 500</div>
                        <div className="text-lg font-bold text-fin-green flex items-center gap-1.5 justify-end">
                            {data.indices[0].value} <Zap className="w-4 h-4 fill-fin-green" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Indices Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
                {data.indices.map((index, i) => (
                    <IndexCard key={index.name} {...index} delay={i} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart Section */}
                <div className="lg:col-span-2 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="glass-panel p-4 lg:p-6 h-[350px] lg:h-[420px] flex flex-col relative overflow-hidden"
                    >
                        {/* Subtle background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-fin-accent/5 rounded-full blur-[100px] pointer-events-none" />

                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h2 className="text-base lg:text-lg font-bold">Market Performance <span className="text-fin-muted font-normal text-sm ml-2">(Intraday)</span></h2>
                            <div className="flex gap-1 bg-fin-bg/50 p-1 rounded-lg border border-fin-border/50">
                                {['1D', '1W', '1M', 'YTD'].map(tf => (
                                    <button key={tf} className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${tf === '1D' ? 'bg-fin-accent/20 text-fin-accent shadow-sm' : 'text-fin-muted hover:text-fin-text hover:bg-fin-card'}`}>
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 w-full min-h-0 relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3441" vertical={false} opacity={0.5} />
                                    <XAxis
                                        dataKey="time"
                                        stroke="#64748b"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        minTickGap={30}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={['dataMin - 50', 'dataMax + 50']}
                                        tickFormatter={(val) => `$${val}`}
                                        dx={-10}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2a3441', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                        animationDuration={2000}
                                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#0b0f19', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar / Trending */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="glass-panel p-4 lg:p-5"
                    >
                        <h2 className="text-base lg:text-lg font-bold mb-4 flex items-center justify-between">
                            Top Gainers
                            <span className="text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold rounded bg-fin-green/10 text-fin-green border border-fin-green/20">Live</span>
                        </h2>
                        <div className="space-y-2 lg:space-y-3">
                            {data.topGainers.map((stock, i) => (
                                <StockCard key={stock.symbol} {...stock} delay={i} />
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="glass-panel p-4 lg:p-5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-fin-red/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <h2 className="text-base lg:text-lg font-bold mb-4 flex items-center justify-between">
                            Top Losers
                        </h2>
                        <div className="space-y-2 lg:space-y-3 relative z-10">
                            {data.topLosers.length > 0 ? (
                                data.topLosers.map((stock, i) => (
                                    <StockCard key={stock.symbol} {...stock} delay={i + 3} />
                                ))
                            ) : (
                                <div className="text-sm text-fin-muted text-center py-4 italic border border-dashed border-fin-border/50 rounded-lg bg-fin-bg/30">
                                    No trending stocks in the red right now. 🚀
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
