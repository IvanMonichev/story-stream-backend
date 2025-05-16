import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PostModule } from '@/modules/post/post.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { PostEntity } from '@/modules/post/entities/post.entity';
import { CreateUserDto } from '@/modules/user/dto/createUser.dto';
import { CreatePostDto } from '@/modules/post/dto/createPost.dto';
import { UpdatePostDto } from '@/modules/post/dto/updatePost.dto';

describe('PostController (e2e)', () => {
  let app: INestApplication;
  let postRepository: Repository<PostEntity>;
  let authToken: string;
  let userId: number;
  let postId: number;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [PostEntity],
          synchronize: true,
        }),
        PostModule,
        AuthModule,
        UserModule,
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    postRepository = moduleFixture.get('PostEntityRepository');

    // Create a test user
    const userDto: CreateUserDto = {
      username: 'testuser',
      password: 'password123',
    };
    await request(app.getHttpServer()).post('/users').send(userDto).expect(201);

    // Login to get JWT token
    const loginDto: { login: string; password: string } = {
      login: 'test@example.com',
      password: 'password123',
    };
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(200);

    authToken = loginResponse.body.access_token;
    userId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/posts (POST)', () => {
    it('should create a post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        body: 'Test Content',
      };

      const response = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPostDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toEqual(createPostDto.title);
      expect(response.body.body).toEqual(createPostDto.body);
      expect(response.body.authorId).toEqual(userId);

      postId = response.body.id;
    });

    it('should return 401 when not authenticated', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        body: 'Test Content',
      };

      await request(app.getHttpServer()).post('/posts').send(createPostDto).expect(401);
    });

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('/posts/:id (GET)', () => {
    it('should get a post by id', async () => {
      const response = await request(app.getHttpServer()).get(`/posts/${postId}`).expect(200);

      expect(response.body.id).toEqual(postId);
      expect(response.body.title).toEqual('Test Post');
    });

    it('should return 404 for non-existent post', async () => {
      await request(app.getHttpServer()).get('/posts/9999').expect(404);
    });
  });

  describe('/posts (GET)', () => {
    it('should get posts with pagination', async () => {
      // Create additional posts for testing
      for (let i = 1; i <= 5; i++) {
        await postRepository.save({
          title: `Post ${i}`,
          content: `Content ${i}`,
          authorId: userId,
        });
      }

      const response = await request(app.getHttpServer()).get('/posts?page=2&size=2').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBeDefined();
    });

    it('should use default pagination values', async () => {
      const response = await request(app.getHttpServer()).get('/posts').expect(200);

      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('/posts/:id/like (PATCH)', () => {
    it('should like/unlike a post', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.likes).toContain(userId);

      // Unlike the post
      const unlikeResponse = await request(app.getHttpServer())
        .patch(`/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(unlikeResponse.body.likes).not.toContain(userId);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).patch(`/posts/${postId}/like`).expect(401);
    });

    it('should return 404 for non-existent post', async () => {
      await request(app.getHttpServer())
        .patch('/posts/9999/like')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/posts/:id (PATCH)', () => {
    it('should update a post', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Post',
      };

      const response = await request(app.getHttpServer())
        .patch(`/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatePostDto)
        .expect(200);

      expect(response.body.title).toEqual(updatePostDto.title);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/posts/${postId}`)
        .send({ title: 'Unauthorized Update' })
        .expect(401);
    });

    it('should return 404 for non-existent post', async () => {
      await request(app.getHttpServer())
        .patch('/posts/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Non-existent' })
        .expect(404);
    });
  });

  describe('/posts/:id (DELETE)', () => {
    it('should delete a post', async () => {
      await request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify the post is deleted
      await request(app.getHttpServer()).get(`/posts/${postId}`).expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      // Create another post to delete
      const newPost = await postRepository.save({
        title: 'To Delete',
        content: 'Content',
        authorId: userId,
      });

      await request(app.getHttpServer()).delete(`/posts/${newPost.id}`).expect(401);
    });

    it('should return 404 for non-existent post', async () => {
      await request(app.getHttpServer())
        .delete('/posts/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
