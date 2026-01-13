import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { generateAdminExcel } from '@/lib/excel';
import { Submission, Question } from '@/types';

export async function GET(request: NextRequest) {
    try {
        // 인증 확인
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: '인증 토큰이 필요합니다.' },
                { status: 401 }
            );
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        // 관리자 권한 확인
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();

        if (userData?.role !== 'admin') {
            return NextResponse.json(
                { error: '관리자 권한이 필요합니다.' },
                { status: 403 }
            );
        }

        // 모든 제출 데이터 가져오기
        const submissionsSnapshot = await adminDb
            .collection('submissions')
            .orderBy('createdAt', 'desc')
            .get();

        const submissions: Submission[] = submissionsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                uid: data.uid,
                branchName: data.branchName,
                answers: data.answers,
                submissionNo: data.submissionNo,
                createdAt: data.createdAt,
            };
        });

        // 질문 목록 가져오기
        const questionsDoc = await adminDb.collection('questions').doc('default').get();
        const questions: Question[] = questionsDoc.data()?.items || [];

        // 엑셀 파일 생성
        const excelBuffer = generateAdminExcel(submissions, questions);

        // 파일명에 현재 일시 포함
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const filename = `전체응답_${dateStr}.xlsx`;

        // 엑셀 파일을 응답으로 반환
        return new NextResponse(excelBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
            },
        });
    } catch (error) {
        console.error('엑셀 내보내기 실패:', error);
        return NextResponse.json(
            { error: '엑셀 파일 생성에 실패했습니다.' },
            { status: 500 }
        );
    }
}
