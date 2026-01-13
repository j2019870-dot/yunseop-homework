# 🎯 지사 설문조사 시스템

GCP 기반 설문조사 관리 웹 애플리케이션입니다. Next.js, Firebase, Cloud Run을 사용하여 구축되었습니다.

## ✨ 주요 기능

### 사용자 기능
- ✅ 챗봇 스타일 설문 인터페이스
- ✅ Enter 키로 질문 진행
- ✅ 자동 엑셀 다운로드 (`{지사명}_{제출번호}.xlsx`)
- ✅ 제출 완료 알림

### 관리자 기능
- ✅ 전체 응답 테이블 뷰
- ✅ 전체 데이터 엑셀 다운로드
- ✅ 실시간 데이터 새로고침

## 🚀 빠른 시작

### 1. Firebase 프로젝트 설정

#### 1.1 Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: `branch-survey`)
4. Google Analytics 설정 (선택사항)

#### 1.2 Authentication 활성화
1. Firebase Console → Authentication → 시작하기
2. "Sign-in method" 탭
3. "이메일/비밀번호" 활성화

#### 1.3 Firestore 데이터베이스 생성
1. Firebase Console → Firestore Database → 데이터베이스 만들기
2. "프로덕션 모드로 시작" 선택
3. 위치 선택: `asia-northeast3` (서울) 권장

#### 1.4 Firebase 설정 파일 다운로드

**웹 앱 설정 (클라이언트용)**
1. 프로젝트 설정 → 일반 → 앱 추가 → 웹
2. 앱 등록 후 Firebase SDK 구성 정보 복사

**서비스 계정 (서버용)**
1. 프로젝트 설정 → 서비스 계정
2. "새 비공개 키 생성" 클릭
3. JSON 파일 다운로드 → `service-account.json`으로 저장

### 2. 로컬 개발 환경 설정

```bash
# 프로젝트 디렉토리로 이동
cd branch-survey

# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
```

#### 2.1 `.env.local` 파일 수정

```bash
# Firebase 클라이언트 설정 (Firebase Console에서 복사)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin SDK
# 방법 1: JSON 파일을 문자열로 변환 (추천)
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...전체 내용..."}'

# 방법 2: 파일 경로 사용 (로컬 개발용)
# GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

#### 2.2 기본 질문 데이터 생성

```bash
npm run seed:questions
```

성공 메시지:
```
✅ 기본 질문이 성공적으로 생성되었습니다!
총 3개의 질문:
  - 어느 지사입니까?
  - 담당 팀/파트는 무엇입니까?
  - 이번 응답의 목적(간단히)을 적어주세요.
```

#### 2.3 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 3. 첫 관리자 계정 생성

#### 3.1 회원가입
1. 로그인 페이지에서 "회원가입" 클릭
2. 이메일/비밀번호 입력 후 가입

#### 3.2 관리자 권한 부여
Firebase Console에서 수동 설정:

1. Firestore Database → `users` 컬렉션
2. 방금 가입한 사용자 문서 클릭
3. `role` 필드를 `"user"`에서 `"admin"`으로 변경
4. 저장

#### 3.3 관리자로 재로그인
- 로그아웃 후 다시 로그인하면 관리자 대시보드로 이동

## 📦 Google Cloud Run 배포

### 방법 1: gcloud CLI 사용 (권장)

#### 1. gcloud 설치 및 인증
```bash
# gcloud CLI 설치 (https://cloud.google.com/sdk/docs/install)

# 로그인
gcloud auth login

# 프로젝트 설정
gcloud config set project YOUR_PROJECT_ID
```

#### 2. Secret Manager에 서비스 계정 등록
```bash
# Secret 생성
gcloud secrets create firebase-service-account \
  --data-file=service-account.json \
  --replication-policy=automatic

# Secret 확인
gcloud secrets describe firebase-service-account
```

#### 3. Cloud Run 배포
```bash
# 환경변수 준비 (실제 값으로 교체)
export FIREBASE_API_KEY="your-api-key"
export FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
export FIREBASE_MESSAGING_SENDER_ID="123456789"
export FIREBASE_APP_ID="1:123456789:web:abc123"

