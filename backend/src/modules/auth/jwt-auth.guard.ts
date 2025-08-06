import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { fetchJwks, findJwkForKid, jwkToPublicKeyPem, verifyJwtRS256 } from './jwks.util';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private jwksUrl: string;
  private cache: { pemByKid: Map<string, string>; fetchedAt?: number } = {
    pemByKid: new Map(),
    fetchedAt: undefined,
  };

  constructor(private readonly config: ConfigService) {
    const projectRef = this.config.supabaseProjectRef; // ör: hddwvgvqxgbtajwhvqqs
    const baseUrl =
      this.config.supabaseUrl ||
      (projectRef ? `https://${projectRef}.supabase.co` : undefined);
    if (!baseUrl) {
      // JWKS doğrulaması yapılamaz, güvenlik için engelle
      throw new Error('SUPABASE_URL veya SUPABASE_PROJECT_REF tanımlı değil.');
    }
    this.jwksUrl = `${baseUrl}/auth/v1/.well-known/jwks.json`;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth: string | undefined =
      req.headers['authorization'] || req.headers['Authorization'];
    if (!auth || !/^Bearer\s+([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)$/i.test(auth)) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = auth.replace(/Bearer\s+/i, '');
    const [h] = token.split('.');
    let header: any;
    try {
      header = JSON.parse(Buffer.from(h.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    } catch {
      throw new UnauthorizedException('Invalid JWT header');
    }
    const kid: string | undefined = header?.kid;
    if (!kid) {
      throw new UnauthorizedException('JWT kid missing');
    }

    // JWKS cache yenile (basit 5 dk TTL)
    const now = Date.now();
    const ttlMs = 5 * 60 * 1000;
    if (!this.cache.fetchedAt || now - this.cache.fetchedAt > ttlMs) {
      const jwks = await fetchJwks(this.jwksUrl).catch(() => undefined);
      if (jwks) {
        this.cache.pemByKid.clear();
        for (const k of jwks.keys) {
          if (k.kty === 'RSA' && k.n && k.e && k.kid) {
            this.cache.pemByKid.set(k.kid, jwkToPublicKeyPem(k));
          }
        }
        this.cache.fetchedAt = now;
      }
    }

    let pem = this.cache.pemByKid.get(kid);
    if (!pem) {
      // Cache’te yoksa JWKS’i tekrar çek ve kid’i ara
      const jwks = await fetchJwks(this.jwksUrl);
      const jwk = findJwkForKid(jwks, kid);
      if (!jwk) throw new UnauthorizedException('JWKS key not found for kid');
      pem = jwkToPublicKeyPem(jwk);
      this.cache.pemByKid.set(kid, pem);
      this.cache.fetchedAt = now;
    }

    // İmzayı doğrula
    let verified;
    try {
      verified = verifyJwtRS256(token, pem);
    } catch {
      throw new UnauthorizedException('JWT signature invalid');
    }

    const payload = verified.payload;
    // İsteğe bağlı iss/aud kontrolü
    const expectedIss = this.config.supabaseJwtIss; // ör: https://<project>.supabase.co/auth/v1
    const expectedAud = this.config.supabaseJwtAud; // genelde 'authenticated'
    if (expectedIss && payload.iss !== expectedIss) {
      throw new ForbiddenException('Invalid token issuer');
    }
    if (expectedAud && payload.aud !== expectedAud) {
      throw new ForbiddenException('Invalid token audience');
    }

    // request.user ata
    req.user = {
      sub: payload.sub,
      email: payload.email,
      app_metadata: payload.app_metadata || {},
      role: payload.app_metadata?.role || 'user',
      // debug amaçlı kısa özet
      tokenKid: kid,
    };

    return true;
  }
}
