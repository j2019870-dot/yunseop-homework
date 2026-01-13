'use client';

import { KeyboardEvent } from 'react';

interface QuestionInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder?: string;
    disabled?: boolean;
}

export default function QuestionInput({
    value,
    onChange,
    onSubmit,
    placeholder = '답변을 입력하고 Enter를 누르세요...',
    disabled = false,
}: QuestionInputProps) {
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <div className="w-full">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-full 
                   focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                   disabled:bg-gray-100 disabled:cursor-not-allowed
                   transition-all duration-200 text-sm md:text-base"
                autoFocus
            />
            <p className="mt-2 text-xs text-gray-500 text-center">
                Enter 키를 눌러 다음 질문으로 이동
            </p>
        </div>
    );
}