# 배포
gcloud run deploy branch-survey \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID,NEXT_PUBLIC_FIREBASE_APP_ID=$FIREBASE_APP_ID \
  --update-secrets FIREBASE_SERVICE_ACCOUNT_JSON=firebase-service-account:latest
```

#### 4. 배포 확인
배포 완료 후 표시되는 URL로 접속하여 테스트

### 방법 2: Dockerfile 사용

```bash
# 이미지 빌드
docker build -t branch-survey .

# Cloud Run에 푸시
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/branch-survey

# 배포
gcloud run deploy branch-survey \
  --image gcr.io/YOUR_PROJECT_ID/branch-survey \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --set-env-vars ... \
  --update-secrets ...
```

## 📖 사용 방법

### 일반 사용자 워크플로우

1. **로그인**: 이메일/비밀번호로 로그인
2. **설문 응답**: 
   - 질문이 하나씩 채팅처럼 나타남
   - 답변 입력 후 Enter 키
   - 모든 질문 완료 후 "작성완료 및 제출" 버튼
3. **엑셀 다운로드**: 자동으로 `{지사명}_{번호}.xlsx` 파일 다운로드
4. **제출 완료**: "제출되었습니다." 메시지 확인

### 관리자 워크플로우

1. **로그인**: 관리자 계정으로 로그인
2. **대시보드**: 전체 응답 테이블 확인
3. **엑셀 다운로드**: 우측 상단 "엑셀 다운로드" 버튼
4. **새로고침**: 최신 데이터 확인

## 🔧 커스터마이징

### 질문 수정하기

Firestore Console 또는 스크립트 수정:

```typescript
// scripts/seed-questions.ts
const defaultQuestions = [
  { id: 'q1', text: '새로운 질문 1?', required: true },
  { id: 'q2', text: '새로운 질문 2?', required: true },
  // ... 추가 질문
];
```

실행:
```bash
npm run seed:questions
```

### 스타일 변경하기

- `app/globals.css`: 전역 스타일
- `tailwind.config.js`: Tailwind 설정
- 각 컴포넌트 파일: 인라인 Tailwind 클래스

## 🛠 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS
- **Backend**: Next.js API Routes, Firebase Admin SDK
- **Database**: Cloud Firestore
- **Authentication**: Firebase Authentication
- **Deployment**: Google Cloud Run
- **Excel**: SheetJS (xlsx)

## 📁 프로젝트 구조

```
branch-survey/
├── app/
│   ├── api/              # API 라우트
│   ├── login/            # 로그인 페이지
│   ├── user/             # 사용자 설문 페이지
│   ├── admin/            # 관리자 대시보드
│   ├── layout.tsx        # 루트 레이아웃
│   └── globals.css       # 전역 스타일
├── components/           # React 컴포넌트
├── lib/                  # 유틸리티 함수
├── scripts/              # 초기화 스크립트
├── types/                # TypeScript 타입
├── Dockerfile            # Docker 설정
└── package.json          # 의존성
```

## 🐛 문제 해결

### "인증 토큰이 필요합니다" 오류
- 브라우저 쿠키/캐시 삭제 후 재로그인
- `.env.local` 파일 확인

### "관리자 권한이 필요합니다" 오류
- Firestore에서 사용자 역할 확인
- `users/{uid}` 문서의 `role` 필드가 `"admin"`인지 확인

### 질문이 표시되지 않음
- `npm run seed:questions` 실행 확인
- Firestore `questions/default` 문서 확인

### Cloud Run 배포 실패
- 환경변수 설정 확인
- Secret Manager 권한 확인
- 빌드 로그 확인: `gcloud builds list`

## 📝 라이선스

이 프로젝트는 교육용으로 제작되었습니다.

## 💡 추가 개선 아이디어

- [ ] 질문 동적 추가/수정 UI
- [ ] 응답 통계 대시보드
- [ ] 파일 첨부 기능
- [ ] 이메일 알림
- [ ] 다국어 지원
- [ ] 테마 커스터마이징

---

**문의사항이 있으시면 이슈를 등록해주세요!** 🚀
