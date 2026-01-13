# 🚀 빠른 시작 가이드

이 프로젝트는 **바로 사용 가능한** GCP 설문조사 시스템입니다.

## ⚡ 5단계로 시작하기

### 1️⃣ Node.js 설치 (아직 없다면)
- [nodejs.org](https://nodejs.org)에서 v20 이상 다운로드
- 설치 후 터미널에서 확인: `node --version`

### 2️⃣ Firebase 프로젝트 생성 (5분)
1. [console.firebase.google.com](https://console.firebase.google.com) 접속
2. "프로젝트 추가" → 이름 입력
3. **Authentication** → "이메일/비밀번호" 활성화
4. **Firestore Database** → "데이터베이스 만들기" (asia-northeast3)
5. **프로젝트 설정** → 서비스 계정 → "새 비공개 키 생성" → JSON 다운로드

### 3️⃣ 프로젝트 설정
```bash
cd c:\Users\j2019\OneDrive\Desktop\숙제\branch-survey

# 의존성 설치
npm install

# .env.local 파일 생성 (Firebase 설정 입력)
# .env.local.example 파일을 복사하여 실제 값 입력
```

### 4️⃣ Firebase 초기화
```bash
# 환경변수 설정 후
npm run seed:questions
```

### 5️⃣ 실행!
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 열기

## 📖 자세한 가이드
전체 문서는 [README.md](./README.md) 참조

## 🎯 기능 체크리스트
- ✅ 사용자/관리자 구분 로그인
- ✅ 챗봇 스타일 설문 (Enter 키로 진행)
- ✅ 개인 엑셀 다운로드 ({지사명}_{번호}.xlsx)
- ✅ 관리자 전체 데이터 테이블
- ✅ 관리자 전체 엑셀 내보내기
- ✅ Cloud Run 배포 준비 완료

## ❓ 문제 해결
**Node.js 설치 안됨?** → [nodejs.org](https://nodejs.org)에서 다운로드
**Firebase 설정?** → README.md의 "Firebase 프로젝트 설정" 섹션 참조
**관리자 권한?** → Firestore에서 users/{uid} 문서의 role을 "admin"으로 변경
