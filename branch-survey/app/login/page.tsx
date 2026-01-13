'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getAuthHeaders } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let userCredential;

            if (isLogin) {
                // 로그인
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                // 회원가입
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            }

            // 사용자 프로필 조회
            const headers = await getAuthHeaders();
            const response = await fetch('/api/me', { headers });

            if (!response.ok) {
                throw new Error('사용자 정보를 가져올 수 없습니다.');
            }

            const userData = await response.json();

            // 역할에 따라 리다이렉트
            if (userData.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/user');
            }
        } catch (err: any) {
            console.error('로그인 오류:', err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('이메일 또는 비밀번호가 올바르지 않습니다.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('이미 사용 중인 이메일입니다.');
            } else if (err.code === 'auth/weak-password') {
                setError('비밀번호는 최소 6자 이상이어야 합니다.');
            } else {
                setError(err.message || '오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* 헤더 */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            지사 설문조사
                        </h1>
                        <p className="text-gray-600">
                            {isLogin ? '로그인하여 시작하세요' : '새 계정을 만드세요'}
                        </p>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* 폼 */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                이메일
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                비밀번호
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg
                       hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                        >
                            {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
                        </button>
                    </form>

                    {/* 모드 전환 */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                        </button>
                    </div>
                </div>

                {/* 안내 메시지 */}
                <div className="mt-4 text-center text-white text-sm bg-black bg-opacity-20 rounded-lg p-3">
                    <p>💡 관리자 권한은 Firestore에서 수동으로 설정해야 합니다.</p>
                </div>
            </div>
        </div>
    );
}
