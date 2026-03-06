import { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';
import { Calendar, AlertCircle, Loader2 } from 'lucide-react';

const CalendarPanel = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                setLoading(true);
                const data = await marketAPI.getCalendar();
                setEvents(data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("Failed to load economic calendar.");
            } finally {
                setLoading(false);
            }
        };

        fetchCalendar();
    }, []);

    const getImpactColor = (impact) => {
        switch (impact) {
            case 'High': return 'text-fin-red bg-fin-red/10 border-fin-red/30';
            case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
            case 'Low': return 'text-fin-green bg-fin-green/10 border-fin-green/30';
            default: return 'text-fin-muted bg-fin-card border-fin-border';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-64">
                <Loader2 className="w-8 h-8 text-fin-accent animate-spin mb-4" />
                <p className="text-fin-muted">Fetching macro events...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-64 text-fin-red">
                <AlertCircle className="w-8 h-8 mb-4" />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-fin-border/50 text-xs uppercase tracking-wider text-fin-muted">
                        <th className="p-4 font-bold">Date & Time</th>
                        <th className="p-4 font-bold">Country</th>
                        <th className="p-4 font-bold">Event</th>
                        <th className="p-4 font-bold">Impact</th>
                        <th className="p-4 font-bold text-right">Actual / Forecast</th>
                        <th className="p-4 font-bold text-right">Previous</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-fin-border/30">
                    {events.map((event) => {
                        const dateObj = new Date(event.date);
                        const isPast = dateObj < new Date();

                        return (
                            <tr key={event.id} className={`hover:bg-fin-card transition-colors ${isPast ? 'opacity-60' : ''}`}>
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-fin-text">{dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                        <span className="text-xs text-fin-muted">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-fin-bg border border-fin-border text-xs font-bold text-fin-text">
                                        {event.country}
                                    </span>
                                </td>
                                <td className="p-4 font-medium text-fin-text text-sm">
                                    {event.event}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getImpactColor(event.impact)}`}>
                                        {event.impact}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-mono text-sm font-bold text-fin-text">
                                    {event.forecast}
                                </td>
                                <td className="p-4 text-right font-mono text-sm text-fin-muted">
                                    {event.previous}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {events.length === 0 && (
                <div className="text-center py-12 text-fin-muted">
                    No upcoming economic events found.
                </div>
            )}
        </div>
    );
};

export default CalendarPanel;
