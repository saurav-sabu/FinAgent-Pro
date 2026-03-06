import { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useTheme } from '../context/ThemeContext';

const Tour = () => {
    const { isDark } = useTheme();

    // Check if the user has completed the tour already
    const [run, setRun] = useState(false);

    useEffect(() => {
        const hasCompletedTour = localStorage.getItem('tourCompleted');
        if (!hasCompletedTour) {
            // Introduce a slight delay so the UI fully mounts before initializing
            setTimeout(() => setRun(true), 1500);
        }
    }, []);

    const steps = [
        {
            target: 'body',
            content: 'Welcome to FinAgent-Pro! Let\'s take a quick tour of your new AI-powered trading terminal.',
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '.tour-search',
            content: 'Use this bar to instantly pivot the entire dashboard to analyze a new stock ticker like TSLA or MSFT.',
            placement: 'bottom'
        },
        {
            target: '.tour-chart',
            content: 'This interactive canvas streams real-time candlesticks paired with 50-day and 200-day Simple Moving Averages. Hover to inspect precise intervals.',
            placement: 'left'
        },
        {
            target: '.tour-timeframe',
            content: 'Instantly swap between daily, weekly, and year-to-date lookbacks. The graph dynamically re-renders.',
            placement: 'top'
        },
        {
            target: '.tour-insight',
            content: 'Our localized AI immediately analyzes the underlying technicals to synthesize a bullish or bearish recommendation for you.',
            placement: 'left'
        },
        {
            target: '.tour-export',
            content: 'Need to share your analysis? Export high-fidelity PNG charts or raw CSV datasets instantly.',
            placement: 'top'
        }
    ];

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            // Stop the tour and save to localStorage so it doesn't run again
            setRun(false);
            localStorage.setItem('tourCompleted', 'true');
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous={true}
            scrollToFirstStep={true}
            showProgress={true}
            showSkipButton={true}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#3b82f6', // Fin-accent
                    backgroundColor: isDark ? '#151b2a' : '#ffffff', // Fin-card
                    textColor: isDark ? '#f1f5f9' : '#0f172a', // Fin-text
                    arrowColor: isDark ? '#151b2a' : '#ffffff',
                    overlayColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
                },
                buttonNext: {
                    backgroundColor: '#3b82f6',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                },
                buttonSkip: {
                    color: isDark ? '#94a3b8' : '#64748b',
                },
                buttonBack: {
                    color: isDark ? '#3b82f6' : '#2563eb',
                }
            }}
        />
    );
};

export default Tour;
