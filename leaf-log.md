# 식물 관리 PWA 프로젝트

## 프로젝트 개요

- **목적**: 개인용 식물 관리 사이드 프로젝트
- **앱 타입**: PWA (Progressive Web App) → 추후 Capacitor로 앱스토어 배포 가능
- **주요 기능**: 식물 등록/관리, 물주기/비료 기록, 사진 저장, 알림 기능

## 기술 스택 결정 과정

### 초기 검토한 옵션들

1. **React Native**: React 경험 필요, 러닝커브 존재
2. **Flutter**: Dart 언어 학습 필요
3. **PWA**: ✅ 선택 - 웹 기술 그대로 사용 가능, 가장 간단
4. **Capacitor/Ionic**: PWA 이후 필요시 적용 가능

### 최종 선택 기술 스택

```
Frontend: Vue 3 + Vite + TypeScript + PWA
Backend: NestJS + TypeScript (기존 경험 활용)
Database: PostgreSQL + Prisma ORM
Storage: AWS S3 (식물 사진 저장)
```

### 선택 이유

- FE 개발 경험이 적어 최대한 간단한 방법 선택
- Vue가 React보다 학습 곡선이 완만함
- 기존 백엔드 기술 스택(NestJS, Prisma) 그대로 활용 가능
- PWA로 시작 후 필요시 Capacitor로 래핑하여 앱스토어 배포 가능

## 앱스토어 배포 전략

### PWA 배포 가능 여부

- **Google Play Store**: ✅ TWA(Trusted Web Activities) 방식으로 가능
- **Apple App Store**: ❌ 직접 불가 (Capacitor 래핑 필요)

### 단계별 접근

1. **1단계**: PWA로 개발 및 웹 배포
2. **2단계**: 필요시 Capacitor로 래핑
3. **3단계**: 양대 앱스토어 배포

## 핵심 기능 명세

### 1. 식물 관리

- 식물 등록 (이름, 종류, 위치, 사진)
- 식물 목록 조회
- 식물 상세 정보 수정/삭제

### 2. 관리 기록

- 물주기 기록
- 비료주기 기록
- 분갈이 기록
- 가지치기 기록

### 3. 알림 기능

- PWA Push Notification 활용
- 물주기 주기 알림
- 비료 주기 알림

### 4. 데이터 시각화

- 달력 뷰로 관리 기록 표시
- 식물별 관리 히스토리

## 데이터베이스 스키마

```prisma
model Plant {
  id          String   @id @default(cuid())
  name        String
  species     String?  // 식물 종류
  location    String?  // 위치 (거실, 베란다 등)
  imageUrl    String?  // S3 이미지 URL
  notes       String?  // 메모
  createdAt   DateTime @default(now())

  careRecords CareRecord[]
}

model CareRecord {
  id        String   @id @default(cuid())
  plantId   String
  type      CareType
  date      DateTime @default(now())
  notes     String?

  plant     Plant    @relation(fields: [plantId], references: [id])
}

enum CareType {
  WATER      // 물주기
  FERTILIZER // 비료
  REPOT      // 분갈이
  PRUNE      // 가지치기
}
```

## 프로젝트 구조

```
leaf-log-app/                 # 루트 폴더
├── leaf-log-project.md       # 프로젝트 문서
├── PROGRESS.md                 # 진행 상황
├── leaf-log-frontend/        # Frontend 프로젝트
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   └── public/
└── leaf-log-backend/         # Backend 프로젝트
    ├── package.json
    ├── prisma/
    │   └── schema.prisma
    └── src/
```

## 프로젝트 초기 설정

### 프로젝트 폴더 생성

```bash
# 루트 폴더 생성
mkdir leaf-log-app
cd leaf-log-app

# 문서 파일 저장
# leaf-log-project.md 파일을 여기에 복사
```

### Frontend 설정

#### 1. Frontend 프로젝트 생성

```bash
# 루트 폴더에서
npm create vite@latest leaf-log-frontend -- --template vue-ts
cd leaf-log-frontend
npm install
```

#### 2. 필수 패키지 설치

```bash
npm install @vite-pwa/vite-plugin axios dayjs
npm install -D @types/node
```

#### 3. PWA 설정 (vite.config.ts)

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "내 식물 관리",
        short_name: "식물관리",
        description: "식물 관리를 도와주는 PWA 앱",
        theme_color: "#4DBA87",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
