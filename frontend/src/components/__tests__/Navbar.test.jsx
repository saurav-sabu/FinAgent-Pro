import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock Lucide icons
vi.mock('lucide-react', async () => {
    const actual = await vi.importActual('lucide-react');
    return {
        ...actual,
        TrendingUp: () => <div data-testid="trending-icon" />,
        LayoutDashboard: () => <div data-testid="dashboard-icon" />,
        Brain: () => <div data-testid="brain-icon" />,
        Newspaper: () => <div data-testid="news-icon" />,
        Briefcase: () => <div data-testid="briefcase-icon" />,
        Sun: () => <div data-testid="sun-icon" />,
        Moon: () => <div data-testid="moon-icon" />,
        LogOut: () => <div data-testid="logout-icon" />,
        Search: () => <div data-testid="search-icon" />,
        PieChart: () => <div data-testid="pie-icon" />,
    };
});

describe('Navbar Component', () => {
    it('renders logo and navigation links', () => {
        render(
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <Navbar />
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        );

        expect(screen.getByText(/FinAgent/)).toBeInTheDocument();
        expect(screen.getByText(/-Pro/)).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Analytics')).toBeInTheDocument();
        expect(screen.getByText('AI Assistant')).toBeInTheDocument();
        expect(screen.getByText('Stock News')).toBeInTheDocument();
        expect(screen.getByText('Portfolio')).toBeInTheDocument();
    });
});
