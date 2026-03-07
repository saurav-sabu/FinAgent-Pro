import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MainChart from '../MainChart';

// Mock the useTheme hook
vi.mock('../../context/ThemeContext', () => ({
    useTheme: () => ({ isDark: true }),
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
    Chart: vi.fn(() => <div data-testid="mock-chart">Mock Chart</div>),
}));

// Mock chartjs-chart-financial
vi.mock('chartjs-chart-financial', () => ({
    CandlestickController: {},
    CandlestickElement: {},
}));

describe('MainChart Component', () => {
    const mockData = {
        chart_dates: ['2023-01-01', '2023-01-02'],
        chart_open: [150, 152],
        chart_high: [155, 157],
        chart_low: [148, 151],
        chart_close: [153, 156],
        chart_ma50: [145, 146],
        chart_ma200: [140, 141],
    };

    it('renders nothing when data is missing', () => {
        const { container } = render(<MainChart data={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the chart container when data is provided', () => {
        render(<MainChart data={mockData} />);
        expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    });
});
