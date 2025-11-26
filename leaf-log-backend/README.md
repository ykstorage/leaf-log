# Leaf Log Backend

NestJS 기반 식물 관리 및 커뮤니티 백엔드 API

## 기술 스택

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL + Prisma ORM 5.22
- **Authentication**: JWT + Passport (Email/Password + Social Login)
- **File Upload**: AWS S3 (Presigned URLs)
- **Deployment**: AWS Lambda (Serverless)

## 시작하기

### 사전 요구사항

- Node.js v24+ (nvm 권장)
- PostgreSQL (Docker 또는 로컬)
- AWS 계정 (S3 업로드용, 로컬 개발 시 LocalStack 가능)

### 설치 및 실행

```bash
# Node.js 버전 설정
nvm use

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일 수정 필요

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 동기화
npx prisma db push

# 개발 서버 실행
npm run start:dev
```

서버가 http://localhost:3000 에서 실행됩니다.

## 환경 변수

`.env` 파일에 다음 변수들을 설정하세요:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leaf_log"

# Application
NODE_ENV=development
PORT=3000

# AWS S3
AWS_REGION=ap-northeast-2
AWS_ENDPOINT=http://localhost:4566  # LocalStack용 (선택사항)
S3_BUCKET=leaf-log-images-local

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Google OAuth (선택사항)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Kakao OAuth (선택사항)
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_CALLBACK_URL=http://localhost:3000/auth/kakao/callback
```

## 주요 스크립트

```bash
# 개발 서버 (hot reload)
npm run start:dev

# 빌드
npm run build

# 프로덕션 실행
npm run start:prod

# 테스트
npm test

# Lambda 빌드 (AWS 배포용)
npm run build:lambda

# Prisma 관련
npx prisma generate        # 클라이언트 생성
npx prisma db push         # 스키마 동기화 (개발)
npx prisma studio          # DB GUI 실행
```

## API 엔드포인트

### 인증
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인
- `GET /auth/me` - 현재 사용자 정보

### 식물
- `POST /plants` - 식물 추가
- `GET /plants` - 내 식물 목록
- `GET /plants/:id` - 식물 상세 조회
- `PUT /plants/:id` - 식물 수정
- `DELETE /plants/:id` - 식물 삭제

### 게시판
- `POST /posts` - 게시글 작성
- `GET /posts` - 게시글 목록 (pagination, search)
- `GET /posts/:id` - 게시글 상세
- `POST /posts/:postId/like` - 좋아요 토글

자세한 API 문서는 서버 실행 후 `/api` 경로를 참조하세요.

## 라이선스

MIT
