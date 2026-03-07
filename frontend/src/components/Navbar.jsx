import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { LineChart, MessageSquareText, Newspaper, Menu, X, Activity, Sun, Moon, Search, PieChart, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useKeyPress from '../hooks/useKeyPress';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const searchRef = useRef(null);

    // Global shortcut mapping
    useKeyPress('/', () => {
        if (searchRef.current) {
            searchRef.current.focus();
        }
    }, { prevent: true });

    useKeyPress('Escape', () => {
        if (mobileMenuOpen) {
            setMobileMenuOpen(false);
        }
    });

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: LineChart },
        { name: 'Analytics', path: '/analytics', icon: PieChart },
        { name: 'AI Assistant', path: '/assistant', icon: MessageSquareText },
        { name: 'Stock News', path: '/news', icon: Newspaper },
        { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
    ];

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
                ? 'bg-fin-bg/80 backdrop-blur-lg border-b border-fin-border shadow-md'
                : 'bg-fin-bg border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Logo + Desktop Nav Group */}
                    <div className="flex items-center gap-12">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link to="/" className="flex items-center gap-2.5 group">
                                <div className="p-1.5 rounded-lg bg-fin-accent/10 group-hover:bg-fin-accent/20 transition-all duration-300">
                                    <Activity className="w-6 h-6 text-fin-accent" />
                                </div>
                                <div className="font-bold text-xl tracking-tight text-fin-text flex flex-col leading-none">
                                    <span className="whitespace-nowrap">FinAgent<span className="text-fin-accent">-Pro</span></span>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex md:items-center md:gap-2">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <NavLink
                                        key={link.name}
                                        to={link.path}
                                        className={({ isActive }) => `
                        flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap
                        ${isActive
                                                ? 'text-fin-accent bg-fin-accent/10 shadow-sm'
                                                : 'text-fin-muted hover:text-fin-text hover:bg-fin-card'}
                      `}
                                    >
                                        <Icon className="w-[18px] h-[18px] shrink-0" />
                                        {link.name}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Actions & Auth */}
                    <div className="hidden md:flex items-center gap-4 lg:gap-6">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl text-fin-muted hover:text-fin-text hover:bg-fin-card transition-all duration-300 outline-none"
                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDark ? <Sun className="w-[20px] h-[20px]" /> : <Moon className="w-[20px] h-[20px]" />}
                        </button>

                        <div className="h-8 w-px bg-fin-border/30 mx-2" />

                        {user ? (
                            <div className="flex items-center gap-4 lg:gap-6">
                                <div className="text-sm font-medium text-fin-muted flex flex-col items-end">
                                    <span className="text-[9px] uppercase tracking-widest text-fin-accent/60 mb-0.5 whitespace-nowrap">Terminal Active</span>
                                    <span className="text-fin-text font-bold whitespace-nowrap">{user.name}</span>
                                </div>

                                {/* Quick Search Hotkey Hint */}
                                <div className="hidden xl:flex items-center text-xs text-fin-muted bg-fin-bg px-3 py-1.5 rounded-lg border border-fin-border shadow-inner whitespace-nowrap">
                                    <Search className="w-3.5 h-3.5 mr-2 opacity-60" />
                                    <span className="font-medium mr-2">Search</span>
                                    <kbd className="px-1.5 py-0.5 bg-fin-card rounded border border-fin-border/50 font-mono font-black text-fin-accent"> / </kbd>
                                </div>
                                <button
                                    onClick={logout}
                                    className="text-[10px] px-4 py-2 rounded-lg border border-fin-red/20 text-fin-red hover:bg-fin-red hover:text-white hover:border-fin-red shadow-sm transition-all duration-300 font-black uppercase tracking-widest whitespace-nowrap"
                                >
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-bold text-fin-muted hover:text-fin-text transition-all duration-300 whitespace-nowrap">
                                    Login
                                </Link>
                                <Link to="/register" className="text-[11px] font-black bg-fin-accent text-white px-5 py-2.5 rounded-lg hover:shadow-lg hover:shadow-fin-accent/20 transition-all duration-300 uppercase tracking-widest whitespace-nowrap">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <div className="flex items-center md:hidden gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-md text-fin-muted hover:text-fin-text transition-colors outline-none"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-fin-muted hover:text-fin-text hover:bg-fin-card transition-colors outline-none"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-fin-bg border-b border-fin-border overflow-hidden"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <NavLink
                                        key={link.name}
                                        to={link.path}
                                        className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors
                      ${isActive
                                                ? 'text-fin-accent bg-fin-accent/10'
                                                : 'text-fin-muted hover:text-fin-text hover:bg-fin-card'}
                    `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {link.name}
                                    </NavLink>
                                );
                            })}

                            <div className="border-t border-fin-border/50 mt-4 pt-4 pb-2">
                                {user ? (
                                    <div className="px-3">
                                        <div className="text-xs text-fin-muted mb-3 font-medium uppercase tracking-wider">Session Active</div>
                                        <div className="text-sm font-bold text-fin-text mb-4">{user.email}</div>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full text-left text-sm font-bold text-fin-red hover:text-fin-red/80 transition-colors"
                                        >
                                            Log Out Terminal
                                        </button>
                                    </div>
                                ) : (
                                    <div className="px-3 flex flex-col gap-3">
                                        <Link to="/login" className="text-sm font-bold text-fin-muted hover:text-fin-text transition-colors">Login Account</Link>
                                        <Link to="/register" className="text-sm font-bold text-fin-accent hover:text-fin-accent/80 transition-colors">Request Access</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
