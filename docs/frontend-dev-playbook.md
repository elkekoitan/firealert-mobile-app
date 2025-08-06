# FireAlert Frontend Dev Playbook (Senkronizasyon, Rehber ve Changelog)

Bu doküman, frontend geliştiricilerin proje bağlamından kopmadan API'leri, route'ları, navigasyonu ve state yönetimini doğru şekilde uygulayabilmeleri için sürekli güncellenen bir rehberdir. Backend PRD & Progress Tracker ile eşzamanlı tutulur.

## 📋 **Kaynaklar**
- **Frontend PRD & Tracker:** `docs/frontend-prd-and-progress.md`
- **Mevcut Implementasyon:** Phase 1 Foundation (Redux Toolkit + React Native Paper)
- **Backend API:** `https://api.wildfireews.com/v1` (geliştirilme aşamasında)
- **OpenAPI Sözleşmesi:** `docs/openapi.yaml` (contract-first - planlanıyor)

---

## 1️⃣ **Mimari Prensipler**

### **Mevcut Durum (Phase 1)**
```typescript
// Teknoloji Stack
- React Native + Expo SDK 53
- Redux Toolkit + RTK Query (hazır)
- React Native Paper (Material Design 3)
- React Navigation 7.x
- Mock data ile development
```

### **Hedef Mimari (Phase 2+)**
```typescript
// Contract-First Yaklaşım
- OpenAPI → TypeScript tip üretimi
- RTK Query ile cache & invalidation
- Environment-based configuration
```

**Neden contract-first?**
- Tek doğruluk kaynağı: `docs/openapi.yaml`
- Tip güvenliği: `openapi-typescript` ile otomatik tip üretimi
- Backend-Frontend senkronizasyonu

---

## 2️⃣ **Çevresel Değişkenler**

### **Mevcut Konfigürasyon**
```typescript
// src/constants/index.ts
export const API_ENDPOINTS = {
  BASE_URL: 'https://api.wildfireews.com/v1',
  WEBSOCKET: 'wss://api.wildfireews.com/ws',
  // ... diğer endpoint'ler
};
```

### **Hedef .env Yapısı**
```bash
# Development
API_BASE_URL=http://localhost:3000/v1
WS_URL=ws://localhost:3000/ws
ENVIRONMENT=development

# Staging
API_BASE_URL=https://staging-api.firealert.com/v1
WS_URL=wss://staging-api.firealert.com/ws
ENVIRONMENT=staging

# Production  
API_BASE_URL=https://api.firealert.com/v1
WS_URL=wss://api.firealert.com/ws
ENVIRONMENT=production

# Optional
SENTRY_DSN=your_sentry_dsn
MAPS_API_KEY=your_maps_key
```

---

## 3️⃣ **Navigasyon Yapısı**

### **Mevcut Implementasyon**
```typescript
// src/navigation/
RootNavigator
├── AuthStack (Login, Register)
└── MainTabs
    ├── Map (Harita + Yangın Raporları)
    ├── Reports (Rapor Listesi)
    ├── Alerts (Bildirimler)
    └── Settings (Ayarlar)
```

### **Genişletilmiş Yapı (Phase 2+)**
```typescript
MainTabs
├── MapStack
│   ├── Map (ana harita)
│   ├── ReportDetail
│   └── CreateReport (modal)
├── ReportsStack  
│   ├── ReportsList
│   ├── MyReports
│   └── ReportDetail
├── AlertsStack
│   ├── AlertsList
│   └── AlertDetail
└── SettingsStack
    ├── Settings
    ├── Profile
    └── Permissions
```

**Deep Link Desteği:**
```typescript
// Bildirimlerden direkt navigasyon
firealert://report/123
firealert://alert/456
```

---

## 4️⃣ **State Yönetimi**

### **Mevcut Redux Store**
```typescript
// src/store/index.ts
export const store = configureStore({
  reducer: {
    auth: authSlice,           // ✅ Hazır
    reports: reportsSlice,     // ✅ Hazır  
    notifications: notificationsSlice, // ✅ Hazır
    settings: settingsSlice,   // ✅ Hazır
  }
});
```

