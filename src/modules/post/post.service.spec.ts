import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostEntity } from '@/modules/post/entities/post.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { CommentEntity } from '@/modules/comment/entities/comment.entity';
import { PostLikeEntity } from '@/modules/postLike/entities/postLike.entity';
import { TelegramService } from '@/modules/telegram/telegram.service';
import { Repository, ObjectLiteral } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('PostService', () => {
  let service: PostService;

  let postRepository: MockRepository<PostEntity>;
  let userRepository: MockRepository<UserEntity>;
  let commentRepository: MockRepository<CommentEntity>;
  let postLikeRepository: MockRepository<PostLikeEntity>;
  let telegramService: {
    notifyPostCreated: jest.Mock;
    notifyPostUpdated: jest.Mock;
    notifyPostDeleted: jest.Mock;
  };

  beforeEach(async () => {
    postRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    userRepository = {
      findOneBy: jest.fn(),
    };
    commentRepository = {
      remove: jest.fn(),
    };
    postLikeRepository = {
      findOne: jest.fn(),
      remove: jest.fn(),
      save: jest.fn(),
    };
    telegramService = {
      notifyPostCreated: jest.fn(),
      notifyPostUpdated: jest.fn(),
      notifyPostDeleted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: getRepositoryToken(PostEntity), useValue: postRepository },
        { provide: getRepositoryToken(UserEntity), useValue: userRepository },
        { provide: getRepositoryToken(CommentEntity), useValue: commentRepository },
        { provide: getRepositoryToken(PostLikeEntity), useValue: postLikeRepository },
        { provide: TelegramService, useValue: telegramService },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  describe('create', () => {
    it('should create post successfully', async () => {
      const dto = { title: 'Title', content: 'Content' };
      const user = { id: 1 } as UserEntity;
      const newPost = { ...dto, user, likes: [], comments: [] } as unknown as PostEntity;
      const savedPost = { ...newPost, id: 10 };

      userRepository.findOneBy!.mockResolvedValue(user);
      postRepository.create!.mockReturnValue(newPost);
      postRepository.save!.mockResolvedValue(savedPost);
      telegramService.notifyPostCreated.mockResolvedValue(undefined);

      const result = await service.create(dto as any, 1);
      expect(result).toEqual(savedPost);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(postRepository.create).toHaveBeenCalledWith({
        ...dto,
        user,
        likes: [],
        comments: [],
      });
      expect(postRepository.save).toHaveBeenCalledWith(newPost);
      expect(telegramService.notifyPostCreated).toHaveBeenCalledWith(savedPost);
    });

    it('should throw if user not found', async () => {
      userRepository.findOneBy!.mockResolvedValue(null);
      await expect(service.create({} as any, 999)).rejects.toThrow(
        new HttpException(`No user with this id = 999 was found`, HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('likePost', () => {
    it('should add a like if not liked', async () => {
      const post = { id: 1 } as PostEntity;
      const user = { id: 2 } as UserEntity;
      postRepository.findOneBy!.mockResolvedValue(post);
      userRepository.findOneBy!.mockResolvedValue(user);
      postLikeRepository.findOne!.mockResolvedValue(null);
      postLikeRepository.save!.mockResolvedValue({});
      postRepository.save!.mockResolvedValue(post);

      const result = await service.likePost(1, 2);
      expect(postLikeRepository.save).toHaveBeenCalledWith({ post, user });
      expect(postRepository.save).toHaveBeenCalledWith(post);
      expect(result).toBe(post);
    });

    it('should remove like if already liked', async () => {
      const post = { id: 1 } as PostEntity;
      const user = { id: 2 } as UserEntity;
      const like = { id: 5 };
      postRepository.findOneBy!.mockResolvedValue(post);
      userRepository.findOneBy!.mockResolvedValue(user);
      postLikeRepository.findOne!.mockResolvedValue(like);
      postLikeRepository.remove!.mockResolvedValue(undefined);
      postRepository.save!.mockResolvedValue(post);

      const result = await service.likePost(1, 2);
      expect(postLikeRepository.remove).toHaveBeenCalledWith(like);
      expect(postRepository.save).toHaveBeenCalledWith(post);
      expect(result).toBe(post);
    });

    it('should throw if post not found', async () => {
      postRepository.findOneBy!.mockResolvedValue(null);
      await expect(service.likePost(1, 1)).rejects.toThrow(
        new HttpException('Post not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw if user not found', async () => {
      postRepository.findOneBy!.mockResolvedValue({} as PostEntity);
      userRepository.findOneBy!.mockResolvedValue(null);
      await expect(service.likePost(1, 1)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('findOne', () => {
    it('should return post with relations', async () => {
      const post = { id: 1 } as PostEntity;
      postRepository.findOne!.mockResolvedValue(post);

      const result = await service.findOne(1);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { user: true, comments: { user: true }, likes: { user: true } },
      });
      expect(result).toBe(post);
    });
  });

  describe('getPosts', () => {
    it('should return paginated posts', async () => {
      const posts = [{ id: 1 }] as PostEntity[];
      postRepository.findAndCount!.mockResolvedValue([posts, 10]);

      const result = await service.getPosts(2, 5);
      expect(postRepository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 5,
        skip: 5,
        relations: { user: true, comments: { user: true }, likes: { user: true } },
      });
      expect(result).toEqual({
        posts,
        meta: {
          total: 10,
          page: 2,
          pageSize: 5,
        },
      });
    });
  });

  describe('update', () => {
    it('should update post and notify telegram', async () => {
      const updateDto = { title: 'Updated title' };
      const existingPost = { id: 1 } as PostEntity;

      postRepository.findOneBy!.mockResolvedValue(existingPost);
      postRepository.update!.mockResolvedValue(undefined);
      telegramService.notifyPostUpdated.mockResolvedValue(undefined);

      await service.update(1, updateDto as any);

      expect(postRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(postRepository.update).toHaveBeenCalledWith(1, updateDto);
      expect(telegramService.notifyPostUpdated).toHaveBeenCalledWith({ id: 1, ...updateDto });
    });

    it('should throw if post not found', async () => {
      postRepository.findOneBy!.mockResolvedValue(null);
      await expect(service.update(999, {} as any)).rejects.toThrow(
        new HttpException(`No post with this id = 999 was found`, HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('delete', () => {
    it('should delete post if user is owner', async () => {
      const post = {
        id: 1,
        user: { id: 2 },
        likes: [{ id: 1 }],
        comments: [{ id: 1 }],
      } as unknown as PostEntity;

      postRepository.findOne!.mockResolvedValue(post);
      postLikeRepository.remove!.mockResolvedValue(undefined);
      commentRepository.remove!.mockResolvedValue(undefined);
      postRepository.remove!.mockResolvedValue(undefined);
      telegramService.notifyPostDeleted.mockResolvedValue(undefined);

      const result = await service.delete(1, 2);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { user: true, likes: true, comments: true },
      });
      expect(postLikeRepository.remove).toHaveBeenCalledWith(post.likes);
      expect(commentRepository.remove).toHaveBeenCalledWith(post.comments);
      expect(postRepository.remove).toHaveBeenCalledWith(post);
      expect(telegramService.notifyPostDeleted).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false if user is not owner', async () => {
      const post = {
        id: 1,
        user: { id: 2 },
        likes: [],
        comments: [],
      } as unknown as PostEntity;

      postRepository.findOne!.mockResolvedValue(post);

      const result = await service.delete(1, 3);
      expect(result).toBe(false);
    });

    it('should throw if post not found', async () => {
      postRepository.findOne!.mockResolvedValue(null);
      await expect(service.delete(1, 1)).rejects.toThrow(
        new HttpException('Post not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
