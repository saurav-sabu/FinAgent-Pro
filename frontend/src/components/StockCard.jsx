import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const StockCard = ({ symbol, name, price, change, volume, delay = 0 }) => {
    const isPositive = change >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: delay * 0.05 }}
            className="glass-panel p-3 lg:p-4 flex items-center justify-between group cursor-pointer hover:border-fin-accent/30"
        >
            <div className="flex items-center gap-3 lg:gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm bg-fin-bg border border-fin-border
          group-hover:scale-105 transition-transform shrink-0`}
                >
                    {symbol.substring(0, 2)}
                </div>

                <div className="min-w-0">
                    <div className="font-bold text-sm lg:text-base text-fin-text truncate">{symbol}</div>
                    <div className="text-xs text-fin-muted max-w-[80px] lg:max-w-[100px] truncate">{name}</div>
                </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
                <div className="font-bold text-sm lg:text-base">{price}</div>
                <div className={`text-xs font-semibold flex items-center gap-1 ${isPositive ? 'text-fin-green' : 'text-fin-red'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(change)}%
                </div>
                <div className="text-[10px] text-fin-muted mt-1 w-full text-right flex items-center justify-end gap-1">
                    <Activity className="w-3 h-3 opacity-50" /> {volume}
                </div>
            </div>
        </motion.div>
    );
};

export default StockCard;
