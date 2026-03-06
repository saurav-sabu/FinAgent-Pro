import React from 'react';

const RiskGauge = ({ score, level, reasons }) => {
    const percentage = (score / 10) * 100;

    let color = 'bg-fin-green text-fin-green';
    if (level.toLowerCase() === 'high') {
        color = 'bg-fin-red text-fin-red';
    } else if (level.toLowerCase() === 'moderate') {
        color = 'bg-fin-accent text-fin-accent';
    }

    return (
        <div className="flex flex-col mt-2">
            <div className="flex justify-between items-end mb-2">
                <span className={`text-2xl font-bold ${color.split(' ')[1]}`}>{score}/10</span>
                <span className="text-sm uppercase font-bold tracking-wider text-fin-muted">{level} Risk</span>
            </div>
            {/* Progress Bar */}
            <div className="h-3 w-full bg-fin-bg/80 rounded-full overflow-hidden border border-fin-border/50">
                <div
                    className={`h-full ${color.split(' ')[0]} transition-all duration-1000 rounded-full`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {/* Reasons */}
            <div className="mt-4 space-y-1">
                {reasons && reasons.map((reason, i) => (
                    <div key={i} className="text-xs text-fin-muted flex gap-2 items-start">
                        <span className="text-fin-red mt-0.5">•</span>
                        <span>{reason}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RiskGauge;
