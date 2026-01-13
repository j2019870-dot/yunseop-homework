import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { Question } from '@/types';

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
        await adminAuth.verifyIdToken(token);

        // Firestore에서 질문 목록 가져오기
        const questionsDoc = await adminDb.collection('questions').doc('default').get();

        if (!questionsDoc.exists) {
            // 기본 질문이 없으면 빈 배열 반환
            return NextResponse.json({ questions: [] });
        }

        const data = questionsDoc.data();
        const questions: Question[] = data?.items || [];

        return NextResponse.json({ questions });
    } catch (error) {
        console.error('질문 목록 조회 실패:', error);
        return NextResponse.json(
            { error: '질문 목록을 가져올 수 없습니다.' },
            { status: 500 }
        );
    }
}
