import { useState } from 'react';
import { Search, Newspaper, Loader2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NewsCard from '../components/NewsCard';
import { marketAPI } from '../services/api';

const News = () => {
    const [symbol, setSymbol] = useState('');
    const [region, setRegion] = useState('GLOBAL');
    const [searchedSymbol, setSearchedSymbol] = useState('');
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e, forceSymbol) => {
        if (e) e.preventDefault();
        const query = (forceSymbol || symbol).trim().toUpperCase();
        if (!query || loading) return;

        if (!forceSymbol) setSymbol(query);
        setLoading(true);
        setHasSearched(true);
        setSearchedSymbol(query);

        try {
            const result = await marketAPI.getNews(query, region);
            setNews(result || []);
        } catch (error) {
            console.error("Failed to load news", error);
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    const trendingSearches = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'META'];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">

            {/* Header & Search */}
            <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto mt-8 lg:mt-12">
                <div className="inline-flex items-center justify-center p-4 bg-fin-card border border-fin-border rounded-2xl shadow-xl">
                    <Newspaper className="w-8 h-8 lg:w-10 lg:h-10 text-fin-accent" />
                </div>

                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">Market Intelligence</h1>
                    <p className="text-fin-muted text-base lg:text-lg">
                        Get the most relevant, real-time news and analysis for any specific ticker.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="w-full relative group mt-4">
                    <div className="absolute inset-0 bg-fin-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="relative flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex items-center flex-1 w-full">
                            <Search className="absolute left-5 lg:left-6 text-fin-muted w-5 h-5" />
                            <input
                                type="text"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                                placeholder="Enter stock symbol (e.g. AAPL)..."
                                className="w-full glass-panel !bg-fin-bg pl-12 lg:pl-14 pr-28 py-4 lg:py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-fin-accent/50 focus:border-fin-accent transition-all text-base lg:text-lg font-bold tracking-wider placeholder:font-normal placeholder:tracking-normal placeholder:text-fin-muted/60 uppercase shadow-lg"
                            />
                            <button
                                type="submit"
                                disabled={!symbol.trim() || loading}
                                className="absolute right-2 top-2 bottom-2 px-4 lg:px-6 bg-fin-accent hover:bg-fin-accent/90 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 md:w-5 md:h-5 animate-spin" /> : <span className="hidden sm:inline">Search</span>}
                                {!loading && <Search className="w-4 h-4 sm:hidden" />}
                            </button>
                        </div>

                        <div className="relative w-full sm:w-48 h-full">
                            <select
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full h-full glass-panel !bg-fin-bg py-4 lg:py-5 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-fin-accent/50 focus:border-fin-accent transition-all text-base lg:text-lg font-bold text-fin-text cursor-pointer shadow-lg appearance-none text-center"
                                style={{ minHeight: '100%' }}
                            >
                                <option value="GLOBAL" className="text-fin-text bg-fin-card">Global</option>
                                <option value="US" className="text-fin-text bg-fin-card">US Markets</option>
                                <option value="INDIA" className="text-fin-text bg-fin-card">India Markets</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-fin-muted">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                </form>

                {!hasSearched && (
                    <div className="flex flex-wrap justify-center items-center gap-2 lg:gap-3 text-sm text-fin-muted mt-4">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-medium mr-1">Trending:</span>
                        <div className="flex flex-wrap justify-center gap-2">
                            {trendingSearches.map(t => (
                                <button
                                    key={t}
                                    onClick={() => { setSymbol(t); handleSearch(null, t); }}
                                    className="px-2.5 py-1 rounded-md bg-fin-card hover:bg-fin-accent/20 hover:text-fin-accent border border-fin-border hover:border-fin-accent/30 transition-all font-semibold"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Results Area */}
            {hasSearched && (
                <div className="mt-12 lg:mt-16 animate-slide-up">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-fin-border gap-4">
                        <h2 className="text-xl lg:text-2xl font-bold flex items-center gap-3">
                            Latest News for <span className="text-fin-accent bg-fin-accent/10 px-3 py-1 rounded-lg border border-fin-accent/20 tracking-wider shadow-sm">{searchedSymbol}</span>
                        </h2>
                        <span className="text-fin-muted font-medium bg-fin-card px-3 py-1 rounded-full border border-fin-border text-sm">
                            {news.length} articles found
                        </span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="glass-panel h-64 p-5 animate-pulse flex flex-col gap-4">
                                    <div className="h-6 bg-fin-border rounded w-3/4"></div>
                                    <div className="h-4 bg-fin-border/50 rounded w-full mt-2"></div>
                                    <div className="h-4 bg-fin-border/50 rounded w-5/6"></div>
                                    <div className="h-4 bg-fin-border/50 rounded w-4/6"></div>
                                    <div className="mt-auto h-8 bg-fin-border/50 rounded w-1/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : news.length > 0 ? (
                        <AnimatePresence>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {news.map((item, i) => (
                                    <NewsCard key={item.id} {...item} delay={i} />
                                ))}
                            </div>
                        </AnimatePresence>
                    ) : (
                        <div className="text-center py-24 glass-panel flex flex-col items-center justify-center max-w-2xl mx-auto">
                            <Newspaper className="w-16 h-16 text-fin-border mb-4" />
                            <h3 className="text-xl font-bold mb-2">No News Found</h3>
                            <p className="text-fin-muted mb-6">We couldn't find any recent articles for {searchedSymbol}.</p>
                            <button
                                onClick={() => setHasSearched(false)}
                                className="px-4 py-2 bg-fin-card hover:bg-fin-border rounded-lg text-sm font-medium transition-colors border border-fin-border/50"
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default News;
