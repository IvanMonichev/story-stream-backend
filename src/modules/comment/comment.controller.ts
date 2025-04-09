import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CommentService } from '@/modules/comment/comment.service';
import { CommentEntity } from '@/modules/comment/entities/comment.entity';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { FastifyRequestWithUser } from '@/types/request';
import { CreateCommentDto } from '@/modules/comment/dto/createComment.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({ summary: 'Добавление комментария' })
  @ApiParam({ name: 'postId', description: 'ID поста' })
  @ApiCreatedResponse({ description: 'Комментарий успешно добавлен', type: CommentEntity })
  @ApiBadRequestResponse({ description: 'Проверьте введенные данные' })
  @UseGuards(JwtAuthGuard)
  @Post(':postId')
  async create(
    @Param('postId') postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() request: FastifyRequestWithUser,
  ) {
    return this.commentService.create(createCommentDto.text, request.user.id, +postId);
  }
}
