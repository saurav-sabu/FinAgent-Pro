import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { marketAPI } from '../services/api';
import { Activity, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const TechnicalChart = ({ ticker }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isDark } = useTheme();

    // Color Palette Theme
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';

    useEffect(() => {
        const fetchTechnicals = async () => {
            if (!ticker) return;
            try {
                setLoading(true);
                const result = await marketAPI.getTechnicals(ticker, '6mo');
                setData(result);
                setError(null);
            } catch (err) {
                console.error(err);
                setError(`Failed to retrieve technical indicators for ${ticker}`);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTechnicals();
    }, [ticker]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-[600px]">
                <Loader2 className="w-8 h-8 text-fin-accent animate-spin mb-4" />
                <p className="text-fin-muted">Calculating moving averages and oscillators for {ticker}...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-[600px] text-fin-red">
                <AlertCircle className="w-8 h-8 mb-4" />
                <p>{error || "No data available."}</p>
            </div>
        );
    }

    // --- CHART 1: Price & Bollinger Bands ---
    const priceChartData = {
        labels: data.dates,
        datasets: [
            {
                type: 'line',
                label: 'Upper Band',
                data: data.bollinger_bands.upper_band,
                borderColor: 'rgba(56, 189, 248, 0.3)', // light blue
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                tension: 0.1
            },
            {
                type: 'line',
                label: 'Lower Band',
                data: data.bollinger_bands.lower_band,
                borderColor: 'rgba(56, 189, 248, 0.3)',
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: '-1',
                backgroundColor: 'rgba(56, 189, 248, 0.05)',
                tension: 0.1
            },
            {
                type: 'line',
                label: 'SMA (20)',
                data: data.bollinger_bands.middle_band,
                borderColor: 'rgba(251, 191, 36, 0.6)', // amber
                borderWidth: 1,
                pointRadius: 0,
                fill: false,
                tension: 0.1
            },
            {
                type: 'line',
                label: 'Close Price',
                data: data.price,
                borderColor: isDark ? '#ffffff' : '#000000',
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.1
            }
        ]
    };

    const priceOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: { display: true, position: 'top', labels: { color: textColor, usePointStyle: true, boxWidth: 6 } },
            tooltip: { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', titleColor: isDark ? '#fff' : '#000', bodyColor: isDark ? '#cbd5e1' : '#334155', borderColor: 'rgba(56, 189, 248, 0.2)', borderWidth: 1 }
        },
        scales: {
            x: { grid: { display: false, color: gridColor }, ticks: { color: textColor, maxTicksLimit: 8 } },
            y: { position: 'right', grid: { color: gridColor }, ticks: { color: textColor } }
        }
    };

    // --- CHART 2: MACD ---
    const macdChartData = {
        labels: data.dates,
        datasets: [
            {
                type: 'bar',
                label: 'Histogram',
                data: data.macd.histogram,
                backgroundColor: data.macd.histogram.map(val => val >= 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'),
                borderWidth: 0,
            },
            {
                type: 'line',
                label: 'MACD (12,26)',
                data: data.macd.macd_line,
                borderColor: '#3b82f6', // blue
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
                tension: 0.1
            },
            {
                type: 'line',
                label: 'Signal (9)',
                data: data.macd.signal_line,
                borderColor: '#f59e0b', // amber
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
                tension: 0.1
            }
        ]
    };

    const macdOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: true, position: 'top', labels: { color: textColor, usePointStyle: true, boxWidth: 6 } },
            tooltip: { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', titleColor: isDark ? '#fff' : '#000', bodyColor: isDark ? '#cbd5e1' : '#334155' }
        },
        scales: {
            x: { display: false },
            y: { position: 'right', grid: { color: gridColor }, ticks: { color: textColor } }
        }
    };

    // --- CHART 3: Stochastic ---
    const stochChartData = {
        labels: data.dates,
        datasets: [
            {
                type: 'line',
                label: '%K (14)',
                data: data.stochastic.k_line,
                borderColor: '#38bdf8', // light blue
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
                tension: 0.1
            },
            {
                type: 'line',
                label: '%D (3)',
                data: data.stochastic.d_line,
                borderColor: '#ef4444', // red
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
                tension: 0.1
            }
        ]
    };

    const stochOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: true, position: 'top', labels: { color: textColor, usePointStyle: true, boxWidth: 6 } },
            tooltip: { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', titleColor: isDark ? '#fff' : '#000', bodyColor: isDark ? '#cbd5e1' : '#334155' }
        },
        scales: {
            x: { display: false },
            y: {
                position: 'right',
                min: 0,
                max: 100,
                grid: { color: gridColor },
                ticks: { color: textColor, stepSize: 20 }
            }
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full h-full">

            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-fin-accent" />
                    {data.ticker} Technical Studies <span className="text-fin-muted text-sm font-normal ml-2">(6 Month Period)</span>
                </h3>
            </div>

            {/* Main Price & Bollinger Chart */}
            <div className="relative h-[350px] w-full bg-fin-bg rounded-xl border border-fin-border/50 p-4">
                <Chart type='line' data={priceChartData} options={priceOptions} />
            </div>

            <div className="flex flex-col md:flex-row gap-6 h-[250px] w-full">
                {/* MACD Chart */}
                <div className="relative flex-1 bg-fin-bg rounded-xl border border-fin-border/50 p-4">
                    <Chart type='bar' data={macdChartData} options={macdOptions} />
                </div>

                {/* Stochastic Chart */}
                <div className="relative flex-1 bg-fin-bg rounded-xl border border-fin-border/50 p-4">
                    {/* Draw Overbought/Oversold hint lines manually via CSS over the chart to look nice */}
                    <div className="absolute top-[28%] left-0 right-0 h-px border-t border-dashed border-fin-red/40 pointer-events-none z-10" />
                    <div className="absolute top-[78%] left-0 right-0 h-px border-t border-dashed border-fin-green/40 pointer-events-none z-10" />
                    <Chart type='line' data={stochChartData} options={stochOptions} />
                </div>
            </div>

        </div>
    );
};

export default TechnicalChart;
