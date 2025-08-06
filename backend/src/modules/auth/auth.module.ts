// AuthModule (İskelet)
// Amaç: Supabase JWT doğrulaması (Bearer), /me endpoint'i, ileride admin guard.
// Not: Bu modül, Supabase public JWKS ile token doğrulama stratejisini ilerleyen adımda ekleyecek.

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminController } from './admin.controller';

@Module({
  controllers: [AuthController, AdminController],
  providers: [AuthService, JwtAuthGuard, AdminGuard],
  exports: [AuthService],
})
export class AuthModule {}
