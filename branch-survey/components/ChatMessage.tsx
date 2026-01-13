'use client';

interface ChatMessageProps {
    type: 'question' | 'answer';
    text: string;
}

export default function ChatMessage({ type, text }: ChatMessageProps) {
    const isQuestion = type === 'question';

    return (
        <div
            className={`flex ${isQuestion ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in`}
        >
            <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-md ${isQuestion
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-bl-none'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white rounded-br-none'
                    }`}
            >
                <p className="text-sm md:text-base leading-relaxed">{text}</p>
            </div>
        </div>
    );
}
