import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostEntity } from './entities/post.entity';

describe('PostController', () => {
  let controller: PostController;
  let postService: PostService;

  const mockUser = {
    id: 1,
    username: 'Test',
    bio: 'test',
    password: 'hashed_password',
    posts: [],
    comments: [],
    likes: [],
  };

  const mockPost: PostEntity = {
    id: 1,
    title: 'Test Post',
    body: 'Test Content',
    user: mockUser,
    likes: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  };

  const mockRequest = {
    user: mockUser,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockPost),
            findOne: jest.fn().mockResolvedValue(mockPost),
            getPosts: jest.fn().mockResolvedValue([mockPost]),
            likePost: jest.fn().mockResolvedValue(mockPost),
            update: jest.fn().mockResolvedValue(mockPost),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
    postService = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        body: 'Test Content',
      };

      const result = await controller.create(createPostDto, mockRequest);
      expect(postService.create).toHaveBeenCalledWith(createPostDto, mockUser.id);
      expect(result).toEqual(mockPost);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const result = await controller.findOne('1');
      expect(postService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPost);
    });
  });

  describe('getPosts', () => {
    it('should return an array of posts with default pagination', async () => {
      const result = await controller.getPosts();
      expect(postService.getPosts).toHaveBeenCalledWith(1, expect.any(Number));
      expect(result).toEqual([mockPost]);
    });

    it('should return an array of posts with custom pagination', async () => {
      const result = await controller.getPosts(2, 5);
      expect(postService.getPosts).toHaveBeenCalledWith(2, 5);
      expect(result).toEqual([mockPost]);
    });
  });

  describe('likePost', () => {
    it('should like/unlike a post', async () => {
      const result = await controller.likePost('1', mockRequest);
      expect(postService.likePost).toHaveBeenCalledWith(1, mockUser.id);
      expect(result).toEqual(mockPost);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Post',
      };

      const result = await controller.update('1', updatePostDto);
      expect(postService.update).toHaveBeenCalledWith(1, updatePostDto);
      expect(result).toEqual(mockPost);
    });
  });

  describe('delete', () => {
    it('should delete a post', async () => {
      await expect(controller.delete('1', mockRequest)).resolves.toBeUndefined();
      expect(postService.delete).toHaveBeenCalledWith(1, mockUser.id);
    });
  });

  describe('JwtAuthGuard', () => {
    it('should be applied to protected routes', () => {
      const guards = Reflect.getMetadata('__guards__', controller.create) || [];
      expect(guards.some((guard) => guard === JwtAuthGuard)).toBeTruthy();

      const likeGuards = Reflect.getMetadata('__guards__', controller.likePost) || [];
      expect(likeGuards.some((guard) => guard === JwtAuthGuard)).toBeTruthy();

      const updateGuards = Reflect.getMetadata('__guards__', controller.update) || [];
      expect(updateGuards.some((guard) => guard === JwtAuthGuard)).toBeTruthy();

      const deleteGuards = Reflect.getMetadata('__guards__', controller.delete) || [];
      expect(deleteGuards.some((guard) => guard === JwtAuthGuard)).toBeTruthy();
    });
  });
});
