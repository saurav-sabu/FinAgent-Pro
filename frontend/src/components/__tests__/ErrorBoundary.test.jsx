import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ErrorBoundary from '../ErrorBoundary';

const ThrowError = () => {
    throw new Error('Test Error');
};

describe('ErrorBoundary Component', () => {
    it('renders fallback UI when a child component crashes', () => {
        // Suppress console.error for this test as it's expected
        const originalConsoleError = console.error;
        console.error = vi.fn();

        render(
            <ErrorBoundary label="Test Component" compact>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Test Component is unavailable')).toBeInTheDocument();
        expect(screen.getByText('Isolated crash — rest of the page is fine.')).toBeInTheDocument();

        console.error = originalConsoleError;
    });

    it('renders children when no error occurs', () => {
        render(
            <ErrorBoundary>
                <div>Safe Child</div>
            </ErrorBoundary>
        );

        expect(screen.getByText('Safe Child')).toBeInTheDocument();
    });
});
