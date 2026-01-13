import { auth } from './firebase';
import { User as FirebaseUser } from 'firebase/auth';

/**
 * 현재 로그인한 사용자의 ID 토큰 가져오기
 */
export async function getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        return await user.getIdToken();
    } catch (error) {
        console.error('토큰 가져오기 실패:', error);
        return null;
    }
}

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export function getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
}

/**
 * 인증 헤더 생성
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
    const token = await getIdToken();
    if (!token) {
        throw new Error('인증되지 않았습니다.');
    }

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}
