import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    TimeScale,
    Tooltip,
    Legend,
    LineController,
    LineElement,
    PointElement,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    Tooltip,
    Legend,
    LineController,
    LineElement,
    PointElement,
    CandlestickController,
    CandlestickElement
);

const MainChart = ({ data }) => {
    const { isDark } = useTheme();

    if (!data || !data.chart_dates) return null;

    const candleSeries = data.chart_dates.map((date, index) => ({
        x: new Date(date).getTime(),
        o: data.chart_open[index],
        h: data.chart_high[index],
        l: data.chart_low[index],
        c: data.chart_close[index]
    }));

    const ma50Series = data.chart_dates.map((date, index) => ({
        x: new Date(date).getTime(),
        y: data.chart_ma50[index]
    })).filter(item => item.y !== null && item.y !== undefined);

    const ma200Series = data.chart_dates.map((date, index) => ({
        x: new Date(date).getTime(),
        y: data.chart_ma200[index]
    })).filter(item => item.y !== null && item.y !== undefined);

    const chartData = {
        datasets: [
            {
                label: 'Price',
                type: 'candlestick',
                data: candleSeries,
                color: {
                    up: '#22c55e',
                    down: '#ef4444',
                    unchanged: '#64748b',
                },
                borderColor: {
                    up: '#22c55e',
                    down: '#ef4444',
                    unchanged: '#64748b',
                }
            },
            {
                label: 'MA 50',
                type: 'line',
                data: ma50Series,
                borderColor: '#3b82f6',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1
            },
            {
                label: 'MA 200',
                type: 'line',
                data: ma200Series,
                borderColor: '#f59e0b',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: { color: isDark ? '#cbd5e1' : '#64748b' }
            },
            tooltip: {
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: isDark ? '#f1f5f9' : '#0f172a',
                bodyColor: isDark ? '#cbd5e1' : '#475569',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label === 'Price') {
                            const point = context.raw;
                            return [
                                `O: $${point.o.toFixed(2)}`,
                                `H: $${point.h.toFixed(2)}`,
                                `L: $${point.l.toFixed(2)}`,
                                `C: $${point.c.toFixed(2)}`
                            ];
                        }
                        if (context.parsed.y !== null) {
                            label += ': $' + context.parsed.y.toFixed(2);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    tooltipFormat: 'MMM d, yyyy',
                },
                grid: {
                    color: isDark ? '#2a3441' : '#e2e8f0',
                },
                ticks: {
                    color: isDark ? '#64748b' : '#94a3b8',
                    maxTicksLimit: 10
                }
            },
            y: {
                grid: {
                    color: isDark ? '#2a3441' : '#e2e8f0',
                },
                ticks: {
                    color: isDark ? '#64748b' : '#94a3b8',
                    callback: function (value) {
                        return '$' + value.toFixed(2);
                    }
                }
            }
        }
    };

    return (
        <div className="w-full h-full min-h-[300px]">
            <Chart type="candlestick" options={options} data={chartData} />
        </div>
    );
};

export default MainChart;
