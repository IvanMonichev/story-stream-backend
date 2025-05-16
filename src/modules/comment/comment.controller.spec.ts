import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCommentDto } from './dto/createComment.dto';
import { hash } from 'bcrypt';

describe('CommentController', () => {
  let controller: CommentController;
  let commentService: CommentService;

  let mockUser;
  let mockRequest;
  let mockComment;

  beforeEach(async () => {
    mockUser = {
      id: 1,
      username: 'Test',
      bio: 'test',
      password: await hash('password', 10),
      posts: [],
      comments: [],
      likes: [],
    };
    mockRequest = { user: mockUser } as any;
    mockComment = {
      id: 1,
      text: 'Test comment',
      user: mockUser,
      post: {
        id: 1,
        comments: [],
        likes: [],
        user: mockUser,
        body: '',
        title: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockComment),
          },
        },
      ],
    }).compile();

    controller = module.get<CommentController>(CommentController);
    commentService = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const createCommentDto: CreateCommentDto = { text: 'Test comment' };
      const postId = 1;

      const result = await controller.create(postId, createCommentDto, mockRequest);

      expect(commentService.create).toHaveBeenCalledWith(
        createCommentDto.text,
        mockUser.id,
        +postId,
      );
      expect(result).toEqual(mockComment);
    });

    it('should apply JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', CommentController.prototype.create);
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });
  });
});
