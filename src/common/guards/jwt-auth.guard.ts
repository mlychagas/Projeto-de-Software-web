import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(request);
    
    if (!token) {
      const response = context.switchToHttp().getResponse();
      response.redirect('/auth/login');
      return false;
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'museerp_secret_key_2026',
      });
      // Atribui o payload ao objeto request e response.locals para EJS
      request['user'] = payload;
      const response = context.switchToHttp().getResponse();
      response.locals.user = payload;
    } catch {
      const response = context.switchToHttp().getResponse();
      response.clearCookie('muse_token');
      response.redirect('/auth/login');
      return false;
    }
    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.['muse_token'];
  }
}
