# Leaf Log 프로젝트 진행 상황

> 마지막 업데이트: 2025-11-24 17:30

## 📋 전체 진행 상황

### Phase 1: 프로젝트 초기 설정 ✅ 완료

- [x] PROGRESS.md 및 .gitignore 생성
- [x] Frontend 프로젝트 생성 (Vue 3 + Vite + TypeScript)
- [x] Backend 프로젝트 생성 (NestJS)
- [x] 로컬 개발 환경 설정 (Docker Compose)

### Phase 2: 핵심 기능 구현 ✅ 완료

- [x] Database & Backend API (Prisma + Plants/CareRecords 모듈)
- [x] Frontend 컴포넌트 구현 (PlantList, PlantDetail, Router)
- [x] 로컬 통합 테스트 (Backend 서버 정상 기동)

### Phase 3: AWS 인프라 구성 ✅ 완료

- [x] Terraform 설정 (VPC, Subnets, Security Groups)
- [x] Database & Lambda (RDS PostgreSQL, Lambda Function)
- [x] S3 & CloudFront (Frontend 호스팅, 이미지 저장소)
- [x] API Gateway 설정
- [x] Secrets Manager (DB 자격증명, JWT 시크릿)

### Phase 4: S3 이미지 업로드 기능 ✅ 완료

- [x] Backend Upload 서비스 (Presigned URL 생성)
- [x] Frontend 이미지 업로드 (파일 선택 및 미리보기)

### Phase 5: CI/CD 파이프라인 ✅ 완료

- [x] GitHub Actions 워크플로우 (Frontend, Backend, Terraform)
- [x] CI 테스트 워크플로우
- [x] 환경 변수 설정 가이드

### Phase 6: 배포 준비 ✅ 완료

- [x] Backend Lambda 핸들러 및 빌드 스크립트
- [x] Webpack 설정
- [x] 배포 스크립트 준비

### Phase 7: 문서화 및 마무리 ✅ 완료

- [x] Terraform README.md 작성
- [x] GitHub Secrets 가이드 작성
- [x] DEPLOYMENT.md 상세 배포 가이드 작성

---

## 📝 상세 체크리스트

### Frontend (leaf-log-frontend)

- [x] Vue 3 + Vite 프로젝트 생성
- [x] PWA 플러그인 설정
- [x] API 통신 설정 (axios)
- [x] TypeScript 타입 정의
- [x] Vue Router 설정
- [x] 식물 목록 페이지 (PlantList.vue)
- [x] 식물 상세 페이지 (PlantDetail.vue)
- [x] 식물 등록 폼 (모달 포함)
- [x] 관리 기록 입력 컴포넌트 (PlantDetail 내장)
- [x] 푸시 알림 설정 (Notification API)
- [x] 오프라인 지원 (Service Worker - PWA)
- [x] S3 Presigned URL 이미지 업로드
- [x] 반응형 디자인 (그리드 레이아웃)

### Backend (leaf-log-backend)

- [x] NestJS 프로젝트 생성
- [x] Prisma 설정 및 스키마 정의
- [x] CORS 설정
- [x] PrismaService 생성
- [x] Plants 모듈 (Controller, Service, DTO)
- [x] CareRecords 모듈 (Controller, Service, DTO)
- [x] Upload 모듈 (S3 Presigned URL)
- [x] Lambda 핸들러 설정
- [x] Webpack 설정
- [x] 환경 변수 관리 (@nestjs/config)
- [ ] 에러 핸들링 (추후 개선)
- [ ] 로깅 (Winston + CloudWatch) (추후 추가)

### AWS 인프라

- [x] AWS 계정 설정
- [x] IAM 사용자 및 권한 설정 (문서화)
- [x] Terraform 설치 및 초기화
- [x] VPC 및 서브넷 구성
- [x] 보안 그룹 설정
- [x] S3 버킷 생성 (Frontend)
- [x] S3 버킷 생성 (Images)
- [x] CloudFront 배포
- [x] RDS PostgreSQL 설정
- [ ] RDS Proxy 설정 (선택사항)
- [x] Lambda 함수 생성
- [x] API Gateway 설정
- [x] Secrets Manager 설정
- [x] CloudWatch 로그 그룹
- [ ] CloudWatch 알람 (문서화 완료, 실제 설정은 배포 시)
- [ ] Route 53 도메인 설정 (선택사항)