```

### Backend 설정

#### 1. Backend 프로젝트 생성

```bash
# 루트 폴더에서
nest new leaf-log-backend
cd leaf-log-backend
```

#### 2. 필수 패키지 설치

```bash
npm install @prisma/client prisma
npm install @nestjs/config
npm install aws-sdk multer-s3 @types/multer-s3
```

#### 3. Prisma 초기화

```bash
npx prisma init
# .env 파일에 DATABASE_URL 설정
# schema.prisma 파일에 위의 스키마 복사
npx prisma migrate dev --name init
npx prisma generate
```

#### 4. CORS 설정 (main.ts)

```typescript
// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정 - Frontend 개발 서버와 통신
  app.enableCors({
    origin: "http://localhost:5173", // Vite 기본 포트
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
```

## 주요 컴포넌트 코드

### Frontend - 식물 목록 컴포넌트

```vue
<!-- src/components/PlantList.vue -->
<template>
  <div class="plant-container">
    <h2>내 식물들 🌱</h2>

    <div class="plant-grid">
      <div v-for="plant in plants" :key="plant.id" class="plant-card">
        <img :src="plant.imageUrl || '/default-plant.png'" alt="plant" />
        <h3>{{ plant.name }}</h3>
        <p class="species">{{ plant.species || "미지정" }}</p>
        <p class="location">📍 {{ plant.location || "미지정" }}</p>
        <p class="last-water">
          💧 마지막 물주기: {{ getLastWatering(plant.id) }}
        </p>

        <div class="actions">
          <button @click="addWatering(plant.id)" class="btn-water">
            💧 물주기
          </button>
          <button @click="showDetail(plant.id)" class="btn-detail">
            상세보기
          </button>
        </div>
      </div>
    </div>

    <button class="fab" @click="showAddPlant = true">+</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";

dayjs.extend(relativeTime);
dayjs.locale("ko");

interface Plant {
  id: string;
  name: string;
  species?: string;
  location?: string;
  imageUrl?: string;
  careRecords: CareRecord[];
}

interface CareRecord {
  id: string;
  type: string;
  date: string;
}

const plants = ref<Plant[]>([]);
const showAddPlant = ref(false);

onMounted(async () => {
  await loadPlants();
});

const loadPlants = async () => {
  try {
    const { data } = await axios.get("/api/plants");
    plants.value = data;
  } catch (error) {
    console.error("Failed to load plants:", error);
  }
};

const getLastWatering = (plantId: string) => {
  const plant = plants.value.find((p) => p.id === plantId);
  if (!plant) return "기록 없음";

  const lastWater = plant.careRecords
    .filter((r) => r.type === "WATER")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return lastWater ? dayjs(lastWater.date).fromNow() : "기록 없음";
};

const addWatering = async (plantId: string) => {
  try {
    await axios.post("/api/care-records", {
      plantId,
      type: "WATER",
      date: new Date(),
    });

    // 로컬 알림
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("물주기 완료! 💧", {
        body: "물주기가 기록되었습니다.",
        icon: "/icon-192.png",
      });
    }

    await loadPlants(); // 목록 새로고침
  } catch (error) {
    console.error("Failed to add watering record:", error);
  }
};

const showDetail = (plantId: string) => {
  // 라우터를 통한 상세 페이지 이동
  // router.push(`/plant/${plantId}`)
};
</script>

<style scoped>
.plant-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.plant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.plant-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.plant-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn-water,
.btn-detail {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-water {
  background: #4dba87;
  color: white;
}

.btn-detail {
  background: #f0f0f0;
  color: #333;
}

.fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #4dba87;
  color: white;
  border: none;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(77, 186, 135, 0.4);
  cursor: pointer;
}
</style>
```

### Backend - API 컨트롤러

```typescript
// src/plants/plants.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreatePlantDto, UpdatePlantDto } from "./dto/plant.dto";

@Controller("plants")
export class PlantsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async createPlant(@Body() dto: CreatePlantDto) {
    return this.prisma.plant.create({
      data: dto,
    });
  }

  @Get()
  async getPlants() {
    return this.prisma.plant.findMany({
      include: {
        careRecords: {
          take: 10,
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  @Get(":id")
  async getPlant(@Param("id") id: string) {
    return this.prisma.plant.findUnique({
      where: { id },
      include: {
        careRecords: {
          orderBy: { date: "desc" },
        },
      },
    });
  }

  @Put(":id")
  async updatePlant(@Param("id") id: string, @Body() dto: UpdatePlantDto) {
    return this.prisma.plant.update({
      where: { id },
      data: dto,
    });
  }

  @Delete(":id")
  async deletePlant(@Param("id") id: string) {
    return this.prisma.plant.delete({
      where: { id },
    });
  }
}

// src/care-records/care-records.controller.ts
@Controller("care-records")
export class CareRecordsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async createRecord(@Body() dto: CreateCareRecordDto) {
    return this.prisma.careRecord.create({
      data: dto,
    });
  }

  @Get("plant/:plantId")
  async getPlantRecords(@Param("plantId") plantId: string) {
    return this.prisma.careRecord.findMany({
      where: { plantId },
      orderBy: { date: "desc" },
    });
  }
}
```

## 오프라인 지원 전략

### Service Worker 캐싱

```javascript
// sw.js
self.addEventListener("fetch", (event) => {
  if (event.request.method === "GET") {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          return (
            response ||
            fetch(event.request).then((fetchResponse) => {
              return caches.open("v1").then((cache) => {
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
              });
            })
          );
        })
        .catch(() => {
          // 오프라인 폴백 페이지
          return caches.match("/offline.html");
        })
    );
  }
});
```

### IndexedDB를 활용한 로컬 저장

```javascript
// 오프라인 데이터 저장
import Dexie from 'dexie';

class PlantDatabase extends Dexie {
  plants!: Dexie.Table<Plant, string>;
  careRecords!: Dexie.Table<CareRecord, string>;

  constructor() {
    super('PlantDB');
    this.version(1).stores({
      plants: 'id, name, createdAt',
      careRecords: 'id, plantId, type, date'
    });
  }
}

const db = new PlantDatabase();

// 오프라인일 때 로컬에 저장
export const saveOfflineRecord = async (record: CareRecord) => {
  await db.careRecords.add({ ...record, synced: false });
};

// 온라인 복귀 시 동기화
export const syncWithServer = async () => {
  const unsyncedRecords = await db.careRecords
    .where('synced').equals(false).toArray();

  for (const record of unsyncedRecords) {
    await axios.post('/api/care-records', record);
    await db.careRecords.update(record.id, { synced: true });
  }
};
```

## 배포 전략

### 1. PWA 웹 배포

```bash
# Frontend 빌드
npm run build

# Vercel 배포
vercel --prod

# 또는 Netlify
netlify deploy --prod
```

### 2. Google Play Store 배포 (TWA)

```bash
# PWABuilder 사용
npm install -g @pwabuilder/cli
pwabuilder package

# 또는 Bubblewrap
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://your-pwa-url.com/manifest.json
bubblewrap build
```

### 3. Capacitor 추가 (iOS 지원)

```bash
# PWA 완성 후
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android

# 웹 빌드 후 동기화
npm run build
npx cap sync

# 각 플랫폼 실행
npx cap run ios
npx cap run android
```

## AWS 기반 인프라 구성

### AWS 아키텍처 옵션

#### 옵션 1: EC2 기반 (월 $10~15)

```yaml
Frontend: S3 + CloudFront
Backend: EC2 t4g.micro (ARM 인스턴스)
Database: PostgreSQL (EC2에 직접 설치)
Storage: S3 (이미지 저장)
Domain: Route 53
```

#### 옵션 2: 서버리스 (월 $5~15) ✅ 추천

```yaml
Frontend: S3 + CloudFront
Backend: Lambda + API Gateway
Database: RDS PostgreSQL db.t4g.micro
Storage: S3
Auth: Cognito (선택사항)
```

#### 옵션 3: 컨테이너 기반 (월 $20~30)

```yaml
Frontend: S3 + CloudFront
Backend: ECS Fargate
Database: RDS PostgreSQL
Storage: S3
CI/CD: CodePipeline
```

### 서버리스 아키텍처 구성도

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Route53   │────▶│  CloudFront  │────▶│     S3      │
└─────────────┘     └──────────────┘     │  (Frontend) │
                                          └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ API Gateway  │
                    └──────────────┘
                            │
                    ┌───────▼────────┐
                    │    Lambda      │
                    │   (NestJS)     │
                    └────────────────┘
                            │
                    ┌───────▼────────┐     ┌─────────────┐
                    │   RDS Proxy    │────▶│     RDS     │
                    └────────────────┘     │ PostgreSQL  │
                                           └─────────────┘
```

### 비용 분석 (서버리스 구성)

```
S3 (Frontend): $0.023/GB ≈ $0.5/월
CloudFront: 무료 티어 1TB = $0
Lambda: 무료 티어 100만 요청 = $0
API Gateway: $1/백만 요청 ≈ $1/월
RDS PostgreSQL: db.t4g.micro = $12.41/월
S3 (이미지): ≈ $1/월

총 예상 비용: 약 $15/월
```

### Terraform 인프라 코드

#### terraform/variables.tf

```hcl
variable "project_name" {
  default = "leaf-log"
}

variable "region" {
  default = "ap-northeast-2"
}

variable "environment" {
  default = "prod"
}
```

#### terraform/s3.tf

```hcl
# Frontend 호스팅용 S3 버킷
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-frontend-${var.environment}"
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# 이미지 저장용 S3 버킷
resource "aws_s3_bucket" "images" {
  bucket = "${var.project_name}-images-${var.environment}"
}

resource "aws_s3_bucket_cors_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
```

#### terraform/cloudfront.tf

```hcl
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-${var.project_name}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled    = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.project_name}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  # SPA를 위한 404 처리
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

#### terraform/lambda.tf

```hcl
# Lambda 실행 역할
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Lambda 정책 연결
resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Lambda 함수
resource "aws_lambda_function" "api" {
  filename         = "api.zip"
  function_name    = "${var.project_name}-api"
  role            = aws_iam_role.lambda_role.arn
  handler         = "dist/lambda.handler"
  runtime         = "nodejs18.x"
  memory_size     = 512
  timeout         = 30

  environment {
    variables = {
      NODE_ENV     = var.environment
      DATABASE_URL = "postgresql://${aws_db_instance.postgres.username}:${aws_db_instance.postgres.password}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
      S3_BUCKET    = aws_s3_bucket.images.id
      JWT_SECRET   = random_password.jwt_secret.result
    }
  }

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }
}

