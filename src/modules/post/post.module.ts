import { TelegramModule } from '@/modules/telegram/telegram.module';
import { TelegramService } from '@/modules/telegram/telegram.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '@/modules/post/entities/post.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { PostService } from '@/modules/post/post.service';
import { PostController } from '@/modules/post/post.controller';
import { PostLikeEntity } from '@/modules/postLike/entities/postLike.entity';
import { CommentEntity } from '@/modules/comment/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity, PostEntity, UserEntity, PostLikeEntity]),
    TelegramModule,
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
