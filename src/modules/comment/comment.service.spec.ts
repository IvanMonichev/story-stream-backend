import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { CommentEntity } from '@/modules/comment/entities/comment.entity';
import { PostEntity } from '@/modules/post/entities/post.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('CommentService', () => {
  let service: CommentService;

  let userRepository: MockRepository<UserEntity>;
  let commentRepository: MockRepository<CommentEntity>;
  let postRepository: MockRepository<PostEntity>;

  beforeEach(async () => {
    userRepository = {
      findOneBy: jest.fn(),
    };
    commentRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    postRepository = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepository },
        { provide: getRepositoryToken(CommentEntity), useValue: commentRepository },
        { provide: getRepositoryToken(PostEntity), useValue: postRepository },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should create a new comment successfully', async () => {
    const mockUser = { id: 1 } as UserEntity;
    const mockPost = { id: 2 } as PostEntity;
    const mockComment = { text: 'Test comment' } as CommentEntity;

    userRepository.findOneBy!.mockResolvedValue(mockUser);
    postRepository.findOneBy!.mockResolvedValue(mockPost);
    commentRepository.create!.mockReturnValue(mockComment);
    commentRepository.save!.mockResolvedValue(mockComment);

    const result = await service.create('Test comment', 1, 2);
    expect(result).toBe(mockComment);
    expect(commentRepository.create).toHaveBeenCalledWith({
      text: 'Test comment',
      user: mockUser,
      post: mockPost,
    });
    expect(commentRepository.save).toHaveBeenCalledWith(mockComment);
  });

  it('should throw error if user not found', async () => {
    userRepository.findOneBy!.mockResolvedValue(null);

    await expect(service.create('Test comment', 999, 1)).rejects.toThrow(
      new HttpException(`No user with this id = 999 was found`, HttpStatus.BAD_REQUEST),
    );
  });

  it('should throw error if post not found', async () => {
    const mockUser = { id: 1 } as UserEntity;
    userRepository.findOneBy!.mockResolvedValue(mockUser);
    postRepository.findOneBy!.mockResolvedValue(null);

    await expect(service.create('Test comment', 1, 999)).rejects.toThrow(
      new HttpException(`No post with this id = 999 was found`, HttpStatus.BAD_REQUEST),
    );
  });
});
