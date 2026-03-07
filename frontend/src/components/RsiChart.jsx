import React from 'react';
import {
    Chart as ChartJS,
    registerables
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(...registerables);

// Chart.js plugin to draw arbitrary horizontal lines
const horizontalLinePlugin = {
    id: 'horizontalLine',
    afterDraw: (chart) => {
        const { ctx, chartArea: { left, right }, scales: { y } } = chart;

        // Draw 70 line
        const y70 = y.getPixelForValue(70);
        ctx.beginPath();
        ctx.moveTo(left, y70);
        ctx.lineTo(right, y70);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ef4444'; // red
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        // Draw 30 line
        const y30 = y.getPixelForValue(30);
        ctx.beginPath();
        ctx.moveTo(left, y30);
        ctx.lineTo(right, y30);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#22c55e'; // green
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
};

ChartJS.register(horizontalLinePlugin);

const RsiChart = ({ data }) => {
    if (!data || !data.chart_dates) return null;

    const rsiData = data.chart_dates.map((date, index) => ({
        x: new Date(date).getTime(),
        y: data.chart_rsi[index]
    })).filter(item => item.y !== null && item.y !== undefined);

    const chartData = {
        datasets: [{
            label: 'RSI (14)',
            data: rsiData,
            borderColor: '#8b5cf6',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1,
            fill: false
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            x: {
                type: 'time',
                grid: { display: false },
                ticks: { display: false }
            },
            y: {
                min: 0,
                max: 100,
                grid: { color: '#2a3441' },
                ticks: {
                    color: '#64748b',
                    stepSize: 30, // to force lines near 30 / 60 / 90
                }
            }
        }
    };

    return (
        <div className="w-full h-full min-h-[100px]">
            <Line options={options} data={chartData} />
        </div>
    );
};

export default RsiChart;
