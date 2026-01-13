'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getAuthHeaders } from '@/lib/auth';
import { Question, Submission } from '@/types';
import AdminTable from '@/components/AdminTable';

export default function AdminPage() {
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        checkAdminAndLoadData();
    }, []);

    const checkAdminAndLoadData = async () => {
        try {
            const headers = await getAuthHeaders();

            // 사용자 프로필 확인
            const meResponse = await fetch('/api/me', { headers });
            if (!meResponse.ok) {
                throw new Error('인증 실패');
            }

            const userData = await meResponse.json();
            if (userData.role !== 'admin') {
                alert('관리자 권한이 필요합니다.');
                router.push('/login');
                return;
            }

            // 질문 목록 로드
            const questionsResponse = await fetch('/api/questions', { headers });
            if (questionsResponse.ok) {
                const questionsData = await questionsResponse.json();
                setQuestions(questionsData.questions);
            }

            // 제출 데이터 로드
            const submissionsResponse = await fetch('/api/admin/submissions', { headers });
            if (submissionsResponse.ok) {
                const submissionsData = await submissionsResponse.json();
                setSubmissions(submissionsData.submissions);
            }

            setLoading(false);
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            alert('데이터를 불러올 수 없습니다.');
            router.push('/login');
        }
    };

    const handleExport = async () => {
        setExporting(true);

        try {
            const headers = await getAuthHeaders();
            const response = await fetch('/api/admin/export', {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error('엑셀 내보내기 실패');
            }

            // 엑셀 파일 다운로드
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            const filenameMatch = contentDisposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            const filename = filenameMatch
                ? decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''))
                : 'all_submissions.xlsx';

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('엑셀 내보내기 실패:', error);
            alert('엑셀 파일 다운로드에 실패했습니다.');
        } finally {
            setExporting(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600">데이터 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* 헤더 */}
            <div className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">관리자 대시보드</h1>
                        <p className="text-sm text-gray-600 mt-1">전체 설문 응답 관리</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            disabled={exporting || submissions.length === 0}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
                       text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all flex items-center gap-2"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            {exporting ? '다운로드 중...' : '엑셀 다운로드'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">전체 응답 목록</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                총 <span className="font-bold text-blue-600">{submissions.length}</span>개의 응답
                            </p>
                        </div>
                        <button
                            onClick={checkAdminAndLoadData}
                            className="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
                        >
                            새로고침
                        </button>
                    </div>

                    <AdminTable submissions={submissions} questions={questions} />
                </div>
            </div>
        </div>
    );
}
