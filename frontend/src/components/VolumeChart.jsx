import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    TimeScale,
    BarElement,
    Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    BarElement,
    Tooltip
);

const VolumeChart = ({ data }) => {
    if (!data || !data.chart_dates) return null;

    const volumeData = data.chart_dates.map((date, index) => ({
        x: new Date(date).getTime(),
        y: data.chart_volume[index] || 0
    }));

    const backgroundColors = data.chart_dates.map((_, index) => {
        return data.chart_close[index] >= data.chart_open[index] ? '#22c55e' : '#ef4444';
    });

    const chartData = {
        datasets: [{
            label: 'Volume',
            data: volumeData,
            backgroundColor: backgroundColors,
            barThickness: 'flex',
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let val = context.raw.y;
                        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
                        if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
                        return val;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                grid: { display: false },
                ticks: { display: false }
            },
            y: {
                grid: { color: '#2a3441' },
                ticks: {
                    color: '#64748b',
                    maxTicksLimit: 4,
                    callback: function (value) {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
                        return value;
                    }
                }
            }
        }
    };

    return (
        <div className="w-full h-full min-h-[100px]">
            <Bar options={options} data={chartData} />
        </div>
    );
};

export default VolumeChart;
