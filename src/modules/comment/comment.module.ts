import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from '@/modules/comment/entities/comment.entity';
import { CommentService } from '@/modules/comment/comment.service';
import { CommentController } from '@/modules/comment/comment.controller';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { PostEntity } from '@/modules/post/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity, PostEntity, UserEntity])],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
