import { CreatePostDto } from '@/modules/post/dto/createPost.dto';
import { UpdatePostDto } from '@/modules/post/dto/updatePost.dto';
import { PostEntity } from '@/modules/post/entities/post.entity';
import { PostLikeEntity } from '@/modules/postLike/entities/postLike.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PostLikeEntity)
    private readonly postLikeRepository: Repository<PostLikeEntity>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new HttpException(`No user with this id = ${userId} was found`, HttpStatus.BAD_REQUEST);
    }

    const newPost = this.postRepository.create({
      ...createPostDto,
      user: user,
      likes: [],
      comments: [],
    });

    return this.postRepository.save(newPost);
  }

  async likePost(postId: number, userId: number) {
    const post = await this.postRepository.findOneBy({ id: postId });

    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const like = await this.postLikeRepository.findOne({ where: { user } });

    if (like) {
      await this.postLikeRepository.remove(like);
    } else {
      await this.postLikeRepository.save({ post, user });
    }

    return this.postRepository.save(post);
  }

  async findOne(id: number) {
    return this.postRepository.findOne({
      where: { id },
      relations: { user: true, comments: true, likes: true },
    });
  }

  async getPosts(page: number, size: number) {
    const [data, total] = await this.postRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: size,
      skip: (page - 1) * size,
      relations: { user: true, comments: true, likes: true },
    });

    return {
      posts: data,
      meta: {
        total,
        page,
        pageSize: size,
      },
    };
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const existingPost = await this.postRepository.findOneBy({ id });

    if (!existingPost) {
      throw new HttpException(`No post with this id = ${id} was found`, HttpStatus.BAD_REQUEST);
    }

    await this.postRepository.update(id, { ...updatePostDto });
  }

  async delete(id: number, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    if (post.user.id !== userId) {
      return false;
    }

    await this.postRepository.delete(id);
    return true;
  }
}
