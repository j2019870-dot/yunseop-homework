# 🔧 Cloud Run 컨테이너 빌드 문제 해결

## 문제: 컨테이너가 안 만들어짐

### ✅ 해결 방법들

## 방법 1: 필요한 GCP API 활성화

Cloud Run 빌드에 필요한 API들을 활성화해야 합니다:

```powershell
# 필수 API 활성화 (gcloud CLI 사용)
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

또는 **GCP Console에서 활성화**:
- https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=symmetric-index-482009-v8
- https://console.cloud.google.com/apis/library/run.googleapis.com?project=symmetric-index-482009-v8
- https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=symmetric-index-482009-v8

각 페이지에서 "API 사용 설정" 클릭

---

## 방법 2: 간단한 Dockerfile로 수정 (Node.js 직접 실행)

현재 Dockerfile이 복잡할 수 있으니 더 간단한 버전으로 시도:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 복사
COPY . .

# 빌드
RUN npm run build

# 포트 설정
ENV PORT=8080
EXPOSE 8080

# 실행
CMD ["npm", "start"]
```

---

## 방법 3: Cloud Build로 수동 빌드 후 배포

### 3-1. 먼저 이미지만 빌드

```powershell
cd c:\Users\j2019\OneDrive\Desktop\숙제\branch-survey

# 이미지 빌드 (Cloud Build 사용)
gcloud builds submit --tag gcr.io/symmetric-index-482009-v8/branch-survey
```

### 3-2. 빌드된 이미지를 Cloud Run에 배포

```powershell
gcloud run deploy branch-survey \
  --image gcr.io/symmetric-index-482009-v8/branch-survey \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --platform managed
```

---

## 방법 4: GitHub Actions로 자동 배포

프로젝트에 GitHub Actions 워크플로우 추가:

`.github/workflows/deploy.yml` 생성 (자동으로 만들어드릴게요!)

---

## 방법 5: Cloud Run Console에서 직접 배포

**가장 간단한 방법:**

1. **Cloud Run 콘솔 열기**
   - https://console.cloud.google.com/run?project=symmetric-index-482009-v8

2. **서비스 만들기**
   - "서비스 만들기" 클릭
   - "소스 리포지토리에서 지속적으로 배포" 선택
   
3. **Cloud Build 설정**
   - "CLOUD BUILD로 설정" 클릭
   - 리포지토리 공급자: GitHub
   - 리포지토리: `j2019870-dot/yunseop-homework`
   - 브랜치: `^main$`
   - 빌드 유형: Dockerfile
   - Dockerfile 위치: `/branch-survey/Dockerfile`

4. **서비스 설정**
   - 리전: `asia-northeast3`
   - 인증: 인증되지 않은 호출 허용
   
5. **환경변수 (나중에 추가 가능)**
   - Firebase 설정은 배포 후 추가

---

## 💡 에러 확인 방법

빌드 로그 확인:
- https://console.cloud.google.com/cloud-build/builds?project=symmetric-index-482009-v8

어떤 에러가 나오는지 확인하고 알려주세요!

---

## 🎯 추천 순서

1. **API 활성화** (방법 1)
2. **Cloud Run Console에서 배포** (방법 5)
3. 안되면 **간단한 Dockerfile** (방법 2)
4. 그래도 안되면 에러 로그 확인

어떤 방법을 시도해보시겠어요?
