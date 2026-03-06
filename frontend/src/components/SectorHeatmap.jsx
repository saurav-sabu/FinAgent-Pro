import React from 'react';

const SectorHeatmap = ({ sectors }) => {
    if (!sectors || Object.keys(sectors).length === 0) return null;

    const sortedSectors = Object.entries(sectors)
        .map(([name, change]) => ({ name, change }))
        .sort((a, b) => b.change - a.change);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {sortedSectors.map(sector => {
                const isPositive = sector.change >= 0;
                const colorClass = isPositive
                    ? 'bg-fin-green/10 border-fin-green/30 text-fin-green'
                    : 'bg-fin-red/10 border-fin-red/30 text-fin-red';
                const sign = isPositive ? '+' : '';

                return (
                    <div key={sector.name} className={`px-2 py-3 rounded-lg border flex flex-col items-center justify-center text-center transition-all ${colorClass}`}>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 mb-1 max-w-full truncate px-1">{sector.name}</span>
                        <span className="font-bold text-sm tracking-wide">{sign}{sector.change.toFixed(2)}%</span>
                    </div>
                );
            })}
        </div>
    );
};

export default SectorHeatmap;
