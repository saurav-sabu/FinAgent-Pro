import { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';
import { BookOpen, PieChart, TrendingUp, AlertCircle, Loader2, DollarSign, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FundamentalPanel = ({ ticker }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('ratios'); // ratios, income, balance, cashflow

    useEffect(() => {
        const fetchFundamentals = async () => {
            if (!ticker) return;
            try {
                setLoading(true);
                const result = await marketAPI.getFundamentals(ticker);
                setData(result);
                setError(null);
            } catch (err) {
                console.error(err);
                setError(`Failed to retrieve fundamentals for ${ticker}`);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchFundamentals();
    }, [ticker]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-96">
                <Loader2 className="w-8 h-8 text-fin-accent animate-spin mb-4" />
                <p className="text-fin-muted">Extracting SEC filings and financial ratios for {ticker}...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-96 text-fin-red">
                <AlertCircle className="w-8 h-8 mb-4" />
                <p>{error || "No data available."}</p>
            </div>
        );
    }

    const tabs = [
        { id: 'ratios', label: 'Key Ratios', icon: PieChart },
        { id: 'income', label: 'Income Statement', icon: TrendingUp },
        { id: 'balance', label: 'Balance Sheet', icon: Briefcase },
        { id: 'cashflow', label: 'Cash Flow', icon: DollarSign },
    ];

    const { profile, ratios, income_statement, balance_sheet, cash_flow } = data;

    // Helper to format currency blocks gracefully
    const formatValue = (val) => {
        if (val === null || val === undefined) return '-';
        if (typeof val === 'number') {
            if (val > 1000000000) return `$${(val / 1000000000).toFixed(2)}B`;
            if (val > 1000000) return `$${(val / 1000000).toFixed(2)}M`;
            return val.toLocaleString();
        }
        return val;
    };

    const renderTable = (statementData) => {
        if (!statementData || statementData.length === 0) {
            return <div className="p-8 text-center text-fin-muted">No historical statements found.</div>;
        }

        // Get columns from the first object (excluding 'metric')
        const columns = Object.keys(statementData[0]).filter(k => k !== 'metric');

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-fin-border/50 text-xs uppercase tracking-wider text-fin-muted">
                            <th className="p-4 font-bold bg-fin-card sticky left-0 z-10 w-1/3 border-r border-fin-border/30">Metric</th>
                            {columns.map(col => (
                                <th key={col} className="p-4 font-bold text-right">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-fin-border/30">
                        {statementData.map((row, i) => (
                            <tr key={i} className="hover:bg-fin-card/50 transition-colors">
                                <td className="p-4 font-bold text-fin-text text-sm bg-fin-bg sticky left-0 z-10 border-r border-fin-border/30 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                    {row.metric}
                                </td>
                                {columns.map(col => (
                                    <td key={col} className="p-4 text-right font-mono text-sm text-fin-muted">
                                        {formatValue(row[col])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full animate-fade-in w-full">
            {/* Header Profile Section */}
            <div className="mb-6 p-4 rounded-xl bg-fin-bg border border-fin-border/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-fin-text">{profile.name} <span className="text-fin-muted text-lg tracking-wider ml-1">({ticker})</span></h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs font-bold px-2 py-1 bg-fin-accent/10 text-fin-accent rounded border border-fin-accent/20 uppercase">
                            {profile.sector}
                        </span>
                        <span className="text-xs font-bold px-2 py-1 bg-fin-card text-fin-muted rounded border border-fin-border uppercase">
                            {profile.industry}
                        </span>
                        {profile.country && (
                            <span className="text-xs font-bold px-2 py-1 bg-fin-card text-fin-muted rounded border border-fin-border uppercase flex items-center gap-1">
                                {profile.country}
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-sm text-fin-muted max-w-sm line-clamp-3 md:text-right border-l-2 border-fin-border pl-4 hidden md:block">
                    {profile.description}
                </div>
            </div>

            {/* Sub-Tabs */}
            <div className="flex space-x-2 border-b border-fin-border/50 mb-4 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded-t-lg
                            ${activeTab === tab.id
                                ? 'bg-fin-card border border-b-0 border-fin-border text-fin-accent shadow-[0_-2px_6px_rgba(0,0,0,0.1)]'
                                : 'text-fin-muted hover:text-fin-text hover:bg-fin-card/30 border border-transparent'
                            }
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Sub-Tab Content */}
            <div className="flex-1 bg-fin-card rounded-b-xl rounded-ar-xl border border-t-0 border-fin-border overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'ratios' && (
                        <motion.div
                            key="ratios"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        >
                            <RatioCard label="P/E Ratio" value={ratios.pe_ratio} />
                            <RatioCard label="Forward P/E" value={ratios.forward_pe} />
                            <RatioCard label="PEG Ratio" value={ratios.peg_ratio} />
                            <RatioCard label="Price / Book" value={ratios.price_to_book} />
                            <RatioCard label="Debt / Equity" value={ratios.debt_to_equity} />
                            <RatioCard label="Return on Equity" value={`${ratios.return_on_equity}%`} />
                            <RatioCard label="Profit Margin" value={`${ratios.profit_margin}%`} />
                            <RatioCard label="Dividend Yield" value={`${ratios.dividend_yield}%`} />
                            <RatioCard label="Beta" value={ratios.beta} />
                        </motion.div>
                    )}

                    {activeTab === 'income' && (
                        <motion.div key="income" className="h-full max-h-[500px] overflow-y-auto w-full custom-scrollbar">
                            {renderTable(income_statement)}
                        </motion.div>
                    )}

                    {activeTab === 'balance' && (
                        <motion.div key="balance" className="h-full max-h-[500px] overflow-y-auto w-full custom-scrollbar">
                            {renderTable(balance_sheet)}
                        </motion.div>
                    )}

                    {activeTab === 'cashflow' && (
                        <motion.div key="cashflow" className="h-full max-h-[500px] overflow-y-auto w-full custom-scrollbar">
                            {renderTable(cash_flow)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const RatioCard = ({ label, value }) => {
    // Evaluate sentiment based on standard rules roughly (just for visual flair)
    let colorClass = "text-fin-text";
    if (typeof value === 'number') {
        if (label === 'P/E Ratio' && value > 30) colorClass = "text-fin-red";
        if (label === 'P/E Ratio' && value > 0 && value < 15) colorClass = "text-fin-green";
        if (label === 'Debt / Equity' && value > 2) colorClass = "text-fin-red";
        if (label === 'Profit Margin' && value > 20) colorClass = "text-fin-green";
    }

    return (
        <div className="bg-fin-bg border border-fin-border/50 rounded-lg p-4 flex flex-col justify-center shadow-sm">
            <span className="text-xs font-bold text-fin-muted uppercase tracking-wider mb-1">{label}</span>
            <span className={`text-xl font-bold font-mono ${colorClass}`}>
                {value === 0 || value === "-" ? 'N/A' : value}
            </span>
        </div>
    );
}

export default FundamentalPanel;
