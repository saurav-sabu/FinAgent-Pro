export const exportChartAsPNG = (chartRef, filename = 'chart-export.png') => {
    if (!chartRef.current) return;

    // Chart.js provides a native toBase64Image generator
    const url = chartRef.current.toBase64Image();
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportDataAsCSV = (data, filename = 'stock-data.csv') => {
    if (!data || !data.chart_dates) return;

    // Build standard CSV headers
    let csvContent = "Date,Open,High,Low,Close,MA50,MA200\n";

    // Iterate through the parallel arrays from backend payload
    for (let i = 0; i < data.chart_dates.length; i++) {
        const date = new Date(data.chart_dates[i]).toISOString().split('T')[0];
        const open = data.chart_open[i] ? data.chart_open[i].toFixed(2) : '';
        const high = data.chart_high[i] ? data.chart_high[i].toFixed(2) : '';
        const low = data.chart_low[i] ? data.chart_low[i].toFixed(2) : '';
        const close = data.chart_close[i] ? data.chart_close[i].toFixed(2) : '';
        const ma50 = data.chart_ma50[i] ? data.chart_ma50[i].toFixed(2) : '';
        const ma200 = data.chart_ma200[i] ? data.chart_ma200[i].toFixed(2) : '';

        csvContent += `${date},${open},${high},${low},${close},${ma50},${ma200}\n`;
    }

    // Trigger programmatic download via Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
