import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { generateUserExcel } from '@/lib/excel';
import { Answers, Question } from '@/types';

export async function POST(request: NextRequest) {
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
        const uid = decodedToken.uid;

        // 요청 바디 파싱
        const body = await request.json();
        const { answers, branchName: providedBranchName } = body as {
            answers: Answers;
            branchName?: string;
        };

        // 지사명 결정 (첫 번째 질문의 답변 또는 제공된 값)
        const branchName = providedBranchName || answers['q1'] || '미지정';

        // 트랜잭션으로 제출번호 생성 및 제출 저장
        const submissionRef = adminDb.collection('submissions').doc();
        const counterRef = adminDb.collection('branchCounters').doc(branchName);

        let submissionNo = 1;

        await adminDb.runTransaction(async (transaction) => {
            const counterDoc = await transaction.get(counterRef);

            if (counterDoc.exists) {
                const currentCount = counterDoc.data()?.count || 0;
                submissionNo = currentCount + 1;
                transaction.update(counterRef, { count: submissionNo });
            } else {
                transaction.set(counterRef, { count: 1 });
                submissionNo = 1;
            }

            // 제출 데이터 저장
            transaction.set(submissionRef, {
                uid,
                branchName,
                answers,
                submissionNo,
                createdAt: new Date().toISOString(),
            });
        });

        // 질문 목록 가져오기
        const questionsDoc = await adminDb.collection('questions').doc('default').get();
        const questions: Question[] = questionsDoc.data()?.items || [];

        // 엑셀 파일 생성
        const excelBuffer = generateUserExcel(questions, answers, branchName, submissionNo);

        // 파일명 생성
        const filename = `${branchName}_${submissionNo}.xlsx`;

        // 엑셀 파일을 응답으로 반환
        return new NextResponse(new Uint8Array(excelBuffer), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
            },
        });
    } catch (error) {
        console.error('제출 처리 실패:', error);
        return NextResponse.json(
            { error: '제출 처리에 실패했습니다.' },
            { status: 500 }
        );
    }
}
