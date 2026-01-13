# Cloud Run 배포 가이드

## 🚀 배포 방법

현재 gcloud CLI가 PATH에 설정되지 않았습니다. 다음 방법 중 하나를 선택하세요.

### 방법 1: gcloud CLI 설치 (추천)

1. **다운로드 및 설치**
   - https://cloud.google.com/sdk/docs/install-sdk#windows
   - GoogleCloudSDKInstaller.exe 실행

2. **설치 후 새 PowerShell 창 열기**
   ```powershell
   # 확인
   gcloud version
   
   # 로그인 및 프로젝트 설정
   gcloud auth login
   gcloud config set project symmetric-index-482009-v8
   ```

3. **Secret Manager 설정**
   ```powershell
   cd c:\Users\j2019\OneDrive\Desktop\숙제\branch-survey
   
   # API 활성화
   gcloud services enable secretmanager.googleapis.com
   gcloud services enable run.googleapis.com
   
   # Secret 생성
   gcloud secrets create firebase-service-account `
     --data-file=symmetric-index-482009-v8-firebase-adminsdk-fbsvc-d22053182c.json
   ```

4. **Cloud Run 배포**
   ```powershell
   gcloud run deploy branch-survey `
     --source . `
     --region asia-northeast3 `
     --allow-unauthenticated `
     --project symmetric-index-482009-v8 `
     --update-secrets FIREBASE_SERVICE_ACCOUNT_JSON=firebase-service-account:latest
   ```

### 방법 2: GCP Console에서 수동 배포

1. **Cloud Run 콘솔 접속**
   - https://console.cloud.google.com/run?project=symmetric-index-482009-v8

2. **서비스 만들기**
   - https://console.cloud.google.com/run?project=symmetric-index-482009-v8
   - "서비스 만들기" 클릭
   - "GitHub에서 지속적으로 배포" 선택
   - 리포지토리: `j2019870-dot/yunseop-homework`
   - 브랜치: `main`
   - 빌드 유형: Dockerfile

3. **환경 변수 설정**
   - Firebase 클라이언트 설정 (NEXT_PUBLIC_*)
   - Secret 추가: FIREBASE_SERVICE_ACCOUNT_JSON

### 방법 3: 로컬 테스트 먼저

```powershell
cd c:\Users\j2019\OneDrive\Desktop\숙제\branch-survey

# Node.js 설치 확인
node --version

# 의존성 설치
npm install

# Firebase 설정 (.env.local 생성)
# .env.local.example 복사하여 실제 값 입력

# 개발 서버 실행
npm run dev
```

브라우저: http://localhost:3000

## 📝 필요한 Firebase 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

FIREBASE_SERVICE_ACCOUNT_JSON='파일 내용 전체를 여기에 붙여넣기'
```
