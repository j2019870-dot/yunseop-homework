import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { UserProfileResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        // Authorization 헤더에서 토큰 추출
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: '인증 토큰이 필요합니다.' },
                { status: 401 }
            );
        }

        const token = authHeader.split('Bearer ')[1];

        // 토큰 검증
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        // Firestore에서 사용자 정보 조회
        const userDoc = await adminDb.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            // 사용자 문서가 없으면 기본값으로 생성
            const userEmail = decodedToken.email || '';
            const defaultUser = {
                email: userEmail,
                role: 'user' as const,
                branchName: '',
                displayName: decodedToken.name || '',
            };

            await adminDb.collection('users').doc(uid).set(defaultUser);

            const response: UserProfileResponse = {
                uid,
                ...defaultUser,
            };

            return NextResponse.json(response);
        }

        const userData = userDoc.data();
        const response: UserProfileResponse = {
            uid,
            email: userData?.email || '',
            role: userData?.role || 'user',
            branchName: userData?.branchName || '',
            displayName: userData?.displayName || '',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('사용자 프로필 조회 실패:', error);
        return NextResponse.json(
            { error: '사용자 정보를 가져올 수 없습니다.' },
            { status: 500 }
        );
    }
}
