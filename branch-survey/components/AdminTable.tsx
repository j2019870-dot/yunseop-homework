'use client';

import { Question, Submission } from '@/types';

interface AdminTableProps {
    submissions: Submission[];
    questions: Question[];
}

export default function AdminTable({ submissions, questions }: AdminTableProps) {
    return (
        <div className="w-full overflow-x-auto bg-white rounded-lg shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 sticky top-0">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            제출 일시
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            지사명
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            제출번호
                        </th>
                        {questions.map((q) => (
                            <th
                                key={q.id}
                                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[200px]"
                            >
                                {q.text}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((sub, idx) => (
                        <tr
                            key={sub.id}
                            className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                } hover:bg-blue-50 transition-colors`}
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(sub.createdAt).toLocaleString('ko-KR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {sub.branchName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {sub.submissionNo}
                            </td>
                            {questions.map((q) => (
                                <td
                                    key={q.id}
                                    className="px-6 py-4 text-sm text-gray-700"
                                >
                                    {sub.answers[q.id] || '-'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {submissions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    제출된 응답이 없습니다.
                </div>
            )}
        </div>
    );
}
