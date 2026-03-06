import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import { marketAPI } from '../services/api';
import useKeyPress from '../hooks/useKeyPress';

const Assistant = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '### Welcome to FinAgent-Pro\n\nI am your advanced AI financial analyst powered by real-time market data.\n\nI can analyze stocks, compare companies, provide sector insights, and evaluate market trends using **real-time data** from the markets.\n\nTry asking me:\n- "Analyze AAPL"\n- "Compare TSLA and NVDA"\n- "What is the outlook for the tech sector?"' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Global Hotkey Binding
    useKeyPress('Enter', (e) => {
        // Only trigger if we actually typed something avoiding empty submissions
        if (input.trim() && !isLoading) {
            handleSubmit(e);
        }
    }, { prevent: true, allowInInput: true });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Add a placeholder message for the AI that we will update as chunks arrive
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            await marketAPI.askAssistant(userMessage, (chunk) => {
                setMessages(prev => {
                    const newMessages = [...prev];
                    // Create a shallow copy of the last message to avoid mutating the React state object directly
                    const lastMessage = { ...newMessages[newMessages.length - 1] };

                    // Stream yields network deltas, so we accumulate them over time.
                    lastMessage.content += chunk;

                    // Replace the last element with our newly minted object
                    newMessages[newMessages.length - 1] = lastMessage;

                    return newMessages;
                });

                // Hide the loading animation once the first chunk arrives
                setIsLoading(false);
            });

        } catch (error) {
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (!lastMessage.content) {
                    lastMessage.content = "⚠️ **Connection Error**\n\nI'm sorry, I encountered an error while communicating with the analysis engine. Please ensure the backend is running and try again.";
                } else {
                    lastMessage.content += "\n\n⚠️ **Error: Connection interrupted.**";
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto animate-fade-in relative">

            {/* Decorative background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-fin-accent/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="text-center mb-6 z-10 shrink-0">
                <div className="inline-flex items-center justify-center p-3 bg-fin-accent/10 rounded-2xl mb-4 border border-fin-accent/20">
                    <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-fin-accent" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">AI Stock Assistant</h1>
                <p className="text-fin-muted text-sm max-w-lg mx-auto">
                    Ask complex financial questions, get real-time analysis, and discover market insights powered by advanced AI.
                </p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 glass-panel overflow-y-auto mb-6 p-2 lg:p-4 rounded-3xl relative z-10 flex flex-col shadow-2xl">
                <div className="flex-1 space-y-2">
                    {messages.map((msg, i) => (
                        <ChatMessage key={i} role={msg.role} content={msg.content} />
                    ))}

                    {isLoading && (
                        <div className="flex gap-4 p-4 lg:p-6 mx-2">
                            <div className="w-8 h-8 rounded-full bg-fin-accent/20 text-fin-accent flex items-center justify-center shrink-0 border border-fin-accent/20">
                                <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-fin-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-fin-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-fin-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Input Area */}
            <div className="relative z-10 shrink-0">
                <form onSubmit={handleSubmit} className="relative group">
                    <div className="absolute inset-x-4 -inset-y-2 bg-fin-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about a stock, sector, or market trend..."
                        className="w-full relative glass-panel !bg-fin-bg px-5 lg:px-6 py-4 pr-16 rounded-2xl focus:outline-none focus:ring-2 focus:ring-fin-accent/50 focus:border-fin-accent transition-all text-fin-text placeholder:text-fin-muted/50 shadow-xl text-sm lg:text-base"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-fin-accent hover:bg-fin-accent/90 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 lg:w-5 lg:h-5 ml-0.5 lg:ml-1" />}
                    </button>
                </form>
                <p className="text-center text-[10px] text-fin-muted mt-3">
                    AI analysis is for informational purposes only. Do not use as sole basis for investment decisions.
                </p>
            </div>
        </div>
    );
};

export default Assistant;
