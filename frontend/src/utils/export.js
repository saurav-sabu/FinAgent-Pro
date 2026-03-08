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

export const exportChartAsCSV = (data, filename = 'stock-data.csv') => {
    if (!data || !data.chart_dates) return;

    const headers = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'];
    const rows = data.chart_dates.map((date, i) => [
        date,
        data.chart_open[i],
        data.chart_high[i],
        data.chart_low[i],
        data.chart_close[i],
        data.chart_volume[i]
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

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