# API Gateway
resource "aws_apigatewayv2_api" "api" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["*"]
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.api.invoke_arn
}

resource "aws_apigatewayv2_route" "api" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = var.environment
  auto_deploy = true
}
```

#### terraform/rds.tf

```hcl
# RDS 서브넷 그룹
resource "aws_db_subnet_group" "postgres" {
  name       = "${var.project_name}-db-subnet"
  subnet_ids = aws_subnet.private[*].id
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t4g.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true

  db_name  = "leaf_log"
  username = "postgres"
  password = random_password.db_password.result

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.postgres.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true

  tags = {
    Name        = "${var.project_name}-db"
    Environment = var.environment
  }
}

# 데이터베이스 비밀번호
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# JWT 시크릿
resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

# Secrets Manager에 저장
resource "aws_secretsmanager_secret" "db_credentials" {
  name = "${var.project_name}-db-credentials"
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = aws_db_instance.postgres.username
    password = random_password.db_password.result
    endpoint = aws_db_instance.postgres.endpoint
    dbname   = aws_db_instance.postgres.db_name
  })
}
```

### NestJS Lambda 설정

#### leaf-log-backend/src/lambda.ts

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import serverlessExpress from "@vendia/serverless-express";
import { Callback, Context, Handler } from "aws-lambda";

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
```

