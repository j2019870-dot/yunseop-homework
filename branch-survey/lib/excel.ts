import * as XLSX from 'xlsx';
import { Question, Answers, Submission } from '@/types';

/**
 * 사용자 답변을 엑셀 파일로 변환
 */
export function generateUserExcel(
    questions: Question[],
    answers: Answers,
    branchName: string,
    submissionNo: number
): Buffer {
    // 헤더 행 생성
    const headers = ['지사명', '제출번호', ...questions.map(q => q.text)];

    // 데이터 행 생성
    const dataRow = [
        branchName,
        submissionNo,
        ...questions.map(q => answers[q.id] || '')
    ];

    // 워크시트 데이터
    const wsData = [headers, dataRow];

    // 워크북 생성
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '설문 응답');

    // 컬럼 너비 자동 조정
    const colWidths = headers.map((header, i) => {
        const maxLength = Math.max(
            header.length,
            String(dataRow[i] || '').length
        );
        return { wch: Math.min(maxLength + 2, 50) };
    });
    ws['!cols'] = colWidths;

    // 버퍼로 변환
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * 전체 제출 데이터를 엑셀 파일로 변환 (관리자용)
 */
export function generateAdminExcel(
    submissions: Submission[],
    questions: Question[]
): Buffer {
    // 헤더 행
    const headers = [
        '제출 일시',
        '지사명',
        '제출번호',
        ...questions.map(q => q.text)
    ];

    // 데이터 행들
    const dataRows = submissions.map(sub => [
        new Date(sub.createdAt).toLocaleString('ko-KR'),
        sub.branchName,
        sub.submissionNo,
        ...questions.map(q => sub.answers[q.id] || '')
    ]);

    // 워크시트 데이터
    const wsData = [headers, ...dataRows];

    // 워크북 생성
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '전체 응답');

    // 컬럼 너비 자동 조정
    const colWidths = headers.map((header, i) => {
        const columnData = wsData.map(row => row[i]);
        const maxLength = Math.max(
            ...columnData.map(cell => String(cell || '').length)
        );
        return { wch: Math.min(maxLength + 2, 50) };
    });
    ws['!cols'] = colWidths;

    // 버퍼로 변환
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
