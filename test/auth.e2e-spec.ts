import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  const testUser = {
    username: 'testuser',
    password: 'testpass',
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [UserEntity],
          synchronize: true,
        }),
        AuthModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET') || 'test-secret',
            signOptions: { expiresIn: '1h' },
          }),
          inject: [ConfigService],
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get('UserEntityRepository');
    await userRepository.save({
      username: testUser.username,
      password: '$2b$10$5B9FB.4Idhk2H1dLI9xeIutY8WATBCuMMPLdMMTyhp/3..hwAW9mW', // testpass
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should return access token with valid credentials', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('accessToken');
          expect(typeof response.body.accessToken).toBe('string');
        });
    });

    it('should return 401 with invalid credentials', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'wronguser',
          password: 'wrongpass',
        })
        .expect(401);
    });

    it('should return 400 when data is invalid', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: '',
          password: '',
        })
        .expect(400);
    });
  });

  describe('GET /auth/health-check', () => {
    it('should return user data with valid token', async () => {
      const loginResponse = await request(app.getHttpServer()).post('/auth/login').send(testUser);

      return request(app.getHttpServer())
        .get('/auth/health-check')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('username', testUser.username);
        });
    });

    it('should return 401 without token', async () => {
      return request(app.getHttpServer()).get('/auth/health-check').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      return request(app.getHttpServer())
        .get('/auth/health-check')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