#### leaf-log-backend/webpack.config.js

```javascript
const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./src/lambda.ts",
  target: "node",
  mode: "production",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "lambda.js",
    libraryTarget: "commonjs2",
  },
  optimization: {
    minimize: true,
  },
};
```

### GitHub Actions 배포 자동화

#### .github/workflows/deploy.yml

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

env:
  AWS_REGION: ap-northeast-2

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./leaf-log-frontend

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: leaf-log-frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build Frontend
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_GATEWAY_URL }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET_NAME }} --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

  deploy-backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./leaf-log-backend

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: leaf-log-backend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build Backend
        run: |
          npm run build
          npm prune --production

      - name: Package Lambda
        run: |
          zip -r api.zip dist/ node_modules/ package.json

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy Lambda Function
        run: |
          aws lambda update-function-code \
            --function-name leaf-log-api \
            --zip-file fileb://api.zip

      - name: Run Database Migrations
        run: |
          npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### AWS 서비스별 실무 패턴

#### S3 Presigned URL 이미지 업로드

```typescript
// leaf-log-backend/src/upload/upload.service.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class UploadService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
    });
  }

  async getUploadUrl(filename: string): Promise<string> {
    const key = `plants/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: "image/jpeg",
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return url;
  }
}
```

#### Secrets Manager 활용

```typescript
// leaf-log-backend/src/config/secrets.service.ts
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

