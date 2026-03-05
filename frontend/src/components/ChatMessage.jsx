import { User, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage = ({ role, content }) => {
    const isAi = role === 'assistant';

    // Using react-markdown to elegantly parse all markdown elements
    const renderContent = (text) => {
        if (!text) return null;

        return (
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-fin-bg prose-pre:border prose-pre:border-fin-border"
                components={{
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-white" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 text-white" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-white" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="text-fin-text/90" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                    a: ({ node, ...props }) => <a className="text-fin-accent hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    code: ({ node, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        // In v9, inline is removed. We check if there's a language match or a newline.
                        const isInline = !match;
                        return !isInline ? (
                            <div className="relative group rounded-md overflow-hidden bg-fin-bg border border-fin-border my-4">
                                <div className="flex items-center justify-between px-4 py-1.5 bg-fin-border/30 border-b border-fin-border">
                                    <span className="text-[10px] text-fin-muted font-mono uppercase">{match?.[1] || 'code'}</span>
                                </div>
                                <div className="p-4 overflow-x-auto text-sm font-mono text-fin-text/90">
                                    <code className={className} {...props}>{children}</code>
                                </div>
                            </div>
                        ) : (
                            <code className="bg-fin-accent/10 text-fin-accent px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                        );
                    },
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto mb-4 border border-fin-border rounded-lg">
                            <table className="w-full text-sm text-left" {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-fin-bg/80 text-fin-muted uppercase text-xs" {...props} />,
                    th: ({ node, ...props }) => <th className="px-4 py-3 font-medium border-b border-fin-border/50" {...props} />,
                    td: ({ node, ...props }) => <td className="px-4 py-3 border-b border-fin-border/20 last:border-0" {...props} />,
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-2 border-fin-accent pl-4 italic text-fin-muted my-4" {...props} />
                    ),
                }}
            >
                {text}
            </ReactMarkdown>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 lg:gap-4 p-4 lg:p-6 rounded-2xl ${isAi ? 'bg-fin-bg/50 border border-fin-border/50 shadow-sm mx-1 lg:mx-2' : ''}`}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5
        ${isAi ? 'bg-fin-accent/20 text-fin-accent border border-fin-accent/20' : 'bg-fin-border/50 text-fin-muted border border-fin-border'}`}
            >
                {isAi ? <Activity className="w-4 h-4 lg:w-5 lg:h-5" /> : <User className="w-4 h-4 lg:w-5 lg:h-5" />}
            </div>

            <div className="flex-1 min-w-0 text-sm lg:text-base leading-relaxed text-fin-text">
                {renderContent(content)}
            </div>
        </motion.div>
    );
};

export default ChatMessage;