### **RTK Query Servisleri (Phase 2)**
```typescript
// src/store/services/api.ts
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Report', 'Alert', 'Satellite', 'User'],
  endpoints: (builder) => ({
    // Reports
    getReports: builder.query<Report[], ReportsQuery>({
      query: ({ bbox, hours }) => 
        `reports?bbox=${bbox}&hours=${hours}`,
      providesTags: ['Report'],
    }),
    createReport: builder.mutation<Report, CreateReportData>({
      query: (data) => ({
        url: 'reports',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Report'],
    }),
    // Satellite
    getSatelliteData: builder.query<SatelliteData[], SatelliteQuery>({
      query: ({ bbox, hours }) => 
        `satellite/nearby?bbox=${bbox}&hours=${hours}`,
      providesTags: ['Satellite'],
    }),
    // Alerts
    getAlerts: builder.query<Alert[], void>({
      query: () => 'alerts',
      providesTags: ['Alert'],
    }),
  }),
});
```

---

## 5️⃣ **API Entegrasyonu Stratejisi**

### **Phase 1: Mock Data (Mevcut)**
```typescript
// src/data/fireAlertMockData.ts
export const mockReports = [/* ... */];
export const mockUser = {/* ... */};
```

### **Phase 2: OpenAPI Integration**
```bash
# Tip üretimi
npx openapi-typescript ./docs/openapi.yaml -o ./src/types/api-types.ts

# Kullanım
import type { paths } from './types/api-types';
type ReportsResponse = paths['/reports']['get']['responses']['200']['content']['application/json'];
```

### **Phase 3: Real API Integration**
```typescript
// Environment-based switching
const useRealAPI = process.env.ENVIRONMENT !== 'development';

export const reportsApi = useRealAPI 
  ? apiSlice.endpoints.getReports
  : mockReportsQuery;
```

---

## 6️⃣ **Harita ve Geo Sorgular**

### **Viewport-Based Queries**
```typescript
// Map ekranında bbox hesaplama
const handleRegionChange = useMemo(
  () => debounce((region: Region) => {
    const bbox = [
      region.longitude - region.longitudeDelta / 2, // west
      region.latitude - region.latitudeDelta / 2,   // south  
      region.longitude + region.longitudeDelta / 2, // east
      region.latitude + region.latitudeDelta / 2,   // north
    ];
    
    refetch({ bbox: bbox.join(','), hours: timeRange });
  }, 500),
  [timeRange]
);
```

### **Performance Optimizations**
- **Debounce:** 500ms gecikme ile istek atma
- **Min Change Threshold:** Küçük pan/zoom'larda istek atmama  
- **Cache Strategy:** 5 dakika cache, background refetch

---

## 7️⃣ **Hata Yönetimi**

### **Global Error Handling**
```typescript
// src/components/common/ErrorBoundary.tsx ✅ Hazır
// src/utils/errorMapper.ts
export const mapApiError = (error: any): string => {
  if (error.status === 401) return 'Oturum süreniz doldu';
  if (error.status === 403) return 'Bu işlem için yetkiniz yok';
  if (error.status === 429) return 'Çok fazla istek. Bekleyin';
  if (error.status >= 500) return 'Sunucu hatası. Tekrar deneyin';
  return 'Beklenmeyen hata oluştu';
};
```

### **User Feedback Strategy**
```typescript
// Toast/Snackbar için
import { Snackbar } from 'react-native-paper';

// Error states
- Network errors: "Bağlantı hatası. Tekrar dene"
- Validation errors: Field-specific messages  
- Critical alerts: Red banner with action button
```

---

## 8️⃣ **Bildirimler ve Realtime**

### **Push Notifications (Phase 5)**
```typescript
// Expo Push Token Registration
const registerPushToken = async () => {
  const token = await Notifications.getExpoPushTokenAsync();
  await dispatch(apiSlice.endpoints.registerPushToken.initiate({
    token: token.data,
    platform: Platform.OS,
  }));
};
```