@Injectable()
export class SecretsService {
  private client: SecretsManagerClient;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION,
    });
  }

  async getSecret(secretName: string): Promise<any> {
    if (this.cache.has(secretName)) {
      return this.cache.get(secretName);
    }

    try {
      const response = await this.client.send(
        new GetSecretValueCommand({
          SecretId: secretName,
        })
      );

      const secret = JSON.parse(response.SecretString);
      this.cache.set(secretName, secret);

      return secret;
    } catch (error) {
      console.error("Failed to retrieve secret:", error);
      throw error;
    }
  }
}
```

#### CloudWatch 로깅

```typescript
// leaf-log-backend/src/logger/cloudwatch.logger.ts
import * as winston from "winston";
import * as WinstonCloudWatch from "winston-cloudwatch";

export const createLogger = () => {
  const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ],
  });

  if (process.env.NODE_ENV === "production") {
    logger.add(
      new WinstonCloudWatch({
        logGroupName: "/aws/lambda/leaf-log-api",
        logStreamName: `${new Date().toISOString().split("T")[0]}`,
        awsRegion: process.env.AWS_REGION,
        jsonMessage: true,
      })
    );
  }

  return logger;
};
```

### 로컬 개발 환경

#### docker-compose.yml

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: leaf_log
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  localstack:
    image: localstack/localstack:latest
    ports:
      - "4566:4566"
    environment:
      - SERVICES=s3,lambda,apigateway,cloudfront
      - DEBUG=1
      - DATA_DIR=/tmp/localstack/data
    volumes:
      - "./localstack:/tmp/localstack"
      - "/var/run/docker.sock:/var/run/docker.sock"

volumes:
  postgres_data:
```

#### 로컬 개발용 .env

```bash
# leaf-log-backend/.env.local
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/plant_care
AWS_ENDPOINT=http://localhost:4566
S3_BUCKET=leaf-log-images-local
JWT_SECRET=local-development-secret
```

### 비용 최적화 팁

#### 1. Lambda 콜드 스타트 최소화

```typescript
// EventBridge로 5분마다 Lambda 워밍
const rule = new aws.cloudwatch.EventRule("lambda-warmer", {
  scheduleExpression: "rate(5 minutes)",
});

const target = new aws.cloudwatch.EventTarget("lambda-warmer-target", {
  rule: rule.name,
  arn: lambda.arn,
  input: JSON.stringify({ warmer: true }),
});
```

#### 2. RDS 비용 절감

```bash
# 개발 환경에서는 RDS를 중지
aws rds stop-db-instance --db-instance-identifier leaf-log-db

# 필요할 때만 시작
aws rds start-db-instance --db-instance-identifier leaf-log-db
```

#### 3. S3 수명 주기 정책

```hcl
resource "aws_s3_bucket_lifecycle_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  rule {
    id     = "delete-old-images"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}
```

### 모니터링 및 알람 설정

#### terraform/cloudwatch.tf

```hcl
# Lambda 에러 알람
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "Errors"
  namespace          = "AWS/Lambda"
  period             = "300"
  statistic          = "Sum"
  threshold          = "5"

  dimensions = {
    FunctionName = aws_lambda_function.api.function_name
  }
}

# RDS CPU 사용률 알람
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${var.project_name}-rds-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "CPUUtilization"
  namespace          = "AWS/RDS"
  period             = "300"
  statistic          = "Average"
  threshold          = "80"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgres.id
  }
}
```

## 추가 기능 아이디어

### 1. 식물 인식 AI

- TensorFlow.js 활용한 식물 종류 자동 인식
- 사진 촬영 시 식물 정보 자동 입력

### 2. 커뮤니티 기능

- 다른 사용자와 식물 관리 팁 공유
- 식물 거래/나눔

### 3. 날씨 연동

- 날씨 API 연동으로 물주기 추천
- 습도/온도에 따른 관리 가이드

### 4. 통계 대시보드

- 월별 관리 통계
- 식물별 성장 기록

## 개발 환경 실행

### 1. Backend 실행

```bash
cd leaf-log-backend
npm run start:dev
# http://localhost:3000 에서 실행
```

### 2. Frontend 실행

