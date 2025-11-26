# GitHub Secrets Configuration

이 문서는 CI/CD 파이프라인에 필요한 GitHub Secrets 설정 방법을 설명합니다.

## 필수 Secrets

GitHub Repository → Settings → Secrets and variables → Actions에서 다음 secrets를 추가하세요:

### AWS 자격 증명

```
AWS_ACCESS_KEY_ID
  설명: AWS IAM 사용자의 Access Key ID
  예시: AKIAIOSFODNN7EXAMPLE

AWS_SECRET_ACCESS_KEY
  설명: AWS IAM 사용자의 Secret Access Key
  예시: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### Frontend 배포

```
S3_BUCKET_NAME
  설명: Frontend를 호스팅하는 S3 버킷 이름
  예시: leaf-log-frontend-prod
  확인: terraform output frontend_bucket_name

CLOUDFRONT_DISTRIBUTION_ID
  설명: CloudFront 배포 ID
  예시: E1234567890ABC
  확인: terraform output cloudfront_distribution_id

API_URL
  설명: Backend API Gateway 엔드포인트 URL
  예시: https://abc123.execute-api.ap-northeast-2.amazonaws.com/prod
  확인: terraform output api_gateway_url
```

### Backend 배포

```
LAMBDA_FUNCTION_NAME
  설명: Lambda 함수 이름
  예시: leaf-log-api
  확인: terraform output lambda_function_name

DATABASE_URL
  설명: PostgreSQL 데이터베이스 연결 문자열
  예시: postgresql://postgres:PASSWORD@leaf-log-db.xxx.ap-northeast-2.rds.amazonaws.com:5432/leaf_log
  확인:
    1. terraform output rds_endpoint
    2. AWS Secrets Manager에서 비밀번호 확인
    3. 연결 문자열 구성
```

## Secrets 설정 방법

### 1. AWS IAM 사용자 생성

```bash
# AWS Console에서:
# 1. IAM → Users → Add users
# 2. User name: github-actions-leaf-log
# 3. Access key 선택
# 4. 권한 정책 연결:
#    - AmazonS3FullAccess
#    - CloudFrontFullAccess
#    - AWSLambda_FullAccess
#    - AmazonRDSFullAccess
#    - SecretsManagerReadWrite
#    - AmazonAPIGatewayAdministrator
# 5. Access Key ID와 Secret Access Key 저장
```

### 2. Terraform 출력값 확인

```bash
cd terraform
terraform output

# 또는 특정 값만 확인
terraform output frontend_bucket_name
terraform output cloudfront_distribution_id
terraform output api_gateway_url
terraform output lambda_function_name
```

### 3. Database URL 구성

```bash
# RDS 엔드포인트 확인
terraform output rds_endpoint
# 출력: leaf-log-db.xxx.rds.amazonaws.com:5432

# Secrets Manager에서 DB 비밀번호 확인
aws secretsmanager get-secret-value \
  --secret-id leaf-log-db-credentials-prod \
  --query SecretString \
  --output text | jq -r .password

# DATABASE_URL 구성
# postgresql://[username]:[password]@[endpoint]/[database]
# 예: postgresql://postgres:abc123@leaf-log-db.xxx.rds.amazonaws.com:5432/leaf_log
```

### 4. GitHub Secrets 추가

```bash
# GitHub CLI 사용 (선택사항)
gh secret set AWS_ACCESS_KEY_ID -b "AKIAIOSFODNN7EXAMPLE"
gh secret set AWS_SECRET_ACCESS_KEY -b "wJalrXUtnFEMI/K7MDENG/bPxRfiCY"
gh secret set S3_BUCKET_NAME -b "leaf-log-frontend-prod"
gh secret set CLOUDFRONT_DISTRIBUTION_ID -b "E1234567890ABC"
gh secret set API_URL -b "https://abc123.execute-api.ap-northeast-2.amazonaws.com/prod"
gh secret set LAMBDA_FUNCTION_NAME -b "leaf-log-api"
gh secret set DATABASE_URL -b "postgresql://postgres:password@endpoint:5432/leaf_log"
```

또는 GitHub 웹 인터페이스에서:
1. Repository → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. Name과 Value 입력
4. "Add secret" 클릭

## 보안 고려사항

1. **IAM 최소 권한 원칙**
   - 프로덕션 환경에서는 더 제한적인 IAM 정책 사용 권장
   - 특정 리소스에만 접근 가능하도록 제한

2. **Secret Rotation**
   - AWS Access Key는 정기적으로 교체
   - Database 비밀번호는 Secrets Manager에서 자동 회전 설정 권장

3. **환경별 분리**
   - 개발/스테이징/프로덕션 환경별로 별도의 Secrets 사용
   - Branch protection rules 설정으로 프로덕션 배포 제한

4. **모니터링**
   - CloudTrail로 API 호출 감사
   - CloudWatch Logs로 배포 로그 모니터링

## 문제 해결

### Secret이 제대로 설정되지 않은 경우

```bash
# GitHub Actions 로그에서 확인
# "Error: The config profile (default) could not be found"
# → AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY 확인

# "Error: An error occurred (NoSuchBucket)"
# → S3_BUCKET_NAME 확인

# "Error: ResourceNotFoundException"
# → LAMBDA_FUNCTION_NAME 또는 CLOUDFRONT_DISTRIBUTION_ID 확인
```

### Database 연결 오류

```bash
# Lambda에서 DB 연결 테스트
aws lambda invoke \
  --function-name leaf-log-api \
  --payload '{"path":"/plants","httpMethod":"GET"}' \
  response.json

cat response.json
```

## 참고 자료

- [GitHub Secrets 문서](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Terraform Output Values](https://www.terraform.io/language/values/outputs)