### **WebSocket Integration (Phase 5)**
```typescript
// Real-time updates
const wsClient = new WebSocket(process.env.WS_URL);
wsClient.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'NEW_REPORT':
      dispatch(apiSlice.util.updateQueryData('getReports', query, (draft) => {
        draft.push(data.report);
      }));
      break;
    case 'CRITICAL_ALERT':
      showCriticalAlert(data);
      break;
  }
};
```

---

## 9️⃣ **Dosya Yükleme Stratejisi**

### **Presigned URL Flow (Phase 4)**
```typescript
// 1. Presigned URL al
const { data: presignedUrl } = await getPresignedUrl.initiate({
  fileName: 'fire-report.jpg',
  contentType: 'image/jpeg',
});

// 2. Dosyayı direkt storage'a yükle
const uploadResponse = await fetch(presignedUrl.url, {
  method: 'PUT',
  body: imageBlob,
  headers: { 'Content-Type': 'image/jpeg' },
});

// 3. Raporu tamamla
await createReport.initiate({
  ...reportData,
  imageUrl: presignedUrl.finalUrl,
});
```

---

## 🔟 **Development Workflow**

### **Mock Service Worker Setup**
```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/v1/reports', (req, res, ctx) => {
    return res(ctx.json(mockReports));
  }),
  rest.post('/api/v1/reports', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),
];

// src/mocks/browser.ts
import { setupWorker } from 'msw';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

### **Environment Toggle**
```typescript
// App.tsx
if (__DEV__ && process.env.USE_MOCKS === 'true') {
  import('./src/mocks/browser').then(({ worker }) => {
    worker.start();
  });
}
```

---

## 1️⃣1️⃣ **Testing Strategy**

### **Test Pyramid**
```typescript
// Unit Tests (70%)
- Utils: stringFormatters, validation functions
- Hooks: usePermissions, custom hooks
- Reducers: Redux slices

// Integration Tests (20%)  
- Screen components with mocked API
- Navigation flows
- Form submissions

// E2E Tests (10%)
- Critical user journeys
- Authentication flow
- Report creation flow
```

---

## 1️⃣2️⃣ **Changelog**

### **v0.1.0 - Phase 1 Foundation ✅ COMPLETE**
- ✅ Redux Toolkit + RTK Query setup
- ✅ React Native Paper theming
- ✅ Navigation structure (Auth + Main tabs)
- ✅ Mock data implementation
- ✅ Error boundaries and loading states
- ✅ Permission management hooks
- ✅ Reusable UI components

### **v0.2.0 - Phase 2 Authentication & Core UI (NEXT)**
- [ ] OpenAPI contract definition
- [ ] Real API integration setup
- [ ] Enhanced auth screens
- [ ] Form validation improvements
- [ ] Environment configuration

### **v0.3.0 - Phase 3 Map Implementation**
- [ ] Map library integration
- [ ] Bbox-based queries
- [ ] Clustering implementation
- [ ] Real-time marker updates

---

## 1️⃣3️⃣ **FAQ**

**Q: Neden Redux Toolkit, Zustand değil?**
A: Enterprise-level cache management, devtools integration ve RTK Query'nin invalidation stratejisi için.

**Q: React Native Paper vs NativeBase?**
A: Material Design 3 uyumluluğu, TypeScript desteği ve React Native ekosistemindeki olgunluk.

**Q: Neden bbox zorunlu?**
A: Harita-merkezli kullanımda viewport odaklı veri çekimi performans avantajı sağlar.

**Q: Mock data ne zaman kaldırılacak?**
A: Backend API'leri hazır oldukça kademeli olarak real API'ye geçiş yapılacak.

---

## 📞 **Destek ve İletişim**

- **Frontend Issues:** GitHub Issues ile
- **API Contract Changes:** Backend ekibi ile koordinasyon
- **Design System:** React Native Paper dokümantasyonu
- **State Management:** Redux Toolkit Query rehberi

---

*Bu doküman her sprint sonunda güncellenir ve backend progress tracker ile senkronize tutulur.*