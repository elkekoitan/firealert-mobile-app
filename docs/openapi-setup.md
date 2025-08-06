# OpenAPI Contract-First Setup Guide

Bu kılavuz, FireAlert frontend projesi için OpenAPI contract-first yaklaşımının nasıl kurulacağını açıklar.

## 📋 Gereksinimler

### Kurulu Gerekenler
```bash
# Gerekli kütüphanelerin kurulumu
npm install -D openapi-typescript openapi-typescript-helpers tsx
```

### OpenAPI Dosyası
Proje kök dizininde `docs/openapi.yaml` dosyası bulunmalıdır.

## 🔧 Kurulum Adımları

### 1. OpenAPI Dosyasını Oluşturma
Backend ekibiyle koordinasyon halinde `docs/openapi.yaml` dosyasını oluşturun:

```yaml
openapi: 3.0.0
info:
  title: FireAlert API
  version: 1.0.0
  description: Yangın erken uyarı sistemi API'si

servers:
  - url: https://api.firealert.com/v1
    description: Production server
  - url: https://staging-api.firealert.com/v1
    description: Staging server

paths:
  /reports:
    get:
      summary: Get reports
      parameters:
        - name: bbox
          in: query
          schema:
            type: string
            description: Bounding box (west,south,east,north)
        - name: hours
          in: query
          schema:
            type: integer
            default: 24
      responses:
        '200':
          description: List of reports
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/FireReport'
    
    post:
      summary: Create a new report
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateReportRequest'
      responses:
        '201':
          description: Report created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FireReport'

components:
  schemas:
    FireReport:
      type: object
      required:
        - id
        - latitude
        - longitude
        - status
        - reportedAt
      properties:
        id:
          type: string
          format: uuid
        latitude:
          type: number
          minimum: -90
          maximum: 90
        longitude:
          type: number
          minimum: -180
          maximum: 180
        status:
          type: string
          enum: [PENDING, VERIFIED, REJECTED]
        reportedAt:
          type: string
          format: date-time
        aiAnalysis:
          $ref: '#/components/schemas/AiAnalysis'
    
    AiAnalysis:
      type: object
      properties:
        confidence:
          type: number
          minimum: 0
          maximum: 100
        riskLevel:
          type: string
          enum: [LOW, MEDIUM, HIGH, CRITICAL]
        detectedElements:
          type: array
          items:
            type: string
```

### 2. TypeScript Tiplerini Üretme
```bash
# API tiplerini üretmek için
npm run generate:api-types
```

Bu komut `src/types/api-types.ts` dosyasını oluşturur.

### 3. API Servislerini Güncelleme
Oluşturulan tipleri kullanarak RTK Query servislerini güncelleyin:

```typescript
// src/store/services/api.ts
import { apiSlice } from './api';
import type { paths } from '../../types/api-types';

// API endpoint'lerini tip güvenliği ile kullanma
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQuery,
  tagTypes: ['Report', 'Alert', 'Satellite', 'User'],
  endpoints: (builder) => ({
    getReports: builder.query<paths['/reports']['get']['responses']['200']['content']['application/json'], {
      bbox?: string;
      hours?: number;
    }>({
      query: ({ bbox, hours }) => ({
        url: 'reports',
        params: { bbox, hours },
      }),
      providesTags: ['Report'],
    }),
    
    createReport: builder.mutation<paths['/reports']['post']['responses']['201']['content']['application/json'], CreateReportRequest>({
      query: (reportData) => ({
        url: 'reports',
        method: 'POST',
        body: reportData,
      }),
      invalidatesTags: ['Report'],
    }),
  }),
});
```

### 4. Tip Güvenliği ile Kullanım
Bileşenlerde API yanıtlarını tip güvenliği ile kullanın:

```typescript
import { useGetReportsQuery } from '../store/services/api';

const MapScreen: React.FC = () => {
  const { data: reports, error, isLoading } = useGetReportsQuery({
    bbox: '32.0,39.0,33.0,40.0',
    hours: 24,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Error message="Raporlar yüklenemedi" />;
  
  return (
    <Map>
      {reports?.map(report => (
        <Marker key={report.id} coordinate={{ latitude: report.latitude, longitude: report.longitude }} />
      ))}
    </Map>
  );
};
```

## 🔄 CI/CD Entegrasyonu

### GitHub Actions Workflow
`.github/workflows/api-types.yml` dosyası oluşturun:

```yaml
name: Generate API Types

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  generate-api-types:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run generate:api-types
    - name: Commit changes
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add src/types/api-types.ts
        git diff --staged --quiet || git commit -m "chore: update API types"
        git push
```

## 📝 Geliştirme Akışı

### 1. Backend API Değişiklikleri
Backend ekibi API değişikliklerini `docs/openapi.yaml` dosyasında günceller.

### 2. Frontend Tip Güncellemesi
```bash
# Yeni tipleri üret
npm run generate:api-types
```

### 3. Kod İyileştirmeleri
- Oluşturulan tipleri kullanarak kod güncellemeleri
- Eski API çağrılarını yeni tiplere geçirme
- Testlerin güncellenmesi

## 🔍 Sorun Giderme

### Yaygın Sorunlar

#### 1. "openapi-typescript not found" Hatası
```bash
# Çözüm: Gerekli paketleri kurun
npm install -D openapi-typescript openapi-typescript-helpers tsx
```

#### 2. "Cannot find module 'openapi-typescript-helpers'" Hatası
```bash
# Çözüm: Paketin doğru kurulu olduğunu kontrol edin
npm list openapi-typescript-helpers
```

#### 3. OpenAPI Dosyası Bulunamadı
- `docs/openapi.yaml` dosyasının varlığını kontrol edin
- Dosya yolunun doğru olduğundan emin olun

#### 4. Üretilen Tiplerde Hatalar
- OpenAPI dosyasının geçerli YAML olduğunu kontrol edin
- Backend ekibiyle API sözleşmesini kontrol edin

## 🚀 İleri Seviye Kullanım

### Custom API Client
```typescript
// src/utils/apiClient.ts
import type { paths } from '../types/api-types';
import { createClient } from 'openapi-typescript-helpers';

const apiClient = createClient<paths>(environment.api.baseUrl);

// Tip güvenliği ile API çağrısı
const reports = await apiClient.GET('/reports', {
  params: {
    query: { bbox: '32.0,39.0,33.0,40.0', hours: 24 },
  },
});
```

### API Değişiklikleri Takibi
```bash
# API değişikliklerini karşılaştırma
git diff docs/openapi.yaml
```

## 📊 Performans İpuçları

1. **Tip Üretimi**: Sadece değişiklik olduğunda çalıştırın
2. **CI/CD**: API tiplerini otomatik olarak güncelleyin
3. **Hata Ayıklama**: Üretilen tipleri kontrol edin
4. **Dokümantasyon**: API değişikliklerini takip edin

## 🤖 Otomasyon

### Pre-commit Hook
`.husky/pre-commit` dosyası:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run generate:api-types
git add src/types/api-types.ts
```

Bu setup, frontend ve backend arasında tip güvenliği sağlar ve API değişikliklerini otomatik olarak yönetir.