import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { LineChart, MessageSquareText, Newspaper, Menu, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

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

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
