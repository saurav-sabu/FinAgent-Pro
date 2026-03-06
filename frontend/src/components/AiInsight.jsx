import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { marketAPI } from '../services/api';

const AiInsight = ({ ticker }) => {
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchInsight = async () => {
            setLoading(true);
            try {
                const result = await marketAPI.getInsight(ticker);
                if (isMounted) setInsight(result);
            } catch (error) {
                console.error("Failed to load insight");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (ticker) fetchInsight();

        return () => { isMounted = false; };
    }, [ticker]);

    if (loading || !insight) {
        return (
            <div className="p-4 rounded-xl relative overflow-hidden bg-gradient-to-br from-fin-bg/80 to-fin-bg/40 border border-[#8b5cf6]/30 animate-pulse h-48 flex flex-col items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#8b5cf6] animate-spin opacity-50 mb-3" />
                <span className="text-xs text-fin-muted font-bold tracking-widest uppercase">Analyzing {ticker}</span>
            </div>
        );
    }

    const isBull = insight.sentiment.toLowerCase() === 'bullish';
    const isBear = insight.sentiment.toLowerCase() === 'bearish';

    const colorClass = isBull ? 'text-fin-green' : isBear ? 'text-fin-red' : 'text-fin-accent';
    const bgGlow = isBull ? 'from-fin-green/10' : isBear ? 'from-fin-red/10' : 'from-fin-accent/10';
    const borderColor = isBull ? 'border-fin-green/30' : isBear ? 'border-fin-red/30' : 'border-fin-accent/30';

    return (
        <div className={`p-5 rounded-xl relative overflow-hidden bg-gradient-to-br ${bgGlow} to-transparent border ${borderColor}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${colorClass}`} />
                    <h3 className="font-bold text-sm tracking-wide text-white">AI INSIGHT: {ticker}</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider bg-fin-bg/80 ${colorClass}`}>
                    {insight.sentiment}
                </span>
            </div>

            <ul className="space-y-2 mb-4">
                {insight.summary_bullets.map((point, i) => (
                    <li key={i} className="text-sm text-fin-muted leading-snug flex gap-2">
                        <span className="opacity-50 mt-0.5">•</span>
                        <span>{point}</span>
                    </li>
                ))}
            </ul>

            <div className="pt-3 border-t border-fin-border/50 mt-auto flex justify-between items-center bg-fin-bg/40 -mx-5 -mb-5 px-5 py-3">
                <span className="text-xs text-fin-muted font-medium uppercase tracking-wider">Recommendation</span>
                <span className={`font-bold text-sm uppercase tracking-wider ${colorClass}`}>{insight.recommendation}</span>
            </div>
        </div>
    );
};

export default AiInsight;
