import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BookOpen, Calendar, Search } from 'lucide-react';
import { marketAPI } from '../services/api';
import useKeyPress from "../hooks/useKeyPress";
import ErrorBoundary from '../components/ErrorBoundary';

import TechnicalChart from '../components/TechnicalChart';
import FundamentalPanel from '../components/FundamentalPanel';
import HeatmapPanel from '../components/HeatmapPanel';
import CalendarPanel from '../components/CalendarPanel';

const Analytics = () => {
    const [activeTab, setActiveTab] = useState('technical');
    const [tickerInput, setTickerInput] = useState('AAPL');
    const [activeTicker, setActiveTicker] = useState('AAPL');

    // Global shortcut mapping
    useKeyPress('/', () => {
        const searchElement = document.getElementById('analytics-search');
        if (searchElement) searchElement.focus();
    }, { prevent: true });

    const handleSearch = (e) => {
        e.preventDefault();
        if (tickerInput.trim()) {
            setActiveTicker(tickerInput.toUpperCase());
        }
    };

    const tabs = [
        { id: 'technical', label: 'Technical Analysis', icon: Activity },
        { id: 'fundamental', label: 'Fundamentals', icon: BookOpen },
        { id: 'sectors', label: 'Market Heatmap', icon: Activity },
        { id: 'calendar', label: 'Macro Calendar', icon: Calendar },
    ];

    return (
        <div className="min-h-screen bg-fin-bg px-4 py-8 max-w-7xl mx-auto pt-24 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-fin-text flex items-center gap-3">
                        <Activity className="w-8 h-8 text-fin-accent" />
                        Market Analytics Hub
                    </h1>
                    <p className="text-fin-muted mt-2">Deep-dive technical patterns and fundamental ratios</p>
                </div>

                {/* Ticker Search restricted to Technicals/Fundamentals */}
                {(activeTab === 'technical' || activeTab === 'fundamental') && (
                    <form onSubmit={handleSearch} className="relative w-full md:w-64 z-10">
                        <input
                            id="analytics-search"
                            type="text"
                            value={tickerInput}
                            onChange={(e) => setTickerInput(e.target.value)}
                            placeholder="Lookup Ticker..."
                            className="w-full bg-fin-card border border-fin-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-fin-accent/50 focus:ring-1 focus:ring-fin-accent/30 uppercase placeholder:normal-case font-bold text-fin-text transition-colors shadow-sm"
                        />
                        <Search className="w-4 h-4 text-fin-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <button type="submit" className="hidden" />
                    </form>
                )}
            </div>

            {/* Tab Navigation Menu */}
            <div className="flex overflow-x-auto border-b border-fin-border mb-6 no-scrollbar relative z-10">
                <div className="flex space-x-6 pb-px">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative whitespace-nowrap px-1 outline-none
                                ${activeTab === tab.id
                                    ? 'text-fin-accent'
                                    : 'text-fin-muted hover:text-fin-text hover:bg-fin-card/30 rounded-t-lg'
                                }
                            `}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabAnalytics"
                                    className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-fin-accent rounded-t-full shadow-[0_-2px_8px_rgba(59,130,246,0.5)]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 glass-panel p-1 min-h-[600px] border-none bg-transparent shadow-none">
                <AnimatePresence mode="wait">
                    {activeTab === 'technical' && (
                        <motion.div
                            key="technical"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <ErrorBoundary label="Technical Indicators" compact>
                                <div className="h-full">
                                    <TechnicalChart ticker={activeTicker} />
                                </div>
                            </ErrorBoundary>
                        </motion.div>
                    )}

                    {activeTab === 'fundamental' && (
                        <motion.div
                            key="fundamental"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <ErrorBoundary label="Fundamental Data" compact>
                                <div className="h-full">
                                    <FundamentalPanel ticker={activeTicker} />
                                </div>
                            </ErrorBoundary>
                        </motion.div>
                    )}

                    {activeTab === 'sectors' && (
                        <motion.div
                            key="sectors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <ErrorBoundary label="Sector Heatmap" compact>
                                <div className="h-full">
                                    <HeatmapPanel />
                                </div>
                            </ErrorBoundary>
                        </motion.div>
                    )}

                    {activeTab === 'calendar' && (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <ErrorBoundary label="Macro Events Calendar" compact>
                                <div className="h-full">
                                    <CalendarPanel />
                                </div>
                            </ErrorBoundary>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Analytics;
