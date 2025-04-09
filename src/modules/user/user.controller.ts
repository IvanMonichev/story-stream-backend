import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';
import { CreateUserDto } from '@/modules/user/dto/createUser.dto';
import { UpdateUserDto } from '@/modules/user/dto/updateUser.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { PostEntity } from '@/modules/post/entities/post.entity';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Создание пользователя' })
  @ApiCreatedResponse({ description: 'Пользователь успешно создан', type: UserEntity })
  @ApiBadRequestResponse({ description: 'Проверьте введенные данные' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Получение определенного пользователя' })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiOkResponse({ description: 'Пользователь успешно получен', type: PostEntity })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновить определенного пользователя (JWT)' })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiOkResponse({ description: 'Пользователь успешно обновлен', type: PostEntity })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }
}
