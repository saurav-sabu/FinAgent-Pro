import { useState, useEffect, useRef } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, CalendarDays, Search, Download, Image as ImageIcon, Star } from 'lucide-react';
import IndexCard from '../components/IndexCard';
import StockCard from '../components/StockCard';
import MainChart from '../components/MainChart';
import VolumeChart from '../components/VolumeChart';
import RsiChart from '../components/RsiChart';
import AiInsight from '../components/AiInsight';
import RiskGauge from '../components/RiskGauge';
import SectorHeatmap from '../components/SectorHeatmap';
import { marketAPI } from '../services/api';
import { exportChartAsPNG, exportChartAsCSV } from '../utils/export';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ticker, setTicker] = useState("AAPL");
    const [searchInput, setSearchInput] = useState("AAPL");
    const [timeFrame, setTimeFrame] = useState("6M");
    const [showExportMenu, setShowExportMenu] = useState(false);

    const [watchlist, setWatchlist] = useState([]);
    const [isWatchlistUpdating, setIsWatchlistUpdating] = useState(false);
    const { showToast } = useToast();

    const chartRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Pass optional timeFrame if your backend supports it, otherwise visual state only
                const result = await marketAPI.getDashboard(ticker, timeFrame);
                setData(result);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchWatchlist = async () => {
            try {
                const list = await marketAPI.getWatchlist();
                setWatchlist(list || []);
            } catch (e) {
                console.error("Watchlist fetch error", e);
            }
        };

        setLoading(true);
        fetchData();
        fetchWatchlist();

        // Simulate real-time updates every 15s
        const interval = setInterval(() => {
            fetchData();
            fetchWatchlist();
        }, 15000);
        return () => clearInterval(interval);
    }, [ticker, timeFrame]);

    const handleToggleWatchlist = async () => {
        if (!data?.stockDetails?.ticker || isWatchlistUpdating) return;
        setIsWatchlistUpdating(true);
        try {
            await marketAPI.toggleWatchlist(data.stockDetails.ticker);
            const newList = await marketAPI.getWatchlist();
            setWatchlist(newList || []);
            showToast(`${isWatching(data.stockDetails.ticker) ? 'Removed from' : 'Added to'} watchlist`, "success");
        } catch (e) {
            // Error is already handled by axios interceptor toast if it's an API error
            // But we can add extra context here if needed
        } finally {
            setIsWatchlistUpdating(false);
        }
    };

    const isWatching = (sym) => watchlist.some(w => w.ticker === sym);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setTicker(searchInput.toUpperCase().trim());
        }
    };

    if (loading || !data) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-fin-accent animate-spin mb-4" />
                <p className="text-fin-muted animate-pulse font-medium">Initializing Financial Engines...</p>
            </div>
        );
    }

    // Custom rendering not needed for ApexCharts native tooltips

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

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <form onSubmit={handleSearch} className="tour-search relative w-full sm:w-64">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Enter Ticker (e.g., TSLA, RELIANCE.NS)"
                            className="w-full bg-fin-bg border border-fin-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-fin-accent/50 focus:ring-1 focus:ring-fin-accent/30 uppercase placeholder:normal-case font-bold"
                        />
                        <Search className="w-4 h-4 text-fin-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <button type="submit" className="hidden" />
                    </form>

                    <div className="hidden sm:block glass-panel px-4 py-2 border-fin-border/50 shrink-0">
                        <div className="text-right flex items-center gap-4">
                            <div className="text-sm text-fin-muted font-medium">S&P 500</div>
                            <div className="text-lg font-bold text-fin-green flex items-center gap-1.5 justify-end">
                                {data.indices && data.indices.length > 0 ? data.indices[0].value : '---'} <Zap className="w-4 h-4 fill-fin-green" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Indices Grid */}
            <ErrorBoundary label="Market Indices" compact>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
                    {(Array.isArray(data.indices) ? data.indices : Object.values(data.indices || {})).map((index, i) => (
                        <IndexCard key={index.name} {...index} delay={i} />
                    ))}
                </div>
            </ErrorBoundary>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart Section */}
                <div className="lg:col-span-2 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="glass-panel p-4 lg:p-6 flex flex-col relative overflow-hidden"
                    >
                        {/* Subtle background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-fin-accent/5 rounded-full blur-[100px] pointer-events-none" />

                        <div className="flex justify-between items-start lg:items-center mb-6 relative z-10 flex-col lg:flex-row gap-4">
                            <div>
                                <h2 className="text-base lg:text-xl font-bold flex items-center gap-2">
                                    {data.stockDetails?.ticker}
                                    <span className="text-fin-muted font-normal text-sm">{data.stockDetails?.name}</span>
                                    <button
                                        onClick={handleToggleWatchlist}
                                        disabled={isWatchlistUpdating}
                                        className="ml-2 p-1.5 rounded-lg border border-fin-border/50 hover:bg-fin-card transition-all group active:scale-95"
                                        title={isWatching(data.stockDetails?.ticker) ? "Remove from Watchlist" : "Add to Watchlist"}
                                    >
                                        <Star className={`w-4 h-4 transition-all ${isWatching(data.stockDetails?.ticker) ? 'fill-fin-accent text-fin-accent' : 'text-fin-muted group-hover:text-fin-accent'}`} />
                                    </button>
                                </h2>
                                {data.stockDetails?.earnings_date && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-fin-muted bg-fin-bg/50 px-2 py-1 rounded inline-flex border border-fin-border/50">
                                        <CalendarDays className="w-3 h-3 text-fin-accent" />
                                        Next Earnings: {data.stockDetails.earnings_date}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="tour-timeframe flex gap-1 bg-fin-bg/50 p-1 rounded-lg border border-fin-border/50 self-end lg:self-auto">
                                    {['1D', '1W', '1M', '3M', '6M', 'YTD'].map(tf => (
                                        <button
                                            key={tf}
                                            onClick={() => setTimeFrame(tf)}
                                            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${tf === timeFrame ? 'bg-fin-accent/20 text-fin-accent shadow-sm' : 'text-fin-muted hover:text-fin-text hover:bg-fin-card'}`}
                                        >
                                            {tf}
                                        </button>
                                    ))}
                                </div>

                                <div className="tour-export relative">
                                    <button
                                        onClick={() => setShowExportMenu(!showExportMenu)}
                                        className="p-1.5 rounded-lg bg-fin-bg/50 border border-fin-border/50 text-fin-muted hover:text-white hover:bg-fin-card transition-colors"
                                        title="Export Data"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>

                                    <AnimatePresence>
                                        {showExportMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 top-full mt-2 w-48 bg-fin-card border border-fin-border shadow-xl rounded-lg overflow-hidden z-50 flex flex-col"
                                            >
                                                <button
                                                    onClick={() => {
                                                        exportChartAsPNG(chartRef, `${ticker}-chart.png`);
                                                        setShowExportMenu(false);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-fin-card-hover transition-colors"
                                                >
                                                    <ImageIcon className="w-4 h-4 text-fin-accent" />
                                                    Export as PNG
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        exportChartAsCSV(data.stockDetails, `${ticker}-data.csv`);
                                                        setShowExportMenu(false);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-fin-card-hover transition-colors border-t border-fin-border/30"
                                                >
                                                    <Download className="w-4 h-4 text-fin-accent" />
                                                    Export as CSV
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        <ErrorBoundary label="Stock Performance Charts" compact>
                            <div className="tour-chart w-full h-[350px] lg:h-[400px] relative z-10">
                                <MainChart data={data.stockDetails} chartRef={chartRef} />
                            </div>
                            <div className="w-full h-[120px] relative z-10 mt-4 border-t border-fin-border/30 pt-4">
                                <VolumeChart data={data.stockDetails} />
                            </div>
                            <div className="w-full h-[120px] relative z-10 mt-2 border-t border-fin-border/30 pt-4">
                                <RsiChart data={data.stockDetails} />
                            </div>
                        </ErrorBoundary>
                    </motion.div>
                </div>

                {/* Sidebar / Trending */}
                <div className="space-y-6">
                    {/* Insights Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="tour-insight"
                    >
                        <ErrorBoundary label="AI Research Insight" compact>
                            <AiInsight ticker={data.stockDetails?.ticker || "AAPL"} />
                        </ErrorBoundary>
                    </motion.div>

                    {/* Risk Gauge */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="glass-panel p-4 lg:p-5"
                    >
                        <RiskGauge
                            score={data.riskAnalysis?.score || 0}
                            level={data.riskAnalysis?.level || 'Low'}
                            reasons={data.riskAnalysis?.reasons || []}
                        />
                    </motion.div>

                    {/* My Watchlist */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        className="glass-panel p-4 lg:p-5 border-fin-accent/20"
                    >
                        <ErrorBoundary label="My Watchlist" compact>
                            <h2 className="text-base lg:text-lg font-bold mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-fin-accent fill-fin-accent" />
                                    My Watchlist
                                </div>
                            </h2>

                            {watchlist.length > 0 ? (
                                <div className="space-y-2 lg:space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                    {watchlist.map((stock, i) => (
                                        <div
                                            key={stock.ticker}
                                            onClick={() => setTicker(stock.ticker)}
                                            className="group"
                                        >
                                            <StockCard
                                                symbol={stock.ticker}
                                                name="Watchlist"
                                                price={`$${stock.price}`}
                                                change={stock.change_percent}
                                                volume="-"
                                                delay={i}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-fin-muted text-center py-6 px-4 italic border border-dashed border-fin-border/50 rounded-lg bg-fin-bg/30">
                                    <Star className="w-8 h-8 mx-auto text-fin-border mb-2" />
                                    You haven't added any stocks yet. Click the <Star className="inline w-3 h-3 mx-1" /> icon next to a ticker to watch it!
                                </div>
                            )}
                        </ErrorBoundary>
                    </motion.div>

                    {/* Sector Heatmap */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="glass-panel p-4 lg:p-5"
                    >
                        <h2 className="text-base font-bold mb-3">Sector Heatmap</h2>
                        <SectorHeatmap sectors={data.sectorPerformance} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.35 }}
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
