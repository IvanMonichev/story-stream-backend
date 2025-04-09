import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import { LocalAuthGuard } from '@/modules/auth/guards/local-auth.guard';
import { FastifyRequestWithUser } from '@/modules/auth/auth.types';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Аутентификация пользователя' })
  @ApiOkResponse({ description: 'Пользователь успешно аутентифицирован' })
  @ApiBadRequestResponse({ description: 'Проверьте введенные данные' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() request: FastifyRequestWithUser) {
    const tokens = await this.authService.login(request);

    return {
      accessToken: tokens?.accessToken,
    };
  }

  @ApiOperation({ summary: 'Проверка токена' })
  @ApiOkResponse({ description: 'Токен действителен' })
  @ApiBadRequestResponse({ description: 'Проверьте введенные данные' })
  @UseGuards(JwtAuthGuard)
  @Get('health-check')
  async healthCheck(@Req() request: FastifyRequestWithUser) {
    return request.user;
  }
}
