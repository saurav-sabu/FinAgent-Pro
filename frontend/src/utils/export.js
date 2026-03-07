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


