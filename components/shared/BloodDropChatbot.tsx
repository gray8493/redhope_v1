"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";

// Custom Blood Drop Icon Component
const BloodDropIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
    </svg>
);

interface Message {
    id: number;
    text: string;
    isBot: boolean;
    timestamp: Date;
}

const quickReplies = [
    "Tôi muốn hiến máu",
    "Điều kiện hiến máu?",
    "Tìm điểm hiến gần tôi",
    "Nhóm máu của tôi"
];

export function BloodDropChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Xin chào! 👋 Tôi là trợ lý ảo của REDHOPE. Tôi có thể giúp bạn tìm hiểu về hiến máu, đặt lịch, hoặc trả lời các thắc mắc. Bạn cần hỗ trợ gì?",
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text?: string) => {
        const messageText = text || inputValue.trim();
        if (!messageText) return;

        // Add user message
        const userMessage: Message = {
            id: messages.length + 1,
            text: messageText,
            isBot: false,
            timestamp: new Date()
        };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputValue("");
        setIsTyping(true);

        try {
            // Call API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    // Send last few messages ascontext if needed, for now just simple
                    history: messages.slice(-5) // Send last 5 messages context
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            const botReply: Message = {
                id: messages.length + 2,
                text: data.text || "Xin lỗi, tôi đang gặp chút sự cố kết nối. Vui lòng thử lại sau!",
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botReply]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorReply: Message = {
                id: messages.length + 2,
                text: "⚠️ Có lỗi xảy ra khi kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.",
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorReply]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 group transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            >
                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-25"></div>
                <div className="absolute inset-0 rounded-full bg-red-600 animate-pulse opacity-40"></div>

                {/* Main button */}
                <div className="relative size-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 shadow-xl shadow-red-600/40 flex items-center justify-center hover:scale-110 hover:shadow-red-600/60 transition-all duration-300 group-hover:from-red-500 group-hover:to-red-600">
                    <BloodDropIcon className="w-8 h-8 text-white drop-shadow-lg" />

                    {/* Sparkle effect */}
                    <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 animate-bounce" />
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                    Chat với trợ lý REDHOPE
                    <div className="absolute top-full right-6 border-8 border-transparent border-t-slate-900"></div>
                </div>
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-6 right-6 z-50 w-[380px] h-[550px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>

                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                            <BloodDropIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">Blood Mono</h3>
                            <p className="text-white/70 text-xs flex items-center gap-1">
                                <span className="size-2 rounded-full bg-green-400 animate-pulse"></span>
                                Đang hoạt động
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="size-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className={`max-w-[80%] p-3 rounded-2xl ${message.isBot
                                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm'
                                : 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-tr-sm'
                                }`}>
                                <p className="text-sm whitespace-pre-line">{message.text}</p>
                                <p className={`text-[10px] mt-1 ${message.isBot ? 'text-slate-400' : 'text-white/70'}`}>
                                    {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl rounded-tl-sm shadow-sm">
                                <div className="flex items-center gap-1">
                                    <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {quickReplies.map((reply) => (
                            <button
                                key={reply}
                                onClick={() => handleSend(reply)}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-medium rounded-full whitespace-nowrap transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!inputValue.trim()}
                            className="size-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white flex items-center justify-center hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-600/30 hover:shadow-red-600/50 active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