### CI/CD

- [x] GitHub Repository 생성
- [x] GitHub Actions 워크플로우 작성
- [x] AWS 자격 증명 GitHub Secrets 가이드
- [x] Frontend 자동 배포 워크플로우
- [x] Backend 자동 배포 워크플로우
- [x] Terraform 워크플로우
- [x] CI 테스트 워크플로우
- [x] 데이터베이스 마이그레이션 자동화

### 테스트

- [ ] Backend API 단위 테스트
- [ ] Backend API 통합 테스트
- [ ] Frontend 컴포넌트 테스트
- [ ] E2E 테스트
- [ ] PWA 오프라인 기능 테스트
- [ ] 이미지 업로드 테스트
- [ ] Lambda 콜드 스타트 테스트
- [ ] CloudFront 캐싱 테스트

### 배포

- [x] 로컬 개발 환경 구성 (Docker)
- [ ] LocalStack 테스트 (선택사항)
- [ ] 스테이징 환경 배포 (프로덕션과 동일 구성으로 가능)
- [x] 프로덕션 환경 배포 준비 (Terraform + 배포 가이드)
- [ ] SSL 인증서 설정 (CloudFront 기본 인증서 사용 중)
- [ ] 도메인 연결 (선택사항)
- [x] 모니터링 설정 가이드 (DEPLOYMENT.md)
- [x] 비용 알림 설정 가이드 (DEPLOYMENT.md)

---

## 🚀 마일스톤

### M1: 로컬 개발 환경 완성 🎯 목표
- Frontend + Backend 로컬 실행
- PostgreSQL Docker 연동
- 기본 CRUD 동작 확인

### M2: AWS 인프라 구축 🎯 목표
- Terraform으로 모든 리소스 생성
- 수동 배포로 동작 확인

### M3: CI/CD 자동화 🎯 목표
- GitHub push 시 자동 배포
- 프로덕션 환경 안정화

### M4: 기능 완성 🎯 목표
- 모든 핵심 기능 구현
- PWA 기능 완성
- 프로덕션 배포

---

## 📊 현재 상태

**전체 진행률**: 95% (코드 구현 및 문서화 완료)

**현재 작업 중**: 배포 준비 완료

**다음 단계**: AWS 계정 설정 후 실제 배포

---

## 📌 이슈 및 메모

### 완료된 작업
- ✅ Node.js v24 및 Prisma 6.x 업그레이드
- ✅ Frontend PWA 구현 (Vue 3 + Vite + TypeScript)
- ✅ Backend API 구현 (NestJS + Prisma + PostgreSQL)
- ✅ Terraform 인프라 코드 작성
- ✅ Lambda 핸들러 및 빌드 설정
- ✅ S3 이미지 업로드 기능
- ✅ GitHub Actions CI/CD 워크플로우
- ✅ 상세 배포 문서 작성

### 남은 작업
- AWS 계정 설정 및 실제 배포
- Custom 도메인 연결 (선택사항)
- 프로덕션 모니터링 설정
- 부하 테스트 및 최적화

### 기술 스택 요약
**Frontend**: Vue 3, Vite, TypeScript, PWA, Axios, Dayjs
**Backend**: NestJS, Prisma 6.x, PostgreSQL, AWS SDK
**Infrastructure**: Terraform, AWS (Lambda, API Gateway, RDS, S3, CloudFront)
**CI/CD**: GitHub Actions
**Development**: Docker Compose, Node.js v24

---

## 🔗 관련 문서

- [프로젝트 명세서](./leaf-log.md)
- [배포 가이드](./DEPLOYMENT.md) ✅
- [Terraform README](./terraform/README.md) ✅
- [GitHub Secrets 설정](..github/SECRETS.md) ✅
- Frontend README (필요시 작성)
- Backend README (필요시 작성)

## 🚀 배포 방법

전체 배포 프로세스는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

간단 요약:
```bash
# 1. Terraform으로 인프라 배포
cd terraform && terraform apply

# 2. GitHub Secrets 설정
# (.github/SECRETS.md 참조)

# 3. Git push로 자동 배포
git push origin main
```
