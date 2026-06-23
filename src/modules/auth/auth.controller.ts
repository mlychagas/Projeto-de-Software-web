import { Controller, Get, Post, Body, Res, Render, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('login')
  @Render('login')
  getLogin(@Req() req: Request) {
    const error = req.query.error === '1' ? 'Credenciais inválidas. Verifique seu e-mail e senha.' : null;
    return { layout: 'layouts/login-layout', error };
  }

  @Public()
  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    try {
      const user = await this.authService.validateUser(body.email, body.password);
      const { access_token } = await this.authService.login(user);
      
      res.cookie('muse_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
        sameSite: 'lax',
      });
      
      return res.redirect('/');
    } catch (error) {
      return res.redirect('/auth/login?error=1');
    }
  }

  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('muse_token');
    return res.redirect('/auth/login');
  }

  @Public()
  @Get('setup-admin')
  async setupAdmin() {
    return this.authService.createAdmin();
  }
}
