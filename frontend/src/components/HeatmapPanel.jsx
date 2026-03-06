import { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';
import SectorHeatmap from './SectorHeatmap';
import { PieChart, Loader2, AlertCircle, Globe } from 'lucide-react';

const HeatmapPanel = () => {
    const [sectors, setSectors] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [region, setRegion] = useState("US");

    const regions = ["US", "India", "Europe", "China"];

    useEffect(() => {
        const fetchSectors = async () => {
            try {
                setLoading(true);
                const data = await marketAPI.getSectors(region);
                setSectors(data || {});
                setError(null);
            } catch (err) {
                console.error(err);
                setError(`Failed to load sector performance heatmap for ${region}.`);
            } finally {
                setLoading(false);
            }
        };

        fetchSectors();
    }, [region]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-64">
                <Loader2 className="w-8 h-8 text-fin-accent animate-spin mb-4" />
                <p className="text-fin-muted">Scanning US Sector performance...</p>
            </div>
        );
    }

    if (error || Object.keys(sectors).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-64 text-fin-red">
                <AlertCircle className="w-8 h-8 mb-4" />
                <p>{error || "No sector data available."}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-fade-in w-full">
            <div className="mb-6 p-4 rounded-xl bg-fin-bg border border-fin-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-fin-text flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-fin-purple mr-1" />
                        {region} Sector Breakdown
                    </h2>
                    <p className="text-sm text-fin-muted mt-1">Relative performance of major {region === 'US' ? 'SPDR Sector ETFs' : 'Regional Indices'} over 5 Days</p>
                </div>

                <div className="flex items-center gap-2 bg-fin-card border border-fin-border/50 rounded-lg px-3 py-1.5 shadow-sm">
                    <Globe className="w-4 h-4 text-fin-accent" />
                    <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="bg-transparent text-sm font-bold text-fin-text focus:outline-none cursor-pointer"
                    >
                        {regions.map(r => (
                            <option key={r} value={r} className="bg-fin-card text-fin-text">{r} Markets</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-fin-bg rounded-xl p-6 border border-fin-border/50 shadow-sm flex-1">
                <SectorHeatmap sectors={sectors} />
            </div>
        </div>
    );
};

export default HeatmapPanel;
