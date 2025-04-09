import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CreatePostDto } from '@/modules/post/dto/createPost.dto';
import { UpdatePostDto } from '@/modules/post/dto/updatePost.dto';
import { PostEntity } from '@/modules/post/entities/post.entity';
import { postLimit } from '@/modules/post/post.const';
import { PostService } from '@/modules/post/post.service';
import { FastifyRequestWithUser } from '@/types/request';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: 'Создание поста (JWT)' })
  @ApiCreatedResponse({ description: 'Пост успешно создан', type: PostEntity })
  @ApiBadRequestResponse({ description: 'Проверьте введенные данные' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createPostDto: CreatePostDto, @Req() request: FastifyRequestWithUser) {
    return this.postService.create(createPostDto, request.user.id);
  }

  @ApiOperation({ summary: 'Получение определенного поста' })
  @ApiParam({ name: 'id', description: 'ID поста' })
  @ApiOkResponse({ description: 'Пост успешно получен', type: PostEntity })
  @ApiNotFoundResponse({ description: 'Пост не найден' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @ApiOperation({ summary: 'Получить по пагинации посты' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы',
    example: 1,
  })
  @ApiQuery({
    name: 'size',
    required: false,
    description: 'Размер страницы',
    example: 10,
  })
  @ApiOkResponse({
    description: 'Посты успешно получены',
    type: PostEntity,
    isArray: true,
  })
  @Get()
  async getPosts(@Query('page') page = 1, @Query('size') size = postLimit) {
    return this.postService.getPosts(+page, +size);
  }

  @ApiOperation({ summary: 'Поставить (убрать) лайк определенному посту (JWT)' })
  @ApiParam({ name: 'id', description: 'ID поста' })
  @ApiOkResponse({ description: 'Пост успешно лайкнут', type: PostEntity })
  @ApiNotFoundResponse({ description: 'Пост не найден' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/like')
  async likePost(@Param('id') id: string, @Req() request: FastifyRequestWithUser) {
    return this.postService.likePost(+id, +request.user.id);
  }

  @ApiOperation({ summary: 'Обновить определенный пост (JWT)' })
  @ApiParam({ name: 'id', description: 'ID поста' })
  @ApiOkResponse({ description: 'Пост успешно обновлен', type: PostEntity })
  @ApiNotFoundResponse({ description: 'Пост не найден' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @ApiOperation({ summary: 'Удалить определенный пост (JWT)' })
  @ApiParam({ name: 'id', description: 'ID поста' })
  @ApiOkResponse({ description: 'Пост успешно удален' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() request: FastifyRequestWithUser) {
    return this.postService.delete(+id, request.user.id);
  }
}
