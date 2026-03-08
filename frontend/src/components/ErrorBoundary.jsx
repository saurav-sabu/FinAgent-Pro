import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-8 m-4 rounded-xl border border-fin-red/30 bg-fin-red/5 min-h-[200px]">
                    <AlertTriangle className="w-12 h-12 text-fin-red mb-4 opacity-80" />
                    <h2 className="text-lg font-bold text-fin-text mb-2">
                        {this.props.label ? `${this.props.label} is unavailable` : 'Component Crashed'}
                    </h2>
                    <p className="text-sm text-fin-muted text-center max-w-md">
                        {this.props.compact
                            ? 'Isolated crash — rest of the page is fine.'
                            : 'This section of the dashboard encountered an unexpected error. The rest of the application remains functional.'}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-4 px-4 py-2 bg-fin-bg border border-fin-border rounded-lg text-sm hover:bg-fin-card transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
