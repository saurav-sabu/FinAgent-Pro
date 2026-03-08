import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import IndexCard from '../IndexCard';
import { ThemeProvider } from '../../context/ThemeContext';

const renderWithTheme = (ui) => {
    return render(
        <ThemeProvider>
            {ui}
        </ThemeProvider>
    );
};

describe('IndexCard Component', () => {
    it('renders index name and values correctly', () => {
        renderWithTheme(
            <IndexCard
                name="S&P 500"
                value="5,123.45"
                change={1.25}
                delay={0}
            />
        );

        expect(screen.getByText('S&P 500')).toBeInTheDocument();
        expect(screen.getByText(/5,123.45/)).toBeInTheDocument();
        expect(screen.getByText(/1.25/)).toBeInTheDocument();
    });

    it('applies correct color for negative change', () => {
        renderWithTheme(
            <IndexCard
                name="NASDAQ"
                value="16,000"
                change={-0.5}
                delay={0}
            />
        );

        expect(screen.getByText(/NASDAQ/)).toBeInTheDocument();
        expect(screen.getByText(/16,000/)).toBeInTheDocument();

        // The "-0.5" and "%" might be in separate nodes
        expect(screen.getByText(/-0.5/)).toBeInTheDocument();

        // Assuming the component uses text-fin-red for negative
        const changeText = screen.getByText(/-0.5/);
        expect(changeText.className).toContain('text-fin-red');
    });
});
