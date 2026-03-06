import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { LineChart, MessageSquareText, Newspaper, Menu, X, Activity, Sun, Moon, Search } from 'lucide-react';
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
        { name: 'AI Assistant', path: '/assistant', icon: MessageSquareText },
        { name: 'Stock News', path: '/news', icon: Newspaper },
    ];

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
                ? 'bg-fin-bg/80 backdrop-blur-lg border-b border-fin-border shadow-md'
                : 'bg-fin-bg border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="p-1.5 rounded-lg bg-fin-accent/10 group-hover:bg-fin-accent/20 transition-colors">
                                <Activity className="w-6 h-6 text-fin-accent" />
                            </div>
                            <div className="font-bold text-xl tracking-tight text-white flex flex-col leading-none">
                                <span>FinAgent<span className="text-fin-accent">-Pro</span></span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className={({ isActive }) => `
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive
                                            ? 'text-fin-accent bg-fin-accent/10'
                                            : 'text-fin-muted hover:text-white hover:bg-fin-card'}
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.name}
                                </NavLink>
                            );
                        })}
                    </div>

                    {/* Desktop Authenticated View & Theme Toggle */}
                    <div className="hidden md:flex items-center space-x-6">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-fin-muted hover:text-white hover:bg-fin-card transition-colors outline-none"
                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-medium text-fin-muted">
                                    Operator <span className="text-white font-bold">{user.name}</span>
                                </div>

                                {/* Quick Search Hotkey Hint */}
                                <div className="hidden lg:flex items-center text-xs text-fin-muted bg-fin-bg px-2 py-1 rounded-md border border-fin-border">
                                    <Search className="w-3 h-3 mr-1" />
                                    <span>Press</span>
                                    <kbd className="mx-1 px-1.5 py-0.5 bg-fin-card rounded text-fin-text border border-fin-border/50 font-mono font-bold">/</kbd>
                                    <span>to search</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="text-xs px-3 py-1.5 rounded-md border border-fin-border/50 text-fin-muted hover:text-white hover:bg-fin-red/10 hover:border-fin-red/30 transition-all font-bold uppercase tracking-wider"
                                >
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-bold text-fin-muted hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="text-xs font-bold bg-fin-accent/10 text-fin-accent border border-fin-accent/30 px-3 py-1.5 rounded-md hover:bg-fin-accent/20 transition-all uppercase tracking-wider">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu and theme buttons */}
                    <div className="flex items-center md:hidden space-x-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-md text-fin-muted hover:text-white transition-colors outline-none"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-fin-muted hover:text-white hover:bg-fin-card transition-colors outline-none"
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
                                                : 'text-fin-muted hover:text-white hover:bg-fin-card'}
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
                                        <div className="text-sm font-bold text-white mb-4">{user.email}</div>
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
                                        <Link to="/login" className="text-sm font-bold text-fin-muted hover:text-white transition-colors">Login Account</Link>
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
