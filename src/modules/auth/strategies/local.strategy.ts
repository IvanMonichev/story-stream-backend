import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const fieldName = configService.get('FIELD_NAME');
    super({ usernameField: 'login', passwordField: fieldName });
  }

  async validate(login: string, password: string) {
    const user = await this.authService.validateUser({ login, password });
    if (!user) {
      throw new BadRequestException();
    }
    return user;
  }
}
