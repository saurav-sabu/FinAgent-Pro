import axios from 'axios';

// Base URL setup
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const USE_MOCK_DATA = false;

// Token helpers for the AuthContext integration
export const marketAPI = {
    setToken: (token) => {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    clearToken: () => {
        delete apiClient.defaults.headers.common['Authorization'];
    },

    login: async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email); // OAuth2 expects 'username' instead of 'email'
        formData.append('password', password);

        const response = await axios.post(`${API_URL}/auth/login`, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data;
    },

    register: async (name, email, password) => {
        const response = await apiClient.post('/auth/register', { name, email, password });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
    getDashboard: async (ticker = "AAPL") => {
        try {
            if (USE_MOCK_DATA) return getMockDashboardData();

            const response = await apiClient.get(`/dashboard?ticker=${ticker}`);
            const data = response.data;

            // Helper to format volume nicely
            const formatVolume = (vol) => {
                if (vol >= 1000000) return (vol / 1000000).toFixed(1) + 'M';
                if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K';
                return vol.toString();
            };

            // Adapt Backend DashboardResponse schema to Frontend expected structure
            return {
                // Map backend dict to array of objects expected by IndexCard
                indices: Object.values(data.indices || {}).map(entry => ({
                    name: entry.name,
                    value: entry.price ? entry.price.toLocaleString('en-US', { style: 'currency', currency: entry.currency || 'USD' }) : '---',
                    change: entry.change_percent
                })),

                // Map trending gainers and losers. 
                // Backend TrendingStock schema: { ticker, name, price, change_percent, volume, currency }
                // Frontend StockCard expects: { symbol, name, price, change, volume }
                topGainers: (data.trending?.gainers || []).map(stock => ({
                    symbol: stock.ticker,
                    name: stock.name || '',
                    price: stock.price.toLocaleString('en-US', { style: 'currency', currency: stock.currency || 'USD' }),
                    change: stock.change_percent,
                    volume: stock.volume ? formatVolume(stock.volume) : '---'
                })),

                topLosers: (data.trending?.losers || []).map(stock => ({
                    symbol: stock.ticker,
                    name: stock.name || '',
                    price: stock.price.toLocaleString('en-US', { style: 'currency', currency: stock.currency || 'USD' }),
                    change: stock.change_percent,
                    volume: stock.volume ? formatVolume(stock.volume) : '---'
                })),

                stockDetails: {
                    ...(data.stock_lookup || {}),
                    ticker: (data.stock_lookup || {}).ticker,
                    name: (data.stock_lookup || {}).name,
                },
                sectorPerformance: data.sector_performance || {},
                riskAnalysis: data.risk_score || {},
                volumeAlert: data.volume_alert || false
            };

        } catch (error) {
            console.error('Error fetching dashboard data', error);
            if (USE_MOCK_DATA) return getMockDashboardData();
            throw error;
        }
    },

    getInsight: async (ticker = "AAPL") => {
        try {
            if (USE_MOCK_DATA) return {
                ticker,
                sentiment: "Bullish",
                summary_bullets: ["Strong earnings report", "High institutional buying", "MACD crossover"],
                recommendation: "Strong Buy"
            };
            const response = await apiClient.get(`/dashboard/insight?ticker=${ticker}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching AI insight', error);
            if (USE_MOCK_DATA) return {
                ticker,
                sentiment: "Neutral",
                summary_bullets: ["Error fetching AI insight.", "Check your backend connection.", "API rate limited possibly."],
                recommendation: "Hold"
            };
            throw error;
        }
    },

    askAssistant: async (message, onChunk) => {
        try {
            if (USE_MOCK_DATA) {
                // Mock streaming chunk by chunk
                const mockText = "**Apple Inc. (AAPL)** is currently trading at $185.00 (+1.2%).\n\n### Detailed Analysis\n- **P/E Ratio:** 28.5\n- **EPS:** $6.50\n- **Analyst Consensus:** Strong Buy\n\nThe stock shows positive momentum following strong iPhone sales. Our AI rating gives this a solid growth prospect over the next 12 months.";
                const words = mockText.split(' ');
                for (let i = 0; i < words.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                    onChunk(words[i] + ' ');
                }
                return;
            }

            // Backend expects {"query": "message"}
            // We use standard fetch here instead of Axios to properly read the ReadableStream
            const response = await fetch(`${API_URL}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decode the byte chunk to string and invoke the callback to update the UI
                const chunkText = decoder.decode(value, { stream: true });
                if (onChunk) {
                    onChunk(chunkText);
                }
            }

        } catch (error) {
            console.error('Error with AI assistant', error);
            if (onChunk && USE_MOCK_DATA) {
                onChunk("I'm sorry, I couldn't reach the backend server to perform the analysis.");
            }
            throw error;
        }
    },

    getNews: async (symbol, region = "GLOBAL") => {
        try {
            if (USE_MOCK_DATA) return getMockNews(symbol);

            const response = await apiClient.get(`/news?ticker=${symbol}&region=${region}`);
            const data = response.data;

            // Backend returns NewsResponse { region: ..., items: [{title, description, url, source, published_date, ...}]}
            // Frontend NewsCard expects { id, headline, source, date, summary, url }

            if (!data.items) return [];

            return data.items.map((item, index) => ({
                id: index,
                headline: item.title,
                source: item.source,
                date: item.published_date,
                summary: item.description || "No description available.",
                url: item.url
            }));

        } catch (error) {
            console.error('Error fetching news', error);
            if (USE_MOCK_DATA) return getMockNews(symbol);
            throw error;
        }
    },

    getFundamentals: async (ticker) => {
        try {
            const response = await apiClient.get(`/api/analytics/fundamentals/${ticker}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching fundamentals', error);
            throw error;
        }
    },

    getTechnicals: async (ticker, period = "1y") => {
        try {
            const response = await apiClient.get(`/api/analytics/technicals/${ticker}?period=${period}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching technical indicators', error);
            throw error;
        }
    },

    getCalendar: async () => {
        try {
            const response = await apiClient.get(`/api/analytics/calendar`);
            return response.data;
        } catch (error) {
            console.error('Error fetching economic calendar', error);
            throw error;
        }
    },

    getSectors: async (region = "US") => {
        try {
            const response = await apiClient.get(`/api/analytics/sectors?region=${region}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching sector performance for ${region}`, error);
            throw error;
        }
    }
};

// Mock Data Generators for fallback/testing
function getMockDashboardData() {
    return {
        indices: [
            { name: 'S&P 500', value: '4,958.61', change: 1.07 },
            { name: 'NASDAQ', value: '15,628.95', change: 1.74 },
            { name: 'Dow Jones', value: '38,654.42', change: 0.35 },
            { name: 'NIFTY 50', value: '21,929.40', change: 0.72 },
            { name: 'Sensex', value: '72,152.00', change: -0.63 },
        ],
        topGainers: [
            { symbol: 'NVDA', name: 'NVIDIA Corp', price: '682.23', change: 4.97, volume: '45.2M' },
            { symbol: 'META', name: 'Meta Platforms', price: '459.41', change: 3.28, volume: '22.1M' },
            { symbol: 'PLTR', name: 'Palantir Tech', price: '21.87', change: 30.80, volume: '150.2M' },
            { symbol: 'AMD', name: 'Advanced Micro', price: '174.40', change: 2.15, volume: '58.7M' },
        ],
        topLosers: [
            { symbol: 'TSLA', name: 'Tesla Inc', price: '185.10', change: -1.45, volume: '88.3M' },
            { symbol: 'BABA', name: 'Alibaba Group', price: '74.22', change: -3.51, volume: '18.4M' },
            { symbol: 'PYPL', name: 'PayPal Holdings', price: '60.10', change: -5.20, volume: '32.1M' },
            { symbol: 'INTC', name: 'Intel Corp', price: '42.80', change: -1.25, volume: '29.3M' },
        ],
        chartData: Array.from({ length: 40 }).map((_, i) => {
            let base = 4900;
            let val = base + Math.sin(i / 5) * 50 + (i * 1.5) + (Math.random() * 20 - 10);
            return {
                time: `10:${i.toString().padStart(2, '0')}`,
                value: val
            }
        })
    };
}

function getMockNews(symbol) {
    const t = symbol.toUpperCase();
    return [
        {
            id: 1,
            headline: `${t} Reports Record Breaking Quarterly Earnings`,
            source: 'Bloomberg',
            date: new Date().toISOString(),
            summary: `The tech giant ${t} announced its Q4 results today.`,
            url: '#'
        }
    ];
}
