import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Zap } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await register(name, email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center -mt-10 px-4">
            <div className="w-full max-w-md glass-panel p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-fin-green/10 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="text-center mb-8 relative z-10">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-fin-bg border border-fin-border/50 mb-4 shadow-lg shadow-fin-green/10">
                        <Zap className="h-6 w-6 text-fin-green" />
                    </div>
                    <h2 className="text-2xl font-bold text-fin-text mb-2 tracking-tight">Initialize Profile</h2>
                    <p className="text-fin-muted text-sm">Create your AI Market Analyst account</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-fin-red/10 border border-fin-red/20 rounded-lg text-fin-red text-sm text-center relative z-10">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div>
                        <label className="block text-xs font-bold text-fin-muted uppercase tracking-wider mb-2">Display Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-fin-bg border border-fin-border/60 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-fin-green focus:ring-1 focus:ring-fin-green/50 transition-all font-medium text-fin-text placeholder-fin-muted/50"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-fin-muted uppercase tracking-wider mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-fin-bg border border-fin-border/60 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-fin-green focus:ring-1 focus:ring-fin-green/50 transition-all font-medium text-fin-text placeholder-fin-muted/50"
                            placeholder="analyst@firm.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-fin-muted uppercase tracking-wider mb-2">Encryption Key (Password)</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-fin-bg border border-fin-border/60 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-fin-green focus:ring-1 focus:ring-fin-green/50 transition-all font-medium text-fin-text placeholder-fin-muted/50"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 bg-gradient-to-r from-fin-green to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg shadow-fin-green/20 transition-all flex items-center justify-center h-11"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'PROVISION ACCOUNT'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-fin-muted relative z-10">
                    Already authorized?{' '}
                    <Link to="/login" className="text-fin-green hover:text-fin-text font-bold transition-colors">
                        Login Terminal
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