```bash
cd leaf-log-frontend
npm run dev
# http://localhost:5173 에서 실행
```

### 3. Frontend API 설정

```typescript
// leaf-log-frontend/src/api/config.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 사용 예시
// import { api } from '@/api/config';
// const response = await api.get('/plants');
```

```typescript
// leaf-log-frontend/.env.development
VITE_API_URL=http://localhost:3000

// leaf-log-frontend/.env.production
VITE_API_URL=https://api.your-domain.com
```

## Claude Code 활용 방법

### 프로젝트 시작 명령어

```bash
# 전체 프로젝트 구조 생성
claude "leaf-log-project.md를 참고해서
leaf-log-frontend와 leaf-log-backend
두 개의 프로젝트를 생성하고 초기 설정해줘"
```

### Frontend 작업

```bash
cd leaf-log-frontend
claude "leaf-log-project.md의 Frontend 섹션을 참고해서
Vue 컴포넌트들을 구현해줘"
```

### Backend 작업

```bash
cd leaf-log-backend
claude "leaf-log-project.md의 Prisma 스키마와 API 섹션을 참고해서
NestJS API를 구현해줘"
```

### 통합 작업

```bash
# 루트 폴더에서
claude "leaf-log-project.md를 보고
Frontend는 leaf-log-frontend 폴더에,
Backend는 leaf-log-backend 폴더에
각각 구현해줘"
```

### 컨텍스트 유지 팁

1. 이 문서를 프로젝트 루트에 저장
2. 작업 진행사항을 문서에 업데이트
3. Claude Code 실행 시 문서 참조하도록 명시

## 진행 상황 체크리스트

### Frontend (leaf-log-frontend)

- [ ] Vue 3 + Vite 프로젝트 생성
- [ ] PWA 플러그인 설정
- [ ] API 통신 설정 (axios)
- [ ] 식물 목록 페이지
- [ ] 식물 상세 페이지
- [ ] 식물 등록 폼
- [ ] 관리 기록 입력
- [ ] 푸시 알림 설정
- [ ] 오프라인 지원
- [ ] S3 Presigned URL 이미지 업로드

### Backend (leaf-log-backend)

- [ ] NestJS 프로젝트 생성
- [ ] Prisma 설정 및 마이그레이션
- [ ] CORS 설정
- [ ] Plants API CRUD
- [ ] CareRecords API
- [ ] S3 이미지 업로드 서비스
- [ ] Lambda 핸들러 설정
- [ ] 인증 (선택사항 - Cognito)

### AWS 인프라

- [ ] AWS 계정 설정
- [ ] IAM 사용자 및 권한 설정
- [ ] Terraform 설치 및 설정
- [ ] S3 버킷 생성 (Frontend, Images)
- [ ] CloudFront 배포
- [ ] VPC 및 서브넷 구성
- [ ] RDS PostgreSQL 설정
- [ ] Lambda 함수 배포
- [ ] API Gateway 설정
- [ ] Secrets Manager 설정
- [ ] CloudWatch 로깅 및 모니터링

### CI/CD

- [ ] GitHub Actions 설정
- [ ] AWS 자격 증명 GitHub Secrets 등록
- [ ] Frontend 자동 배포 파이프라인
- [ ] Backend 자동 배포 파이프라인
- [ ] 데이터베이스 마이그레이션 자동화

### 통합 테스트

- [ ] Frontend-Backend API 연동 테스트
- [ ] 이미지 업로드 테스트
- [ ] PWA 오프라인 기능 테스트
- [ ] Lambda 콜드 스타트 테스트
- [ ] CloudFront 캐싱 테스트

### 배포

- [ ] 개발 환경 구성 (LocalStack)
- [ ] 스테이징 환경 배포
- [ ] 프로덕션 환경 배포
- [ ] 도메인 연결 (Route 53)
- [ ] SSL 인증서 설정
- [ ] 모니터링 대시보드 구성
- [ ] 비용 알림 설정
- [ ] Google Play Store 배포 (선택)
- [ ] App Store 배포 (선택)

## 참고 자료

- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Vue 3 공식 문서](https://vuejs.org/)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [PWABuilder](https://www.pwabuilder.com/)
- [Capacitor 공식 문서](https://capacitorjs.com/)

---

_이 문서는 Claude.ai와의 대화를 통해 정리된 프로젝트 계획입니다._
_작성일: 2025년 11월 24일_
