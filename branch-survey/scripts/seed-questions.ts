import * as admin from 'firebase-admin';

// Firebase Admin 초기화
if (!admin.apps.length) {
    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

        if (serviceAccountJson) {
            const serviceAccount = JSON.parse(serviceAccountJson);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        }
    } catch (error) {
        console.error('Firebase Admin 초기화 실패:', error);
        process.exit(1);
    }
}

const db = admin.firestore();

async function seedQuestions() {
    try {
        const defaultQuestions = [
            {
                id: 'q1',
                text: '어느 지사입니까?',
                required: true,
            },
            {
                id: 'q2',
                text: '담당 팀/파트는 무엇입니까?',
                required: true,
            },
            {
                id: 'q3',
                text: '이번 응답의 목적(간단히)을 적어주세요.',
                required: true,
            },
        ];

        await db.collection('questions').doc('default').set({
            items: defaultQuestions,
            createdAt: new Date().toISOString(),
        });

        console.log('✅ 기본 질문이 성공적으로 생성되었습니다!');
        console.log(`총 ${defaultQuestions.length}개의 질문:`);
        defaultQuestions.forEach((q) => {
            console.log(`  - ${q.text}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ 질문 생성 실패:', error);
        process.exit(1);
    }
}

seedQuestions();
