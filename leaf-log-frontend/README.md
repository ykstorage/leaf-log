# Leaf Log Frontend

Vue 3 기반 식물 관리 및 커뮤니티 PWA 프론트엔드

## 기술 스택

- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Build Tool**: Vite 7.x
- **Language**: TypeScript
- **Router**: Vue Router 4
- **State Management**: Pinia
- **HTTP Client**: Axios
- **UI**: Custom CSS (반응형 그리드 레이아웃)
- **PWA**: vite-plugin-pwa
- **Date**: dayjs (한국어 locale)

## 시작하기

### 사전 요구사항

- Node.js v24+ (nvm 권장)
- Backend API 서버 실행 중 (http://localhost:3000)

### 설치 및 실행

```bash
# Node.js 버전 설정
nvm use

# 의존성 설치
npm install

# 환경 변수 설정
echo "VITE_API_URL=http://localhost:3000" > .env.local

# 개발 서버 실행
npm run dev
```

앱이 http://localhost:5173 에서 실행됩니다.

## 환경 변수

`.env.local` 파일에 다음 변수를 설정하세요:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000
```

## 주요 스크립트

```bash
# 개발 서버 (hot reload)
npm run dev

# 타입 체크
npm run type-check

# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 린트
npm run lint
```

## 프로젝트 구조

```
src/
├── main.ts                 # 앱 진입점
├── App.vue                 # 루트 컴포넌트
├── router/                 # Vue Router 설정
│   └── index.ts
├── stores/                 # Pinia stores
│   └── auth.ts             # 인증 상태 관리
├── views/                  # 페이지 컴포넌트
│   ├── PlantList.vue       # 식물 목록
│   ├── PlantDetail.vue     # 식물 상세
│   ├── Login.vue           # 로그인
│   ├── Register.vue        # 회원가입
│   ├── BoardList.vue       # 게시판 목록
│   └── PostDetail.vue      # 게시글 상세
├── components/             # 재사용 컴포넌트
├── composables/            # Composition API hooks
│   ├── useAuth.ts          # 인증 관련
│   ├── useImageUpload.ts   # 이미지 업로드
│   └── usePosts.ts         # 게시글 관련
├── api/                    # API 클라이언트
│   ├── config.ts           # Axios 설정
│   ├── auth.ts             # 인증 API
│   ├── plants.ts           # 식물 API
│   └── posts.ts            # 게시판 API
├── types/                  # TypeScript 타입 정의
│   └── index.ts
└── assets/                 # 정적 파일
```

## 주요 기능

### 인증
- 이메일/비밀번호 로그인
- 소셜 로그인 (Google, Kakao)
- 회원가입 (닉네임, 프로필 이미지, 자기소개)
- 프로필 관리

### 식물 관리
- 식물 등록 (이미지 업로드)
- 식물 목록 조회
- 식물 상세 정보
- 관리 기록 (물주기, 비료, 분갈이, 가지치기)

### 커뮤니티 게시판
- 게시글 작성 (여러 이미지 첨부 가능)
- 게시글 목록 (검색, 페이지네이션)
- 게시글 상세 조회
- 좋아요 기능 (토글 + 카운트)

### PWA
- 오프라인 지원
- 홈 화면에 추가 가능
- 푸시 알림 (예정)

## 개발 가이드

### 새로운 페이지 추가

1. `src/views/` 에 Vue 컴포넌트 생성
2. `src/router/index.ts` 에 라우트 추가
3. 필요시 Auth Guard 적용

### API 호출

```typescript
// src/api/ 폴더의 함수 사용
import { postsApi } from '@/api/posts'

const posts = await postsApi.getAll()
```

### 상태 관리

```typescript
// Pinia store 사용
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
authStore.login(email, password)
```

### 이미지 업로드

```typescript
// useImageUpload composable 사용
import { useImageUpload } from '@/composables/useImageUpload'

const { uploadImage, uploading } = useImageUpload()
const imageUrl = await uploadImage(file)
```

## 브라우저 지원

- Chrome (최신 2개 버전)
- Firefox (최신 2개 버전)
- Safari (최신 2개 버전)
- Edge (최신 2개 버전)

## 라이선스

MIT
