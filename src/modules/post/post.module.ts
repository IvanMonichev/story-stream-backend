import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '@/modules/post/entities/post.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { PostService } from '@/modules/post/post.service';
import { PostController } from '@/modules/post/post.controller';
import { PostLikeEntity } from '@/modules/postLike/entities/postLike.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, UserEntity, PostLikeEntity])],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
