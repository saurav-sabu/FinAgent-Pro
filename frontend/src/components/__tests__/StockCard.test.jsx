import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StockCard from '../StockCard';

describe('StockCard Component', () => {
    const defaultProps = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: '$150.00',
        change: 2.5,
        volume: '50M',
    };

    it('renders stock information correctly', () => {
        render(<StockCard {...defaultProps} />);

        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
        expect(screen.getByText('$150.00')).toBeInTheDocument();
        expect(screen.getByText('2.5%')).toBeInTheDocument();
        expect(screen.getByText(/50M/)).toBeInTheDocument();
    });

    it('applies green color for positive change', () => {
        const { container } = render(<StockCard {...defaultProps} />);
        const changeElement = screen.getByText('2.5%');
        expect(changeElement).toHaveClass('text-fin-green');
    });

    it('applies red color for negative change', () => {
        render(<StockCard {...defaultProps} change={-1.2} />);
        const changeElement = screen.getByText('1.2%');
        expect(changeElement).toHaveClass('text-fin-red');
    });
});
