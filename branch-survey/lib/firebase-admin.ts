import * as admin from 'firebase-admin';

let adminApp: admin.app.App;

function initializeFirebaseAdmin() {
    if (adminApp) {
        return adminApp;
    }

    try {
        // FIREBASE_SERVICE_ACCOUNT_JSON 환경변수에서 서비스 계정 정보 읽기
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

        if (serviceAccountJson) {
            // JSON 문자열을 파싱
            const serviceAccount = JSON.parse(serviceAccountJson);

            adminApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else {
            // Application Default Credentials 사용 (로컬 개발용)
            adminApp = admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        }
    } catch (error) {
        console.error('Firebase Admin 초기화 실패:', error);
        throw error;
    }

    return adminApp;
}

// Admin SDK 초기화
if (!admin.apps.length) {
    initializeFirebaseAdmin();
} else {
    adminApp = admin.apps[0];
}

// Firestore와 Auth 인스턴스 export
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export { admin };
