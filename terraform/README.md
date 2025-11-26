# Leaf Log Terraform Infrastructure

이 디렉토리는 Leaf Log 프로젝트의 AWS 인프라를 관리하는 Terraform 코드를 포함합니다.

## 아키텍처 개요

- **Frontend**: S3 + CloudFront (정적 웹사이트 호스팅)
- **Backend**: Lambda + API Gateway (서버리스 API)
- **Database**: RDS PostgreSQL (db.t4g.micro)
- **Storage**: S3 (이미지 저장)
- **Network**: VPC with public/private subnets, NAT Gateway
- **Secrets**: AWS Secrets Manager (DB 자격증명, JWT 시크릿)

## 예상 비용

- S3 (Frontend): ~$0.5/월
- CloudFront: 무료 티어 1TB
- Lambda: 무료 티어 100만 요청
- API Gateway: ~$1/월
- RDS PostgreSQL db.t4g.micro: ~$12.41/월
- NAT Gateway: ~$32/월 ⚠️
- S3 (Images): ~$1/월

**총 예상 비용**: 약 **$47/월**

> ⚠️ NAT Gateway가 비용의 큰 부분을 차지합니다. 비용 절감을 위해:
> - 개발 환경에서는 NAT Gateway 대신 Lambda를 public subnet에 배치 가능
> - 또는 RDS를 public으로 설정하고 보안 그룹으로 접근 제어

## 필수 요구사항

1. **AWS CLI 설치 및 설정**
   ```bash
   aws configure
   ```

2. **Terraform 설치** (v1.0 이상)
   ```bash
   # macOS
   brew install terraform

   # 또는 https://www.terraform.io/downloads
   ```

3. **Backend Lambda 빌드**
   ```bash
   cd ../leaf-log-backend
   npm run build:lambda
   ```

## 사용 방법

### 1. Terraform 초기화

```bash
cd terraform
terraform init
```

### 2. 인프라 계획 확인

```bash
terraform plan
```

### 3. 인프라 배포

```bash
terraform apply
```

배포 후 중요한 출력값들이 표시됩니다:
- CloudFront 도메인
- API Gateway 엔드포인트
- RDS 엔드포인트
- S3 버킷 이름

### 4. 출력값 확인

```bash
terraform output
```

민감한 정보를 포함한 모든 출력값:
```bash
terraform output -json
```

### 5. 인프라 제거

```bash
terraform destroy
```

## 환경 변수 설정

Terraform 배포 후, Frontend와 Backend에 다음 환경 변수를 설정해야 합니다:

### Frontend (.env.production)
```bash
VITE_API_URL=<terraform output api_gateway_url>
```

### Backend Lambda 환경 변수
Lambda 함수에 자동으로 설정되는 환경 변수:
- `DATABASE_URL`: RDS PostgreSQL 연결 문자열
- `S3_BUCKET`: 이미지 저장용 S3 버킷
- `JWT_SECRET`: JWT 토큰 시크릿
- `NODE_ENV`: 환경 (prod/dev)

## 디렉토리 구조

```
terraform/
├── providers.tf          # Terraform 및 AWS 프로바이더 설정
├── variables.tf          # 입력 변수 정의
├── vpc.tf               # VPC, 서브넷, NAT Gateway
├── security-groups.tf   # 보안 그룹 (Lambda, RDS)
├── s3.tf                # S3 버킷 (Frontend, Images)
├── cloudfront.tf        # CloudFront 배포
├── rds.tf               # RDS PostgreSQL 데이터베이스
├── lambda.tf            # Lambda 함수 및 API Gateway
├── outputs.tf           # 출력값 정의
└── README.md            # 이 파일
```

## 커스터마이징

### 변수 오버라이드

`terraform.tfvars` 파일을 생성하여 변수를 오버라이드할 수 있습니다:

```hcl
project_name = "my-plant-app"
environment  = "dev"
region       = "us-east-1"
```

### 리전 변경

기본 리전은 `ap-northeast-2` (서울)입니다. 변경하려면:

```hcl
# terraform.tfvars
region = "us-east-1"
availability_zones = ["us-east-1a", "us-east-1b"]
```

### RDS 인스턴스 크기 변경

더 큰 인스턴스가 필요한 경우 `rds.tf`에서 수정:

```hcl
instance_class = "db.t4g.small"  # 기본: db.t4g.micro
```

## 보안 고려사항

1. **Secrets Manager**: DB 자격증명과 JWT 시크릿은 Secrets Manager에 자동 저장됩니다.

2. **VPC 격리**: Lambda와 RDS는 private subnet에 배치되어 인터넷에서 직접 접근할 수 없습니다.

3. **보안 그룹**: Lambda만 RDS에 접근할 수 있도록 설정되어 있습니다.

4. **S3 버킷 정책**:
   - Frontend 버킷: CloudFront에서만 접근 가능
   - Images 버킷: Lambda에서만 쓰기 가능, 읽기는 presigned URL 통해서만

5. **IAM 최소 권한**: Lambda 역할은 필요한 최소한의 권한만 갖습니다.

## 트러블슈팅

### Lambda cold start가 느림

Lambda 메모리를 증가시키면 CPU도 함께 증가하여 cold start가 빨라집니다:

```hcl
# lambda.tf
memory_size = 1024  # 기본: 512
```

### RDS 연결 타임아웃

1. Lambda가 VPC 내부에 있는지 확인
2. 보안 그룹이 올바르게 설정되었는지 확인
3. RDS endpoint가 올바른지 확인

```bash
# Lambda 환경 변수 확인
aws lambda get-function-configuration --function-name leaf-log-api
```

### Terraform state 충돌

팀으로 작업하는 경우 S3 backend를 사용하여 state를 공유하세요:

```hcl
# providers.tf 주석 해제
terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "leaf-log/terraform.tfstate"
    region = "ap-northeast-2"
  }
}
```

## 다음 단계

1. ✅ Terraform으로 인프라 배포
2. 📦 Backend Lambda 함수 코드 작성 및 패키징
3. 🎨 Frontend 빌드 및 S3 업로드
4. 🔄 CI/CD 파이프라인 설정 (GitHub Actions)
5. 📊 모니터링 및 알람 설정

## 참고 자료

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Lambda with NestJS](https://docs.nestjs.com/faq/serverless)
- [AWS RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
