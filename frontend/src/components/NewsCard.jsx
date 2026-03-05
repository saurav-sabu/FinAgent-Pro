import { ExternalLink, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const NewsCard = ({ headline, source, date, summary, url, delay = 0 }) => {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    }).format(new Date(date));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay * 0.05 }}
            className="glass-panel p-5 lg:p-6 group flex flex-col h-full hover:border-fin-accent/40"
        >
            <div className="flex justify-between items-start mb-3 gap-4">
                <h3 className="font-bold text-lg leading-snug group-hover:text-fin-accent transition-colors line-clamp-2">
                    {headline}
                </h3>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-fin-card hover:bg-fin-accent/20 text-fin-muted hover:text-fin-accent transition-colors shrink-0 border border-fin-border group-hover:border-fin-accent/30"
                    title="Read full article"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            <p className="text-fin-muted text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                {summary}
            </p>

            <div className="flex items-center justify-between text-xs font-semibold pt-4 border-t border-fin-border/50 mt-auto">
                <span className="text-fin-accent px-2.5 py-1 bg-fin-accent/10 border border-fin-accent/20 rounded-md tracking-wide uppercase">{source}</span>
                <span className="text-fin-muted flex items-center gap-1.5 flex-row-reverse sm:flex-row">
                    <Clock className="w-3.5 h-3.5" />
                    {formattedDate}
                </span>
            </div>
        </motion.div>
    );
};

export default NewsCard;
