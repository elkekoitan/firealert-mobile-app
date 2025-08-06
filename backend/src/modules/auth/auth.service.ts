// AuthService (İskelet)
// Şimdilik mock döner; ileride Supabase JWT doğrulaması ve kullanıcı lookup eklenecek.
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  getMeMock(authorization?: string) {
    const token = authorization?.replace(/Bearer\s+/i, '') || null;
    return {
      ok: true,
      mock: true,
      // Not: Sadece geliştirme aşamasında görünür olsun.
      // Üretimde token geri dönülmez, sadece decode/lookup yapılır.
      authorizationHeader: authorization || null,
      tokenPreview: token ? token.slice(0, 12) + '...' : null,
      role: 'guest', // JWT doğrulama sonrası admin/user gibi rolleri döndüreceğiz.
    };
  }
}
