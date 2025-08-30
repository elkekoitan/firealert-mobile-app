# FireAlert Flutter

FireAlert - Yangın Erken Uyarı Sistemi (Flutter Versiyonu)

## 📱 Proje Hakkında

FireAlert, yangın erken uyarı sistemi için geliştirilmiş Flutter tabanlı mobil uygulamasıdır. Kullanıcıların yangın raporları oluşturmasına, gerçek zamanlı uyarılar almasına ve harita üzerinde yangın durumlarını takip etmesine olanak sağlar.

## 🚀 Özellikler

- **Harita Entegrasyonu**: Google Maps ile yangın raporlarını görselleştirme
- **Gerçek Zamanlı Uyarılar**: Push bildirimleri ile anlık uyarılar
- **Rapor Oluşturma**: Fotoğraf ve konum ile yangın raporu oluşturma
- **Kullanıcı Kimlik Doğrulama**: Supabase Auth ile güvenli giriş
- **Offline Desteği**: İnternet bağlantısı olmadığında da çalışma
- **Material Design 3**: Modern ve kullanıcı dostu arayüz

## 🛠️ Teknoloji Stack

- **Framework**: Flutter 3.x
- **Dil**: Dart 3.x
- **State Management**: Flutter BLoC
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Harita**: Google Maps Flutter
- **Bildirimler**: Firebase Cloud Messaging
- **Offline Storage**: Hive
- **Navigation**: Go Router

## 📋 Gereksinimler

- Flutter SDK 3.10.0 veya üzeri
- Dart SDK 3.0.0 veya üzeri
- Android Studio / VS Code
- Google Maps API Key
- Supabase Projesi
- Firebase Projesi

## 🔧 Kurulum

1. **Projeyi klonlayın**
   ```bash
   git clone <repository-url>
   cd firealert-flutter
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   flutter pub get
   ```

3. **Environment dosyasını oluşturun**
   ```bash
   cp .env.example .env
   ```

4. **Environment değişkenlerini doldurun**
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   FIREBASE_PROJECT_ID=your_firebase_project_id
   ```

5. **Code generation çalıştırın**
   ```bash
   flutter packages pub run build_runner build
   ```

6. **Uygulamayı çalıştırın**
   ```bash
   flutter run
   ```

## 📁 Proje Yapısı

```
lib/
├── main.dart                 # Uygulama giriş noktası
├── app.dart                  # Ana uygulama widget'ı
├── core/                     # Temel servisler ve modeller
│   ├── constants/           # Sabitler
│   ├── models/              # Veri modelleri
│   ├── services/            # Servis sınıfları
│   └── utils/               # Yardımcı fonksiyonlar
├── features/                # Özellik bazlı modüller
│   ├── auth/               # Kimlik doğrulama
│   ├── map/                # Harita özellikleri
│   ├── reports/            # Rapor yönetimi
│   ├── alerts/             # Uyarı sistemi
│   └── settings/           # Uygulama ayarları
├── shared/                  # Paylaşılan bileşenler
│   ├── widgets/            # Ortak widget'lar
│   ├── themes/             # Tema tanımları
│   └── navigation/         # Navigasyon yapısı
└── generated/              # Üretilen dosyalar
```

## 🔐 Güvenlik

- Tüm API anahtarları environment değişkenlerinde saklanır
- Supabase Row Level Security (RLS) kullanılır
- Kullanıcı verileri şifrelenir
- Push token'ları güvenli şekilde yönetilir

## 📱 Platform Desteği

- ✅ Android (API 21+)
- ✅ iOS (iOS 12.0+)
- ✅ Web (Chrome, Firefox, Safari)

## 🚀 Deployment

### Android
```bash
flutter build apk --release
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

### Web
```bash
flutter build web --release
```

## 🧪 Test

```bash
# Unit testler
flutter test

# Widget testler
flutter test test/widget_test.dart

# Integration testler
flutter drive --target=test_driver/app.dart
```

## 📊 Performans

- Uygulama başlangıç süresi: <3 saniye
- Harita yükleme süresi: <2 saniye
- Rapor gönderme süresi: <5 saniye
- Bellek kullanımı: <200MB

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 📞 İletişim

- **Proje Sahibi**: [Adınız]
- **E-posta**: [email@example.com]
- **GitHub**: [github.com/username]

## 🙏 Teşekkürler

- Flutter ekibine
- Supabase ekibine
- Google Maps ekibine
- Tüm katkıda bulunanlara

---

**FireAlert Flutter** - Yangın erken uyarı sistemini güçlendiriyoruz! 🔥🚨
