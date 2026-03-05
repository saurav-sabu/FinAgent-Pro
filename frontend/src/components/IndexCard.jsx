import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const IndexCard = ({ name, value, change, delay = 0 }) => {
    const isPositive = change >= 0;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay * 0.1 }}
            className="glass-panel p-4 lg:p-5 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1"
        >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20 ${isPositive ? 'bg-fin-green' : 'bg-fin-red'}`} />

            <div className="flex justify-between items-start z-10">
                <h3 className="text-fin-muted font-medium text-xs lg:text-sm tracking-wide">{name}</h3>
                <div className={`p-1 lg:p-1.5 rounded-md ${isPositive ? 'bg-fin-green-bg text-fin-green' : 'bg-fin-red-bg text-fin-red'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" /> : <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4" />}
                </div>
            </div>

            <div className="z-10 mt-1">
                <div className="text-xl lg:text-2xl font-bold tracking-tight">{value}</div>
                <div className={`text-xs lg:text-sm font-medium mt-1 ${isPositive ? 'text-fin-green' : 'text-fin-red'}`}>
                    {isPositive ? '+' : ''}{change}%
                </div>
            </div>
        </motion.div>
    );
};

export default IndexCard;
