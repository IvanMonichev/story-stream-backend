import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentModule } from '../src/modules/comment/comment.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { CommentEntity } from '../src/modules/comment/entities/comment.entity';
import { UserEntity } from '../src/modules/user/entities/user.entity';
import { PostEntity } from '../src/modules/post/entities/post.entity';
import { CreateCommentDto } from '../src/modules/comment/dto/createComment.dto';

describe('CommentController (e2e)', () => {
  let app: INestApplication;
  let commentRepository: Repository<CommentEntity>;
  let userRepository: Repository<UserEntity>;
  let postRepository: Repository<PostEntity>;
  let authToken: string;
  let testUser: UserEntity;
  let testPost: PostEntity;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [CommentEntity, UserEntity, PostEntity],
          synchronize: true,
        }),
        CommentModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    commentRepository = moduleFixture.get('CommentEntityRepository');
    userRepository = moduleFixture.get('UserEntityRepository');
    postRepository = moduleFixture.get('PostEntityRepository');

    // Create test user and get auth token
    testUser = await userRepository.save({
      username: 'testuser',
      password: 'testpass',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpass' });

    authToken = loginResponse.body.access_token;

    // Create test post
    testPost = await postRepository.save({
      title: 'Test Post',
      content: 'Test Content',
      userId: testUser.id,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await commentRepository.clear();
  });

  describe('POST /comments/:postId', () => {
    it('should create a comment', async () => {
      const createCommentDto: CreateCommentDto = { text: 'Test comment' };

      return request(app.getHttpServer())
        .post(`/comments/${testPost.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createCommentDto)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.text).toEqual(createCommentDto.text);
          expect(response.body.userId).toEqual(testUser.id);
          expect(response.body.postId).toEqual(testPost.id);
        });
    });

    it('should return 401 when not authenticated', async () => {
      const createCommentDto: CreateCommentDto = { text: 'Test comment' };

      return request(app.getHttpServer())
        .post(`/comments/${testPost.id}`)
        .send(createCommentDto)
        .expect(401);
    });

    it('should return 400 when text is empty', async () => {
      const createCommentDto = { text: '' };

      return request(app.getHttpServer())
        .post(`/comments/${testPost.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createCommentDto)
        .expect(400);
    });
  });
});
