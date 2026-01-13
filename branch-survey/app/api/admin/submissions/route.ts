import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { Submission } from '@/types';

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

        return NextResponse.json({ submissions });
    } catch (error) {
        console.error('제출 목록 조회 실패:', error);
        return NextResponse.json(
            { error: '제출 목록을 가져올 수 없습니다.' },
            { status: 500 }
        );
    }
}
