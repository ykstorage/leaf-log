# Leaf Log

식물 관리 및 커뮤니티 PWA (Progressive Web App)

식물을 키우는 사람들을 위한 관리 도구와 커뮤니티 플랫폼입니다. 물주기, 비료, 분갈이 등의 관리 기록을 추적하고, 다른 식물 애호가들과 경험을 공유할 수 있습니다.

## 주요 기능

### 식물 관리
- 내 식물 등록 및 관리
- 관리 기록 추적 (물주기, 비료, 분갈이, 가지치기)
- D-Day 표시로 마지막 관리일 확인
- 관리 간격 분석

### 커뮤니티 게시판
- 게시글 작성 (다중 이미지 첨부)
- 검색 및 페이지네이션
- 좋아요 기능

### 인증
- 이메일/비밀번호 로그인
- 소셜 로그인 지원 (Google, Kakao)
- JWT 기반 인증

### PWA
- 오프라인 지원
- 홈 화면에 추가 가능
- 푸시 알림 (예정)

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Vue 3, TypeScript, Vite, Pinia, Vue Router |
| **Backend** | NestJS, Prisma ORM, PostgreSQL |
| **인증** | JWT, Passport (Local + OAuth 2.0) |
| **파일 저장** | AWS S3 (Presigned URLs) |
| **배포** | AWS Lambda (Serverless) |

## 프로젝트 구조

```
leaf-log/
├── leaf-log-frontend/     # Vue 3 프론트엔드
├── leaf-log-backend/      # NestJS 백엔드
├── terraform/             # AWS 인프라 코드 (IaC)
└── README.md              # 이 파일
```

## 빠른 시작

### 사전 요구사항

- Node.js v24+ (nvm 권장)
- PostgreSQL (Docker 또는 로컬)
- AWS 계정 (S3 사용 시, 로컬 개발은 LocalStack 가능)

### 1. 저장소 클론

```bash
git clone https://github.com/ykstorage/leaf-log.git
cd leaf-log
```

### 2. 백엔드 설정 및 실행

```bash
cd leaf-log-backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 DATABASE_URL, JWT_SECRET 등 설정

# Prisma 클라이언트 생성 및 DB 동기화
npx prisma generate
npx prisma db push

# 개발 서버 실행
npm run start:dev
```

백엔드가 http://localhost:3000 에서 실행됩니다.

### 3. 프론트엔드 설정 및 실행

```bash
cd leaf-log-frontend

# 의존성 설치
npm install

# 환경 변수 설정
echo "VITE_API_URL=http://localhost:3000" > .env.local

# 개발 서버 실행
npm run dev
```

프론트엔드가 http://localhost:5173 에서 실행됩니다.

## 환경 변수

### Backend (.env)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leaf_log"
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
AWS_REGION=ap-northeast-2
S3_BUCKET=leaf-log-images
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:3000
```

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/auth/register` | 회원가입 |
| POST | `/auth/login` | 로그인 |
| GET | `/auth/me` | 현재 사용자 정보 |
| GET | `/plants` | 내 식물 목록 |
| POST | `/plants` | 식물 추가 |
| GET | `/plants/:id` | 식물 상세 |
| PUT | `/plants/:id` | 식물 수정 |
| DELETE | `/plants/:id` | 식물 삭제 |
| GET | `/posts` | 게시글 목록 |
| POST | `/posts` | 게시글 작성 |
| GET | `/posts/:id` | 게시글 상세 |
| POST | `/posts/:postId/like` | 좋아요 토글 |

## 세부 문서

- [Backend README](./leaf-log-backend/README.md) - 백엔드 상세 설정 및 API 문서
- [Frontend README](./leaf-log-frontend/README.md) - 프론트엔드 개발 가이드

## 라이선스

MIT
