import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import 'dotenv/config';
import * as process from 'process';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? '',
    });
  }

  async validate(payload: any) {
    if (!payload || typeof payload !== 'object' || !payload.id || !payload.username) {
      throw new HttpException('Токен истек или недействителен', HttpStatus.UNAUTHORIZED);
    }
    return { id: payload.id, username: payload.username };
  }
}
