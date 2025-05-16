import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateUserDto } from '@/modules/user/dto/createUser.dto';
import { UpdateUserDto } from '@/modules/user/dto/updateUser.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { PostEntity } from '@/modules/post/entities/post.entity';
import { JwtService } from '@nestjs/jwt';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let createdUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([UserEntity, PostEntity])],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Получаем JWT токен для аутентифицированных запросов
    const jwtService = moduleFixture.get<JwtService>(JwtService);
    jwtToken = jwtService.sign({ userId: 1, username: 'testuser' });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a user', () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password',
        // добавьте остальные обязательные поля
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.username).toEqual(createUserDto.username);
          createdUserId = response.body.id;
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return a user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toEqual(createdUserId);
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer()).get('/users/9999').expect(404);
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update a user', () => {
      const updateUserDto: UpdateUserDto = {
        bio: 'updateduser',
      };

      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateUserDto)
        .expect(200)
        .then((response) => {
          expect(response.body.bio).toEqual(updateUserDto.bio);
        });
    });

    it('should return 401 without JWT token', () => {
      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send({ username: 'updateduser' })
        .expect(401);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .patch('/users/9999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ username: 'updateduser' })
        .expect(404);
    });
  });
});
