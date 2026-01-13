'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { getAuthHeaders } from '@/lib/auth';
import { Question, Answers } from '@/types';
import ChatMessage from '@/components/ChatMessage';
import QuestionInput from '@/components/QuestionInput';
import { signOut } from 'firebase/auth';

export default function UserPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [messages, setMessages] = useState<{ type: 'question' | 'answer'; text: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showComplete, setShowComplete] = useState(false);
    const [toast, setToast] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadQuestions();
    }, []);

    useEffect(() => {
        // 메시지 자동 스크롤
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadQuestions = async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch('/api/questions', { headers });

            if (!response.ok) {
                throw new Error('질문을 불러올 수 없습니다.');
            }

            const data = await response.json();
            setQuestions(data.questions);

            // 첫 번째 질문 표시
            if (data.questions.length > 0) {
                setMessages([{ type: 'question', text: data.questions[0].text }]);
            }

            setLoading(false);
        } catch (error) {
            console.error('질문 로드 실패:', error);
            alert('질문을 불러오는데 실패했습니다.');
            setLoading(false);
        }
    };

    const handleAnswerSubmit = () => {
        if (!currentAnswer.trim()) return;

        const currentQuestion = questions[currentQuestionIndex];

        // 답변 저장
        const newAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
        setAnswers(newAnswers);

        // 메시지에 답변 추가
        setMessages((prev) => [...prev, { type: 'answer', text: currentAnswer }]);
        setCurrentAnswer('');

        // 다음 질문으로 이동
        if (currentQuestionIndex < questions.length - 1) {
            const nextQuestion = questions[currentQuestionIndex + 1];
            setTimeout(() => {
                setMessages((prev) => [...prev, { type: 'question', text: nextQuestion.text }]);
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            }, 300);
        } else {
            // 모든 질문 완료
            setShowComplete(true);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);

        try {
            const headers = await getAuthHeaders();
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers,
                body: JSON.stringify({ answers }),
            });

            if (!response.ok) {
                throw new Error('제출에 실패했습니다.');
            }

            // 엑셀 파일 다운로드
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            const filenameMatch = contentDisposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            const filename = filenameMatch
                ? decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''))
                : 'survey.xlsx';

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // 성공 메시지
            setToast('제출되었습니다.');
            setTimeout(() => {
                setToast('');
                resetSurvey();
            }, 2000);
        } catch (error) {
            console.error('제출 실패:', error);
            alert('제출에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setSubmitting(false);
        }
    };

    const resetSurvey = () => {
        setCurrentQuestionIndex(0);
        setAnswers({});
        setCurrentAnswer('');
        setShowComplete(false);
        setMessages(questions.length > 0 ? [{ type: 'question', text: questions[0].text }] : []);
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <p className="text-gray-600">질문 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* 헤더 */}
            <div className="bg-white shadow-md">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">설문조사</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                    >
                        로그아웃
                    </button>
                </div>
            </div>

            {/* 채팅 영역 */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[500px] max-h-[600px] flex flex-col">
                    {/* 메시지 영역 */}
                    <div className="flex-1 overflow-y-auto mb-6 space-y-4">
                        {messages.map((msg, idx) => (
                            <ChatMessage key={idx} type={msg.type} text={msg.text} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 입력 영역 */}
                    {!showComplete ? (
                        <QuestionInput
                            value={currentAnswer}
                            onChange={setCurrentAnswer}
                            onSubmit={handleAnswerSubmit}
                            disabled={submitting}
                        />
                    ) : (
                        <div className="space-y-3">
                            <p className="text-center text-lg font-semibold text-gray-700 mb-4">
                                모든 질문에 답변하셨습니다!
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
                           text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 transition-all"
                                >
                                    {submitting ? '처리 중...' : '작성완료 및 제출'}
                                </button>
                                <button
                                    onClick={resetSurvey}
                                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                                >
                                    다시 작성
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 진행 표시 */}
                <div className="mt-4 text-center text-sm text-gray-600">
                    질문 {Math.min(currentQuestionIndex + 1, questions.length)} / {questions.length}
                </div>
            </div>

            {/* 토스트 알림 */}
            {toast && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg animate-slide-up">
                    {toast}
                </div>
            )}
        </div>
    );
}
