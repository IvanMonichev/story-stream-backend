import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { CommentEntity } from '@/modules/comment/entities/comment.entity';
import { PostEntity } from '@/modules/post/entities/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async create(text: string, userId: number, postId: number) {
    const existingUser = await this.userRepository.findOneBy({ id: userId });

    if (!existingUser) {
      throw new HttpException(`No user with this id = ${userId} was found`, HttpStatus.BAD_REQUEST);
    }

    const existingPost = await this.postRepository.findOneBy({ id: postId });

    if (!existingPost) {
      throw new HttpException(`No post with this id = ${postId} was found`, HttpStatus.BAD_REQUEST);
    }

    const newComment = this.commentRepository.create({
      text,
      user: existingUser,
      post: existingPost,
    });

    return this.commentRepository.save(newComment);
  }
}
