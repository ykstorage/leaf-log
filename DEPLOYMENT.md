# TEST

# Leaf Log 배포 가이드

이 문서는 Leaf Log 프로젝트를 AWS에 배포하는 전체 과정을 설명합니다.

## 목차

1. [사전 준비](#사전-준비)
2. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
3. [AWS 인프라 배포](#aws-인프라-배포)
4. [GitHub Actions 설정](#github-actions-설정)
5. [초기 배포](#초기-배포)
6. [배포 확인](#배포-확인)
7. [문제 해결](#문제-해결)

---

## 사전 준비

### 1. 필수 도구 설치

```bash
# Node.js v20+ (nvm 사용 권장)
nvm install 20
nvm use 20

# AWS CLI
# macOS
brew install awscli

# 설정
aws configure
# AWS Access Key ID: <your-key-id>
# AWS Secret Access Key: <your-secret-key>
# Default region: ap-northeast-2
# Default output format: json

# Terraform v1.0+
brew install terraform

# GitHub CLI (선택사항)
brew install gh
gh auth login
```

### 2. AWS 계정 설정

1. **IAM 사용자 생성** (프로그래매틱 액세스)

   - 권한: AdministratorAccess (초기 설정용)
   - Access Key ID와 Secret Access Key 저장

2. **비용 알림 설정** (권장)
   - Billing → Budgets
   - 월 $50 예산 설정 및 알림

---

## 로컬 개발 환경 설정

### 1. Repository 클론

```bash
git clone https://github.com/your-username/leaf-log.git
cd leaf-log
```

### 2. Backend 설정

```bash
cd leaf-log-backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집 (DATABASE_URL 등)

# Prisma 설정
npx prisma generate
npx prisma db push

# 개발 서버 실행
npm run start:dev
```

### 3. Frontend 설정

```bash
cd ../leaf-log-frontend

# 의존성 설치
npm install

# 환경 변수 설정
echo "VITE_API_URL=http://localhost:3000" > .env.local

# 개발 서버 실행
npm run dev
```

### 4. PostgreSQL 실행 (Docker)

```bash
cd ..
docker-compose up -d
```

---

## AWS 인프라 배포

### 1. Terraform 초기화

```bash
cd terraform
terraform init
```

### 2. 인프라 배포 계획 확인

```bash
terraform plan
```

예상 비용 확인:

- RDS PostgreSQL: ~$12/월
- NAT Gateway: ~$32/월
- S3 + Lambda: ~$2/월
- **총 예상 비용: ~$47/월**

### 3. 인프라 배포

```bash
terraform apply

# 'yes' 입력하여 확인
```

배포 시간: 약 10-15분

### 4. 출력값 저장

```bash
# 모든 출력값 확인
terraform output

# JSON 형식으로 저장
terraform output -json > ../outputs.json

# 중요 값들:
terraform output cloudfront_distribution_domain
terraform output api_gateway_url
terraform output frontend_bucket_name
terraform output lambda_function_name
```

---

## GitHub Actions 설정

### 1. GitHub Secrets 설정

Repository → Settings → Secrets and variables → Actions에서 다음 secrets 추가:

```bash
# Terraform 출력값에서 가져오기
AWS_ACCESS_KEY_ID: <your-aws-access-key>
AWS_SECRET_ACCESS_KEY: <your-aws-secret-key>
S3_BUCKET_NAME: $(terraform output -raw frontend_bucket_name)
CLOUDFRONT_DISTRIBUTION_ID: $(terraform output -raw cloudfront_distribution_id)
API_URL: $(terraform output -raw api_gateway_url)
LAMBDA_FUNCTION_NAME: $(terraform output -raw lambda_function_name)
DATABASE_URL: postgresql://postgres:<password>@<rds-endpoint>/leaf_log
```

자세한 설정 방법은 [`.github/SECRETS.md`](.github/SECRETS.md) 참조.

### 2. Database URL 구성

```bash
# RDS 비밀번호 확인
aws secretsmanager get-secret-value \
  --secret-id leaf-log-db-credentials-prod \
  --query SecretString \
  --output text | jq -r

# DATABASE_URL 형식:
# postgresql://postgres:<password>@<rds-endpoint>:5432/leaf_log
```

---

## 초기 배포

### 1. Backend Lambda 수동 배포

```bash
cd leaf-log-backend

# Lambda 빌드
npm run build:lambda

# Lambda 업데이트
aws lambda update-function-code \
  --function-name leaf-log-api \
  --zip-file fileb://dist/api.zip

# 마이그레이션 실행
DATABASE_URL="<your-rds-url>" npx prisma migrate deploy
```

### 2. Frontend 수동 배포

```bash
cd ../leaf-log-frontend

# 빌드
VITE_API_URL="<your-api-gateway-url>" npm run build

# S3 업로드
aws s3 sync dist/ s3://leaf-log-frontend-prod --delete

# CloudFront 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id <your-cloudfront-id> \
  --paths "/*"
```

### 3. 자동 배포 확인

이후 `main` 브랜치에 push하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "Initial deployment"
git push origin main

# GitHub Actions에서 배포 상태 확인
# https://github.com/your-username/leaf-log/actions
```

---

## 배포 확인

### 1. API 테스트

```bash
# Health check
curl https://your-api-url.execute-api.ap-northeast-2.amazonaws.com/prod/plants

# 식물 생성
curl -X POST https://your-api-url/plants \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트 식물","species":"Monstera"}'
```

### 2. Frontend 접속

```bash
# CloudFront URL로 접속
echo "https://$(terraform output -raw cloudfront_distribution_domain)"

# 또는 브라우저에서:
# https://d1234567890abc.cloudfront.net
```

### 3. 로그 확인

```bash
# Lambda 로그
aws logs tail /aws/lambda/leaf-log-api --follow

# API Gateway 로그
aws logs tail /aws/apigateway/leaf-log-api --follow
```

---

## 문제 해결

### Lambda Cold Start가 느림

**증상**: 첫 API 호출 시 5-10초 소요

**해결**:

```bash
# Lambda 메모리 증가 (CPU도 함께 증가)
aws lambda update-function-configuration \
  --function-name leaf-log-api \
  --memory-size 1024
```

또는 `terraform/lambda.tf`에서:

```hcl
memory_size = 1024  # 기본: 512
```

### Database 연결 실패

**증상**: Lambda에서 "unable to connect to database" 오류

**확인사항**:

1. Lambda가 VPC 내부에 있는지 확인
2. 보안 그룹이 Lambda → RDS 포트 5432 허용하는지 확인
3. RDS 엔드포인트가 올바른지 확인

```bash
# Lambda 설정 확인
aws lambda get-function-configuration \
  --function-name leaf-log-api

# 보안 그룹 확인
aws ec2 describe-security-groups \
  --group-ids <lambda-sg-id> <rds-sg-id>
```

### Frontend 빌드 실패

**증상**: `npm run build` 시 타입 오류

**해결**:

```bash
cd leaf-log-frontend

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# TypeScript 타입 확인
npm run type-check || true
```

### CloudFront 캐시 문제

**증상**: 새 배포 후에도 이전 버전이 보임

**해결**:

```bash
# 캐시 완전 무효화
aws cloudfront create-invalidation \
  --distribution-id <your-id> \
  --paths "/*"

# 무효화 상태 확인
aws cloudfront get-invalidation \
  --distribution-id <your-id> \
  --id <invalidation-id>
```

### 비용 초과

**확인**:

```bash
# 현재 월 비용 확인
aws ce get-cost-and-usage \
  --time-period Start=$(date -v-1d +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost

# NAT Gateway 삭제로 비용 절감 (개발 환경)
terraform destroy -target=aws_nat_gateway.main
```

### Prisma 마이그레이션 오류

**증상**: "P3009: migrate.lock is not found"

**해결**:

```bash
cd leaf-log-backend

# 마이그레이션 리셋 (주의: 데이터 손실)
npx prisma migrate reset

# 또는 db push 사용
npx prisma db push
```

---

## 유지보수

### 1. 모니터링 설정

```bash
# CloudWatch 알람 생성
aws cloudwatch put-metric-alarm \
  --alarm-name leaf-log-lambda-errors \
  --alarm-description "Lambda 에러 알림" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=leaf-log-api
```

### 2. 백업 설정

RDS는 자동 백업이 활성화되어 있습니다:

- 보관 기간: 7일
- 백업 시간: 03:00-04:00 KST

수동 스냅샷:

```bash
aws rds create-db-snapshot \
  --db-instance-identifier leaf-log-db \
  --db-snapshot-identifier leaf-log-manual-snapshot-$(date +%Y%m%d)
```

### 3. 정기 업데이트

```bash
# 의존성 업데이트
cd leaf-log-backend
npm update
npm audit fix

cd ../leaf-log-frontend
npm update
npm audit fix

# Terraform 프로바이더 업데이트
cd ../terraform
terraform init -upgrade
```

---

## 인프라 제거

⚠️ **주의**: 이 명령은 모든 리소스를 삭제합니다. 데이터 백업을 먼저 수행하세요.

```bash
cd terraform
terraform destroy

# 'yes' 입력하여 확인
```

---

## 다음 단계

- [ ] Custom 도메인 연결 (Route 53)
- [ ] HTTPS 인증서 설정 (ACM)
- [ ] CI/CD 파이프라인 테스트
- [ ] 모니터링 대시보드 구성
- [ ] 부하 테스트 수행
- [ ] 보안 감사 (AWS Security Hub)

---

## 참고 자료

- [AWS Lambda with NestJS](https://docs.nestjs.com/faq/serverless)
- [Prisma in Serverless](https://www.prisma.io/docs/guides/deployment/deployment-guides/serverless)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vue 3 PWA](https://vite-pwa-org.netlify.app/)

## 지원

문제가 발생하면 Issue를 등록해주세요:
https://github.com/your-username/leaf-log/issues
