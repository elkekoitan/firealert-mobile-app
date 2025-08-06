// AuthController (İskelet)
// /me: Şimdilik mock döner; ileride JwtAuthGuard ile Supabase JWT doğrulaması eklenecek.
import { Controller, Get, Headers, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aktif kullanıcı (mock). JWT guard ile korunur; ileride JWKS doğrulaması eklenecek.' })
  me(@Req() req: any, @Headers('authorization') auth?: string) {
    // Guard user set eder; şimdilik mock
    return {
      ok: true,
      user: req.user,
      me: this.authService.getMeMock(auth),
    };
  }
}
