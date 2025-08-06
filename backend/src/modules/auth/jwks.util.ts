// JWKS util (Supabase JWT doğrulama için)
// Supabase JWKS endpoint: https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
// Not: Minimal ve bağımlılıksız doğrulama iskeleti. Prod'da cache + alg/iss/aud kontrolleri şart.

import crypto from 'node:crypto';

export type Jwk = {
  kty: 'RSA';
  kid: string;
  n: string; // base64url
  e: string; // base64url
  alg?: string;
  use?: string;
};

export type Jwks = { keys: Jwk[] };

export async function fetchJwks(jwksUrl: string, signal?: AbortSignal): Promise<Jwks> {
  const res = await fetch(jwksUrl, { signal });
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  return (await res.json()) as Jwks;
}

export function findJwkForKid(jwks: Jwks, kid: string): Jwk | undefined {
  return jwks.keys.find((k) => k.kid === kid);
}

// base64url decode helper
function b64urlToBuffer(b64url: string): Buffer {
  const pad = (str: string) => str + '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = pad(b64url).replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64');
}

export function jwkToPublicKeyPem(jwk: Jwk): string {
  // RS256 varsayımı (n,e)
  const n = b64urlToBuffer(jwk.n);
  const e = b64urlToBuffer(jwk.e);

  // ASN.1 DER (PKCS#1 RSAPublicKey) oluştur
  // RSAPublicKey ::= SEQUENCE { modulus INTEGER, publicExponent INTEGER }
  const encodeInteger = (buf: Buffer) => {
    // Leading 0x00 ekle (pozitif işaret için) gerekiyorsa
    if (buf[0] & 0x80) buf = Buffer.concat([Buffer.from([0x00]), buf]);
    // INTEGER tag (0x02), length, value
    return Buffer.concat([Buffer.from([0x02, buf.length]), buf]);
  };

  const seq = Buffer.concat([encodeInteger(n), encodeInteger(e)]);
  const der = Buffer.concat([Buffer.from([0x30, seq.length]), seq]);
  const pem = `-----BEGIN RSA PUBLIC KEY-----\n${der.toString('base64').match(/.{1,64}/g)?.join('\n')}\n-----END RSA PUBLIC KEY-----\n`;
  return pem;
}

export type VerifiedJwt = {
  header: any;
  payload: any;
};

// Basit RS256 verify (iss/aud kontrolü çağıran tarafta yapılmalı)
export function verifyJwtRS256(token: string, publicKeyPem: string): VerifiedJwt {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');
  const [h, p, s] = parts;

  const header = JSON.parse(Buffer.from(h.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  const payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  const signature = b64urlToBuffer(s);

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${h}.${p}`);
  verifier.end();

  const ok = verifier.verify(publicKeyPem, signature);
  if (!ok) throw new Error('JWT signature invalid');

  return { header, payload };
}
